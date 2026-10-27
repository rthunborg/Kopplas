/**
 * Story 15.2 RED contracts, never a successful fake implementation.
 * The only runtime fixture below throws until an implementation author binds it.
 * Existing guarded resourcePage supports the configured production Next host.
 * playwright-utils deviation: config=true, package absent from package.json;
 * library-integration-mandate's second gate is closed. Framework adoption is
 * separate work; no unavailable dependency or merged-fixtures import is added.
 */
import { test as base, expect } from "./resource-cdp-attachment";
import type { CDPSession, Page, TestInfo } from "@playwright/test";
import { createHash, randomUUID } from "node:crypto";
import { createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture, makeAuthedServerClient } from "../../factories/tenants";
import { adminQuery, adminSession } from "../../factories/admin-sql";
import { runCommand } from "@/server/commands/envelope";
import { createBookingSeries } from "@/server/commands/bookings/create-booking-series";
import { bookingCommand, bookingInput } from "../../support/bookings-atdd";
import { previewBookingSeries } from "@/server/bookings/series-conflicts";
import { seriesCommandPayload, type BookingSeriesInput } from "@/server/commands/bookings/series-validation";

export type Slot = {
  readonly date: string;
  readonly startsLocal: string;
  readonly endsLocal: string;
  readonly startsAt: string;
  readonly endsAt: string;
};

/** Independent Mon–Sat November oracle; ordinary shifts never reopen a Sunday. */
export function novemberSlots(count: 8 | 12 | 13): readonly Slot[] {
  return ["2026-11-02","2026-11-03","2026-11-04","2026-11-05","2026-11-06","2026-11-07",
    "2026-11-09","2026-11-10","2026-11-11","2026-11-12","2026-11-13","2026-11-14","2026-11-16"].slice(0,count).map(date => {
    return { date, startsLocal: `${date}T09:00`, endsLocal: `${date}T10:00`,
      startsAt: `${date}T08:00:00.000000Z`, endsAt: `${date}T09:00:00.000000Z` };
  });
}

/** Test-only normalized SQL projection; these are NOT proposed production columns. */
export type SeriesRow = {
  readonly id: string;
  readonly predecessorId: string | null;
  readonly lastNominalDate: string;
  readonly revision: number;
};
export type OccurrenceRow = {
  readonly id: string;
  readonly seriesId: string;
  readonly nominalDate: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly description: string;
  readonly status: "planned" | "cancelled";
  readonly isException: boolean;
  readonly assigneeIds: readonly string[];
};
export type ConflictRow = {
  readonly id: string;
  readonly logicalId: string;
  readonly occurrenceIds: readonly string[];
  readonly status: "open" | "accepted";
};
export type OutcomeRow = {
  readonly commandId: string;
  readonly addressedSeriesId: string;
  readonly successorSeriesId: string | null;
  readonly occurrenceIds: readonly string[];
  readonly payloadDigest: string;
};
export type SeriesSnapshot = {
  readonly series: readonly SeriesRow[];
  readonly occurrences: readonly OccurrenceRow[];
  readonly conflicts: readonly ConflictRow[];
  readonly outcomes: readonly OutcomeRow[];
  readonly audit: readonly { readonly id: string; readonly targetId: string; readonly command: string; readonly correlationId: string }[];
  /** Canonical complete owned SQL rows, including private outcome/assignment data. */
  readonly rawOwnedRows: Readonly<Record<string, readonly Record<string, unknown>[]>>;
};
export type WarningOracle = {
  readonly logicalId: string;
  readonly dates: readonly string[];
  readonly label: string;
  readonly glyphLabel: string;
  readonly selected: boolean;
};
export type SeriesScenario = {
  readonly tenantId: string;
  readonly credentials: { readonly email: string; readonly password: string };
  readonly description: string;
  readonly assigneeId: string;
  readonly workRoleId: string;
  readonly warnings: readonly WarningOracle[];
  /** Independent real fixture oracle for count=13 and the latest description. */
  readonly latestWarnings: readonly WarningOracle[];
  readonly obsoleteWarningLabel: string;
  readonly glyphLabelsByDate: Readonly<Record<string, string>>;
  /** Must be an eight-occurrence series created via real checked setup commands. */
  readonly existingOccurrenceId: string;
  readonly replacementAssigneeId?: string;
};
export type Attempt = {
  readonly commandId: string;
  readonly sourceSeriesId: string | null;
  readonly proposedSeriesId: string | null;
  readonly proposedOccurrenceIds: readonly string[];
  readonly candidateDigest: string;
  readonly reviewDecisionDigest: string;
};
export type ConfirmedSave = {
  /** Resolves only after real action settlement and independent SQL readback. */
  readonly committed: Promise<Attempt>;
};
export type PreviewRace = {
  readonly olderStarted: Promise<void>;
  readonly newerStarted: Promise<void>;
  /** Preserve the actual Next action queue: release old transport, then newest. */
  readonly releaseOlder: () => Promise<void>;
  readonly releaseNewer: () => Promise<void>;
  readonly settled: Promise<void>;
};

export interface BookingSeriesHarness {
  /**
   * Local-stack-only, owned tenant/actor/person/job/correlation fixture; deterministic
   * Nov 2 onward 09–10 Stockholm, Mon–Sat weekly slots and actual weekly shifts.
   * warnings-after-ten: real peer/absence facts warn at visible slot 2 AND slot 12.
   * preview-race: count=12 and count=13 have distinguishable real warning sets.
   * existing-series: checked production create, never direct fake series outcome.
   * Reuse admin-sql/tenant helpers; .auth credentials may be READ, never overwritten
   * or role-mutated. Do not invoke existing broad global setup from this adapter.
   */
  seed(mode: "clean" | "warnings-after-ten" | "preview-race" | "existing-series" | "gesture-series" | "retained-assignee"): Promise<SeriesScenario>;
  /**
   * Independent read-only SQL transaction using adminQuery/adminSession. Read
   * booking_series, real bookings, assignees, complete conflict associations,
   * durable command outcomes and audit for owned tenant/IDs; canonical order and
   * UTC microseconds. Include all owned rows, including disconnected/orphan rows.
   * Do not derive from a response, opaque receipt, UI, or production expansion.
   */
  snapshot(): Promise<SeriesSnapshot>;
  /** Arm actual Next server-action observation BEFORE navigation or triggering. */
  observeNextSave(): Promise<ConfirmedSave>;
  /** Real commit + SQL proof, discard ONLY returned transport; no mocked success. */
  loseNextCommittedSaveResponseOnce(): Promise<ConfirmedSave>;
  /** Fail before backend mutation; explicitly report observed transport settlement. */
  failNextSaveBeforeCommitOnce(): Promise<{ readonly failed: Promise<void> }>;
  failNextPreviewOnce(): Promise<{ readonly failed: Promise<void> }>;
  holdNextPreview(candidate: { readonly count: 12; readonly description: string }): Promise<{ readonly started: Promise<void>; readonly release: () => Promise<void> }>;
  raceNextPreviews(): Promise<PreviewRace>;
  /** Change owned real conflict facts AFTER genuine preview; preserve UI candidate. */
  invalidateCurrentReviewByOwnedFactChange(): Promise<void>;
  invalidateCurrentSeriesByOwnedOccurrenceEdit(): Promise<void>;
  /** Real stale rejection, never an invented API status or synthesized receipt. */
  observeNextStaleSaveRejection(): Promise<{ readonly rejected: Promise<void> }>;
  /** Captures actual immutable business attempts; excludes transport-only headers. */
  attempts(): readonly Attempt[];
  /** Assert observer drained through real lifecycle/action settlement, without sleeps. */
  settleTransport(): Promise<void>;
  /** Finally-release every route/hold, then remove ONLY owned fixture rows/users. */
  dispose(): Promise<void>;
}

/**
 * Bound to actual Next action traffic and independent durable SQL snapshots.
 * Never invent /api/booking-series, fulfill a
 * success response, loop standalone saves, or use an outcome receipt as SQL proof.
 */
async function bindBookingSeriesHarness(page: Page, info: TestInfo): Promise<BookingSeriesHarness> {
  void info;
  const fx=await createRoleAwarePhaseAFixture(); const tenantId=fx.base.tenantA.id;
  const profileId=randomUUID(),roleId=randomUUID(),marker=`series-browser-${randomUUID()}`;
  const [{id:membership}]=await adminQuery<{id:string}>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2",[tenantId,fx.users.montor.id]);
  await adminQuery("insert into public.work_roles(id,tenant_id,display_name,cost_rate_ore,sell_rate_ore) values($1,$2,$3,20000,40000)",[roleId,tenantId,marker]);
  await adminQuery("insert into public.person_profiles(id,tenant_id,membership_id,default_work_role_id) values($1,$2,$3,$4)",[profileId,tenantId,membership,roleId]);
  for(let weekday=1;weekday<=7;weekday++)await adminQuery("insert into public.person_work_hours(tenant_id,person_profile_id,entry_kind,weekday,starts_at,ends_at) values($1,$2,'weekly_shift',$3,'08:00','16:00')",[tenantId,profileId,weekday]);
  const pending=new Set<Promise<void>>(),observed:Attempt[]=[];const releases:(()=>void)[]=[];
  const confirmations:{resolve:(value:Attempt)=>void;reject:(error:unknown)=>void}[]=[];
  let stale:{resolve:()=>void;reject:(error:unknown)=>void}|null=null;
  const deferred=<T,>()=>{let resolve!:(value:T)=>void;let reject!:(error:unknown)=>void;const promise=new Promise<T>((done,fail)=>{resolve=done;reject=fail;});return{promise,resolve,reject};};
  let scenario:SeriesScenario;let concurrentRevision=0;
  const peerByDate=new Map<string,string>(),warningOracles:WarningOracle[]=[],latestOracles:WarningOracle[]=[];
  const expectedLogicalIds=new Map<string,string>();
  const inputs=new Map<import("@playwright/test").Request,Record<string,unknown>>();const observationErrors:unknown[]=[];
  const originalLossRequests=new WeakSet<import("@playwright/test").Request>();let armOriginalLossRequest=false;
  type Paused={requestId:string;request:{method:string;headers:Record<string,string>;postData?:string};responseStatusCode?:number};
  let cdp:CDPSession|null=null;let interception:((event:Paused,input:Record<string,unknown>)=>Promise<boolean>)|null=null;
  async function disableInterception(){interception=null;await cdp?.send("Fetch.disable");}
  async function armInterception(stage:"Request"|"Response",handler:(event:Paused,input:Record<string,unknown>)=>Promise<boolean>){
    if(interception)throw new Error("A browser transport barrier is already armed");
    if(!cdp){cdp=await page.context().newCDPSession(page);cdp.on("Fetch.requestPaused",(event:Paused)=>{
      const work=(async()=>{
        let input:Record<string,unknown>|undefined;try{input=JSON.parse(event.request.postData??"null")?.[0];}catch{}
        const action=Object.keys(event.request.headers).some(key=>key.toLowerCase()==="next-action");
        if(event.request.method==="POST"&&action&&input&&typeof input.commandId==="string"&&interception&&await interception(event,input))return;
        await cdp!.send("Fetch.continueRequest",{requestId:event.requestId});
      })();pending.add(work);work.catch(error=>observationErrors.push(error)).finally(()=>pending.delete(work));
    });}
    interception=handler;await cdp.send("Fetch.enable",{patterns:[{urlPattern:"*",requestStage:stage}]});
  }
  const attemptOf=(input:Record<string,unknown>,ids:readonly string[]):Attempt=>{
    const {commandId:_command,editorReview:_review,...candidate}=input;void _command;void _review;
    return {commandId:String(input.commandId),sourceSeriesId:input.sourceSeriesId as string|null??null,
    proposedSeriesId:input.seriesId as string|null??null,proposedOccurrenceIds:ids,
    candidateDigest:createHash("sha256").update(JSON.stringify(candidate)).digest("hex"),
    reviewDecisionDigest:createHash("sha256").update(JSON.stringify((input.editorReview as {decision:unknown})?.decision)).digest("hex")};};
  async function committedAttempt(input:Record<string,unknown>):Promise<Attempt>{
    let ids:string[]|null=null;
    // Response headers may precede the action result. The loss barrier must
    // observe the actual committed command before failing its original response.
    await expect.poll(async()=>{
      if(input.seriesId){
        const addressed=input.sourceSeriesId??input.seriesId;
        const [row]=await adminQuery<{result:{occurrenceIds:string[]}|null}>("select outcomes->$2->'result' result from public.booking_series where tenant_id=$1 and id=$3",[tenantId,input.commandId,addressed]);
        ids=row?.result?.occurrenceIds??null;
      }else{
        const [row]=await adminQuery<{id:string}>("select id from public.bookings where tenant_id=$1 and id=$2 and update_outcomes ? $3",[tenantId,input.bookingId,input.commandId]);
        ids=row?[row.id]:null;
      }
      return ids!==null;
    },{timeout:15000,message:"Actual action must have its exact durable SQL command outcome"}).toBe(true);
    return attemptOf(input,ids!);
  }
  const onRequest=(request:import("@playwright/test").Request)=>{
    if(request.method()!=="POST"||!request.headers()["next-action"])return;
    let input:Record<string,unknown>|undefined;
    try{input=JSON.parse(request.postData()??"null")?.[0];}catch{}
    if(input&&typeof input.seriesId==="string"&&input.rule){
      // IDs come from the actual business attempt; conflict expectations use only
      // independently seeded peer IDs, fixed local dates/windows and key format.
      const count=(input.rule as {count?:number}).count??0;
      const expectations=[...peerByDate].filter(([date])=>novemberSlots(13).slice(0,count).some(slot=>slot.date===date)).map(([date,peer],index)=>{
        const hex=createHash("sha256").update(`kopplas.booking-series.slot.v1\0${input!.seriesId}\0${date}`).digest("hex");
        const occurrence=`${hex.slice(0,8)}-${hex.slice(8,12)}-5${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
        const identity=JSON.stringify(["double_booking",[peer,occurrence].sort(),[profileId],`${date}T08:00:00.000000Z`,`${date}T09:00:00.000000Z`]);
        const logicalId=JSON.stringify([identity,profileId]);expectedLogicalIds.set(`v1:${createHash("sha256").update(logicalId).digest("hex")}`,logicalId);
        return{logicalId,dates:[date],label:`Dubbelbokning · ${fx.users.montor.email}`,glyphLabel:"Konflikter: 1",selected:index===0};
      });
      // The test combines the independently known date/window with person/rule.
      const target=count===13?latestOracles:warningOracles;target.splice(0,target.length,...expectations);
    }
    if(input&&typeof input.commandId==="string"&&input.editorReview){
      // Mark the original synchronously at request admission, before either
      // Playwright response delivery or the asynchronous CDP response barrier.
      if(armOriginalLossRequest){originalLossRequests.add(request);armOriginalLossRequest=false;}
      inputs.set(request,input);
    }
  };
  async function observeResponse(response:import("@playwright/test").Response){
    const input=inputs.get(response.request());if(!input)return;inputs.delete(response.request());
    if(originalLossRequests.has(response.request()))return;
    if(!response.ok())throw new Error("Actual reviewed save returned a failed HTTP response");
    if(stale){
      const waiting=stale;
      try{
        await expect(page.getByTestId("booking-save-error")).toHaveText("Förutsättningarna har ändrats. Uppdatera varningarna och granska dem igen.",{timeout:15000});
        waiting.resolve();
      }catch(error){waiting.reject(error);throw error;}finally{if(stale===waiting)stale=null;}
      return;
    }
    // An actual response plus rendered confirmation AND independent SQL is
    // positive proof. Never wait for an opaque Flight body or count HTTP200 alone.
    await expect(page.getByTestId("booking-save-status")).toHaveText("Sparad i systemet",{timeout:15000});
    const attempt=await committedAttempt(input);observed.push(attempt);for(const confirm of confirmations.splice(0))confirm.resolve(attempt);
  }
  const onResponse=(response:import("@playwright/test").Response)=>{const work=observeResponse(response);pending.add(work);work.catch(error=>{observationErrors.push(error);for(const confirm of confirmations.splice(0))confirm.reject(error);if(stale){stale.reject(error);stale=null;}}).finally(()=>pending.delete(work));};
  page.on("request",onRequest);page.on("response",onResponse);
  async function snapshot():Promise<SeriesSnapshot>{
    return adminSession(async({query})=>{
      await query("begin isolation level repeatable read read only");
      try{
        const raw:Record<string,Record<string,unknown>[]>={};
        for(const table of ["booking_series","bookings","booking_assignees","booking_conflicts","audit_events"]){const result=await query(`select to_jsonb(t) row from public.${table} t where tenant_id=$1 order by id`,[tenantId]);raw[table]=result.map(r=>r.row);}
        const result=await query(`select b.id,b.series_id,b.nominal_date::text,
         to_char(b.starts_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') starts_at,
         to_char(b.ends_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') ends_at,b.description,b.status,b.is_exception,
         coalesce((select jsonb_agg(person_profile_id order by person_profile_id) from public.booking_assignees a where a.booking_id=b.id),'[]') assignees
         from public.bookings b where b.tenant_id=$1 and b.series_id is not null order by b.nominal_date`,[tenantId]);
        const occurrences:OccurrenceRow[]=result.map(row=>({id:row.id,seriesId:row.series_id,nominalDate:row.nominal_date,startsAt:row.starts_at,endsAt:row.ends_at,description:row.description,status:row.status,isException:row.is_exception,assigneeIds:row.assignees}));
        const series=raw.booking_series!.map(row=>({id:String(row.id),predecessorId:row.predecessor_id as string|null,revision:Number(row.version),
          lastNominalDate:row.ends_before?new Date(Date.parse(`${String(row.ends_before)}T00:00:00Z`)-86400000).toISOString().slice(0,10):occurrences.filter(o=>o.seriesId===row.id).at(-1)?.nominalDate??""}));
        const outcomes:OutcomeRow[]=raw.booking_series!.flatMap(row=>Object.entries(row.outcomes as Record<string,{digest:string;result:{successorSeriesId:string|null;occurrenceIds:string[]}}>).map(([commandId,value])=>({commandId,addressedSeriesId:String(row.id),successorSeriesId:value.result.successorSeriesId,occurrenceIds:value.result.occurrenceIds,payloadDigest:value.digest})));
        await query("commit");
        return{series,occurrences,outcomes,conflicts:raw.booking_conflicts!.map(row=>({id:String(row.id),logicalId:expectedLogicalIds.get(String(row.natural_key))??String(row.natural_key),occurrenceIds:[row.booking_id,row.related_booking_id].filter(Boolean) as string[],status:row.status as "open"|"accepted"})),
          audit:raw.audit_events!.map(row=>({id:String(row.id),targetId:String(row.target_id),command:String(row.command),correlationId:String(row.correlation_id)})),rawOwnedRows:raw};
      }catch(error){await query("rollback");throw error;}
    });
  }
  return{
    async seed(mode){
      scenario={tenantId,credentials:fx.base.adminA,description:marker,assigneeId:profileId,workRoleId:roleId,warnings:warningOracles,latestWarnings:latestOracles,obsoleteWarningLabel:"",glyphLabelsByDate:Object.fromEntries(novemberSlots(13).map(slot=>[slot.date,["2026-11-03","2026-11-14","2026-11-16"].includes(slot.date)?"Konflikter: 1":"Inga konflikter"])),existingOccurrenceId:""};
      if(mode==="warnings-after-ten"||mode==="preview-race"){
        const client=await makeAuthedServerClient(fx.base.adminA);
        for(const date of ["2026-11-03","2026-11-14","2026-11-16"]){
          const result=await bookingCommand("create",client,bookingInput([profileId],{startsAt:`${date}T08:00:00.000000Z`,endsAt:`${date}T09:00:00.000000Z`,description:`${marker} peer ${date}`}));
          if(!result.ok)throw new Error(`Checked peer fixture failed: ${result.code}`);peerByDate.set(date,result.data.bookingId);
        }
      }
      if(mode==="gesture-series"||mode==="retained-assignee"){
        const replacement=randomUUID();
        const [member]=await adminQuery<{id:string}>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2",[tenantId,fx.users.projektledare.id]);
        await adminQuery("insert into public.person_profiles(id,tenant_id,membership_id,default_work_role_id) values($1,$2,$3,$4)",[replacement,tenantId,member!.id,roleId]);
        for(let weekday=1;weekday<=7;weekday++)await adminQuery("insert into public.person_work_hours(tenant_id,person_profile_id,entry_kind,weekday,starts_at,ends_at) values($1,$2,'weekly_shift',$3,'08:00','16:00')",[tenantId,replacement,weekday]);
        scenario={...scenario,replacementAssigneeId:replacement};
      }
      if(mode==="existing-series"||mode==="gesture-series"||mode==="retained-assignee"){
        const input:BookingSeriesInput={commandId:randomUUID(),seriesId:randomUUID(),sourceSeriesId:null,expectedVersion:null,pivotOccurrenceId:null,
          rule:{preset:"weekly",weekdays:[1,2,3,4,5,6],startDate:"2026-11-02",startTime:"09:00:00",endTime:"10:00:00",endDayOffset:0,allDay:false,timeZone:"Europe/Stockholm",count:8},
          template:{startsAt:"2026-11-02T08:00:00.000000Z",endsAt:"2026-11-02T09:00:00.000000Z",description:marker,allDay:false,status:"planned",assigneeIds:[profileId],workRoleId:roleId,jobId:null,customerId:null,facilityId:null,contactId:null,seriesId:null,occurrenceIndex:null,isException:false}};
        const client=await makeAuthedServerClient(fx.base.adminA);
        const preview=await previewBookingSeries(client,{p_tenant_id:tenantId,p_actor_id:fx.base.adminA.id,p_correlation_id:randomUUID(),p_command_id:input.commandId,p_input:seriesCommandPayload(input)},input);
        if(preview.warnings.length)throw new Error("Independent clean series fixture unexpectedly warned");
        const result=await runCommand(createBookingSeries,{client:client as never,input:{...input,editorReview:{receipt:preview.receipt,decision:{acknowledged:false,reviewedLogicalIds:[],selectedLogicalIds:[],reason:""}}}});
        if(!result.ok)throw new Error(`Checked existing-series fixture failed: ${result.code}`);
        scenario={...scenario,existingOccurrenceId:result.data.occurrenceIds[0]!};
        if(mode==="retained-assignee"){
          const changed=await bookingCommand("update",client,bookingInput([scenario.replacementAssigneeId!],{bookingId:scenario.existingOccurrenceId,startsAt:input.template.startsAt,endsAt:input.template.endsAt,workRoleId:roleId,description:marker}));
          if(!changed.ok)throw new Error("Checked reassigned pivot fixture failed");
          await adminQuery("update public.person_profiles set archived_at=clock_timestamp() where tenant_id=$1 and id=$2",[tenantId,profileId]);
        }
      }
      return scenario;
    },snapshot,
    async observeNextSave(){const done=deferred<Attempt>();confirmations.push(done);return{committed:done.promise};},
    async loseNextCommittedSaveResponseOnce(){
      const done=deferred<Attempt>();armOriginalLossRequest=true;
      await armInterception("Response",async(event,input)=>{
        if(!input.editorReview)return false;
        try{
          // The original POST already ran. SQL, not transport status, proves commit.
          const attempt=await committedAttempt(input);observed.push(attempt);
          await cdp!.send("Fetch.failRequest",{requestId:event.requestId,errorReason:"Failed"});await disableInterception();done.resolve(attempt);return true;
        }catch(error){done.reject(error);throw error;}
      });return{committed:done.promise};
    },
    async failNextSaveBeforeCommitOnce(){
      const done=deferred<void>();await armInterception("Request",async(event,input)=>{if(!input.editorReview)return false;
        await cdp!.send("Fetch.failRequest",{requestId:event.requestId,errorReason:"Failed"});await disableInterception();done.resolve();return true;});return{failed:done.promise};
    },
    async failNextPreviewOnce(){
      const done=deferred<void>();await armInterception("Request",async(event,input)=>{if(input.editorReview||!input.rule)return false;
        await cdp!.send("Fetch.failRequest",{requestId:event.requestId,errorReason:"Failed"});await disableInterception();done.resolve();return true;});return{failed:done.promise};
    },
    async holdNextPreview(candidate){
      const started=deferred<void>(),release=deferred<void>();releases.push(()=>release.resolve());
      await armInterception("Response",async(event,input)=>{if(input.editorReview||(input.rule as {count?:number})?.count!==candidate.count||(input.template as {description?:string})?.description!==candidate.description)return false;
        started.resolve();await release.promise;await cdp!.send("Fetch.continueRequest",{requestId:event.requestId});await disableInterception();return true;});
      return{started:started.promise,release:async()=>release.resolve()};
    },
    async raceNextPreviews(){
      const older=deferred<void>(),newer=deferred<void>(),releaseOlder=deferred<void>(),releaseNewer=deferred<void>(),settled=deferred<void>();let index=0;
      releases.push(()=>releaseOlder.resolve(),()=>releaseNewer.resolve());
      await armInterception("Response",async(event,input)=>{if(input.editorReview||!input.rule)return false;
        const first=index++===0;if(first){older.resolve();await releaseOlder.promise;}else{newer.resolve();await releaseNewer.promise;}
        await cdp!.send("Fetch.continueRequest",{requestId:event.requestId});if(!first){await disableInterception();settled.resolve();}return true;});
      return{olderStarted:older.promise,newerStarted:newer.promise,releaseOlder:async()=>releaseOlder.resolve(),releaseNewer:async()=>releaseNewer.resolve(),settled:settled.promise};
    },
    async invalidateCurrentReviewByOwnedFactChange(){await adminQuery("update public.person_work_hours set ends_at='08:30' where tenant_id=$1 and person_profile_id=$2",[tenantId,profileId]);},
    async invalidateCurrentSeriesByOwnedOccurrenceEdit(){
      const [row]=await adminQuery<{id:string;starts_at:Date;ends_at:Date}>("select id,starts_at,ends_at from public.bookings where tenant_id=$1 and series_id is not null order by nominal_date offset 1 limit 1",[tenantId]);
      if(!row)throw new Error("Missing owned series occurrence");
      const client=await makeAuthedServerClient(fx.base.adminA);
      const result=await bookingCommand("update",client,bookingInput([profileId],{bookingId:row.id,startsAt:row.starts_at.toISOString(),endsAt:row.ends_at.toISOString(),workRoleId:roleId,description:`${marker} concurrent ${++concurrentRevision}`}));
      if(!result.ok)throw new Error("Checked concurrent series occurrence edit failed");
    },
    async observeNextStaleSaveRejection(){const done=deferred<void>();stale={resolve:()=>done.resolve(),reject:done.reject};return{rejected:done.promise};},
    attempts:()=>observed,
    async settleTransport(){await Promise.all([...pending]);if(observationErrors.length)throw observationErrors[0];},
    async dispose(){for(const release of releases)release();await disableInterception();await Promise.allSettled([...pending]);await cdp?.detach();page.off("request",onRequest);page.off("response",onResponse);await cleanupRoleAwarePhaseAFixture(fx);},
  };
}

// playwright-utils deviation: absent package; established guarded fixture composition.
export const test = base.extend<{ readonly bookingSeries: BookingSeriesHarness }>({
  bookingSeries: async ({ resourcePage }, provide, info) => {
    const harness = await bindBookingSeriesHarness(resourcePage, info);
    try { await provide(harness); } finally { await harness.dispose(); }
  },
});
export { expect };
