"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TimeReportEntry } from "@/components/time-reports/TimeReportEntry";
import { readMyDayAction } from "@/features/my-day/actions";
import { isCurrentMyDayRequest, MY_DAY_MAX_DATE, MY_DAY_MIN_DATE, myDayPeriod, shiftMyDayWeek, validateMyDaySelection } from "@/features/my-day/domain";
import type { MyDayReadResult } from "@/features/my-day/types";
import type { TimeReportBookingPrefill } from "@/features/time-reports/types";
import { MyDayBookingCard, myDayControlClass } from "./MyDayBookingCard";

const dateFormat = new Intl.DateTimeFormat("sv-SE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const dayFormat = new Intl.DateTimeFormat("sv-SE", { weekday: "short", day: "numeric", timeZone: "UTC" });
const roleLabels = { arbetsledare: "Arbetsledare", member: "Medlem", booking_assignee: "Tilldelad via bokning" };
const interactiveOrigin = 'button,input,select,textarea,a,label,[role="button"],[role="dialog"],[contenteditable="true"]';

/** Opaque server context controls component lifetime, never read/write authority.
 * A resolved identity change discards the previous lists AND report owner. A
 * transient unresolved read retains the same owner and displays its failure. */
export function MyDayWorkspace({ initial, initialDate }: { readonly initial: MyDayReadResult; readonly initialDate: string }) {
  const [session, setSession] = useState(() => ({ source: initial, initial, key: initial.renderContextKey ?? "unresolved", date: initialDate }));
  const current = session.source === initial ? session : { source: initial, initial, key: initial.renderContextKey ?? session.key, date: initialDate };
  if (current !== session) setSession(current);
  return <MyDaySession key={current.key} initial={current.initial} initialDate={current.date} contextKey={current.key}
    onContextChange={fresh => setSession(previous => previous.key !== current.key ? previous : ({ ...previous, initial: fresh, key: fresh.renderContextKey ?? previous.key, date: fresh.ok ? fresh.data.date : previous.date }))} />;
}

function MyDaySession({ initial, initialDate, contextKey, onContextChange }: { readonly initial: MyDayReadResult; readonly initialDate: string; readonly contextKey: string; readonly onContextChange: (result: MyDayReadResult) => void }) {
  const [date, setDate] = useState(initialDate);
  const [mode, setMode] = useState<"day" | "week">(initial.ok ? initial.data.mode : "day");
  const [read, setRead] = useState<{ source: MyDayReadResult; result: MyDayReadResult | null }>(() => ({ source: initial, result: initial }));
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [report, setReport] = useState<{ prefill: TimeReportBookingPrefill; serial: number } | null>(null);
  const request = useRef(0);
  const selection = useRef({ date: initialDate, mode: initial.ok ? initial.data.mode : "day" as "day" | "week" });
  const reportHost = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const gestureSurface = useRef<HTMLElement>(null);
  const touch = useRef<{ x: number; y: number; atTop: boolean } | null>(null);
  // RSC today data cannot replace a different selected day/week. The existing
  // onSaved action independently refreshes that exact current selection.
  const result = read.source === initial || (initial.ok && (initial.data.date !== date || initial.data.mode !== mode)) ? read.result : initial;
  const data = result?.ok ? result.data : null;
  const jobsActive = initial.ok && initial.data.jobsActive;
  const weekDates = myDayPeriod(date, "week").dates;
  function canMoveWeek(offset: number) { try { shiftMyDayWeek(date, offset); return true; } catch { return false; } }

  // The stable heading is the Dialog's return-focus target even when saving
  // removes the invoking card. The report owner never belongs to fetched lists.
  useEffect(() => {
    if (report) { heading.current?.focus(); reportHost.current?.querySelector<HTMLButtonElement>(":scope > button")?.click(); }
  }, [report]);
  useEffect(() => () => { request.current += 1; }, []);
  useEffect(() => {
    const node = gestureSurface.current;
    if (!node) return;
    const move = (event: TouchEvent) => {
      if (event.touches.length !== 1) { touch.current = null; return; }
      const start = touch.current, end = event.touches[0];
      if (!start || !end) return;
      const dx = end.clientX - start.x, dy = end.clientY - start.y;
      if ((Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5) || (start.atTop && dy > 12 && dy > Math.abs(dx) * 1.5)) event.preventDefault();
    };
    node.addEventListener("touchmove", move, { passive: false });
    return () => node.removeEventListener("touchmove", move);
  }, []);

  async function refresh(nextDate = selection.current.date, nextMode = selection.current.mode, noticePage = 1) {
    try { validateMyDaySelection(nextDate); myDayPeriod(nextDate, nextMode); }
    catch { setDateError("Välj ett datum inom det tillgängliga intervallet."); return; }
    setDateError(null);
    const current = ++request.current;
    selection.current = { date: nextDate, mode: nextMode };
    setDate(nextDate); setMode(nextMode); setLoading(true); setRead({ source: initial, result: null });
    try {
      const fresh = await readMyDayAction({ date: nextDate, mode: nextMode, noticePage });
      if (isCurrentMyDayRequest(request.current, current, selection.current, { date: nextDate, mode: nextMode })) {
        if (fresh.renderContextKey && fresh.renderContextKey !== contextKey) onContextChange(fresh);
        else setRead({ source: initial, result: fresh });
      }
    } catch {
      if (isCurrentMyDayRequest(request.current, current, selection.current, { date: nextDate, mode: nextMode })) setRead({ source: initial, result: { ok: false, code: "UNAVAILABLE", message: "Anslutning krävs" } });
    } finally {
      if (isCurrentMyDayRequest(request.current, current, selection.current, { date: nextDate, mode: nextMode })) setLoading(false);
    }
  }

  function moveWeek(offset: number) {
    try { void refresh(shiftMyDayWeek(selection.current.date, offset)); }
    catch { setDateError("Välj ett datum inom det tillgängliga intervallet."); }
  }

  return <section aria-label="Min dag" className="mx-auto min-w-0 max-w-3xl space-y-6 bg-white p-4 text-zinc-950 sm:p-6">
    <header ref={gestureSurface} className="space-y-4"
      onTouchStart={event => {
        touch.current = null;
        if (event.touches.length !== 1 || (event.target as HTMLElement).closest(interactiveOrigin)) return;
        const point = event.touches[0]; if (point) touch.current = { x: point.clientX, y: point.clientY, atTop: window.scrollY === 0 };
      }}
      onTouchCancel={() => { touch.current = null; }}
      onTouchEnd={event => {
        const start = touch.current; touch.current = null;
        const end = event.changedTouches[0]; if (!start || !end || event.touches.length !== 0 || event.changedTouches.length !== 1) return;
        const dx = end.clientX - start.x, dy = end.clientY - start.y;
        if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) moveWeek(dx < 0 ? 1 : -1);
        else if (start.atTop && dy > 80 && dy > Math.abs(dx) * 1.5) void refresh();
      }}>
      <h1 ref={heading} tabIndex={-1} className="text-3xl font-medium tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2">Min dag</h1>
      <p className="text-xl font-medium">{dateFormat.format(new Date(`${date}T12:00:00Z`))}</p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 space-y-1"><span className="block text-sm font-medium">Datum</span><input aria-label="Datum" aria-invalid={dateError ? true : undefined} aria-describedby={dateError ? "my-day-date-error" : undefined} min={MY_DAY_MIN_DATE} max={MY_DAY_MAX_DATE} type="date" className={`${myDayControlClass} max-w-full`} value={date} onChange={event => { const value = event.target.value; if (value) void refresh(value); else setDateError("Välj ett giltigt datum."); }} /></label>
        <button type="button" className={myDayControlClass} disabled={loading} onClick={() => void refresh()}>Uppdatera</button>
      </div>
      {dateError ? <p id="my-day-date-error" role="alert">{dateError}</p> : null}
      <div className="flex flex-wrap gap-3" aria-label="Veckonavigering">
        <button type="button" className={myDayControlClass} disabled={!canMoveWeek(-1)} onClick={() => moveWeek(-1)}>Föregående vecka</button>
        <button type="button" className={myDayControlClass} disabled={!canMoveWeek(1)} onClick={() => moveWeek(1)}>Nästa vecka</button>
      </div>
      <div className="flex flex-wrap gap-1" aria-label="Välj dag">{weekDates.map(day => <button type="button" key={day} aria-pressed={date === day && mode === "day"} className={`min-h-12 min-w-11 flex-1 rounded-lg border px-1 py-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 ${date === day && mode === "day" ? "border-zinc-950 bg-zinc-100 font-medium" : "border-zinc-400 bg-white"}`} onClick={() => void refresh(day, "day")}>{dayFormat.format(new Date(`${day}T12:00:00Z`))}</button>)}</div>
      <button type="button" aria-pressed={mode === "week"} className={myDayControlClass} onClick={() => void refresh(date, mode === "week" ? "day" : "week")}>{mode === "week" ? "Visa vald dag" : "Visa hela veckan"}</button>
    </header>
    {loading ? <p role="status">Hämtar planeringen…</p> : null}
    {result && !result.ok ? <div role="alert" className="space-y-3 rounded-lg border border-zinc-400 p-4"><p>{result.message}</p><button type="button" className={myDayControlClass} onClick={() => void refresh()}>Försök igen</button></div> : null}
    {data?.noticesUnavailable ? <p role="alert">Planeringsändringar kunde inte hämtas. Försök uppdatera.</p> : null}
    {data && (data.notices.length > 0 || data.noticePage > 1) ? <section aria-label="Ändringar i planeringen" className="space-y-3 rounded-lg border border-zinc-400 bg-zinc-100 p-4"><h2 className="text-xl font-medium">Ändringar i planeringen</h2>{data.notices.map(notice => <div key={notice.id} className="space-y-1"><p className="font-medium">{notice.title}</p><p>{notice.body}</p><Link href={notice.route} className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2">Öppna planeringen</Link></div>)}<p className="text-sm">Ändringar, sida {data.noticePage}</p>{data.noticePage > 1 ? <button type="button" className={myDayControlClass} onClick={() => void refresh(date, mode, data.noticePage - 1)}>Föregående ändringar</button> : null}{data.noticesHasMore ? <button type="button" className={myDayControlClass} onClick={() => void refresh(date, mode, data.noticePage + 1)}>Visa fler ändringar</button> : null}</section> : null}
    <section aria-label="Agenda" aria-busy={loading} className="space-y-4"><h2 className="text-xl font-medium">{mode === "week" ? "Veckans bokningar" : "Dagens bokningar"}</h2>{data ? data.bookings.length ? data.bookings.map(booking => <MyDayBookingCard key={booking.id} booking={booking} canReportOwn={data.canReportOwn} onReport={prefill => setReport(previous => ({ prefill, serial: (previous?.serial ?? 0) + 1 }))} />) : <p>inga bokningar ännu</p> : null}</section>
    {(data?.jobsActive ?? jobsActive) ? <section aria-label="Mina jobb" className="space-y-4"><h2 className="text-xl font-medium">Mina jobb</h2>{data ? data.activeJobs?.length ? data.activeJobs.map(job => <article key={job.id} data-testid={`my-day-job-${job.id}`} className="space-y-2 rounded-lg border border-zinc-200 p-4"><Link href={`/jobs/${job.id}`} className="inline-flex min-h-11 items-center break-words text-xl font-medium underline underline-offset-4 focus-visible:outline-2">{job.title}</Link><p className="break-words text-sm text-zinc-700">{job.customerLabel ?? "Kund saknas"}</p><p>{job.status === "in_progress" ? "Pågår" : "Skapad"} · {roleLabels[job.myRole]}</p></article>) : <p>Inga tilldelade jobb</p> : null}</section> : null}
    <div ref={reportHost} className="[&>button]:hidden">{report ? <TimeReportEntry prefill={report.prefill} jobs={report.prefill.jobId ? [{ id: report.prefill.jobId, label: report.prefill.jobLabel ?? "Kopplat jobb" }] : []} onSaved={() => void refresh()} /> : null}</div>
  </section>;
}
