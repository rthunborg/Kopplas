import {retainUnresolvedBookingAttempt} from "@/features/resources/booking-editor-input";
/** Attempt identity survives an unknown response. A different proposal needs a new command. */
export type ResolverAttempt<T> = { request: T; status: "ready" | "pending" | "unknown" | "confirmed" };
export function resolverAttemptAfter<T>(attempt: ResolverAttempt<T>, result: "success" | "failure" | "unknown"): ResolverAttempt<T> {
  return { request: attempt.request, status: result === "success" ? "confirmed" : result === "unknown" ? "unknown" : "ready" };
}
export function currentResolverResponse(current: number, response: number): boolean { return current === response; }
export function resolverAttemptForFailure<T>(attempt:ResolverAttempt<T>,code:string,wasUnknown:boolean):ResolverAttempt<T>|null {
  return retainUnresolvedBookingAttempt(code,wasUnknown)?resolverAttemptAfter(attempt,"unknown"):null;
}
export function resolverOutcomeNotice(outcome:"accepted"|"remaining"|"resolved"):string {
  return outcome==="remaining"?"Bokningen har ändrats. Den valda konflikten finns fortfarande kvar.":outcome==="accepted"?"Konflikten har accepterats.":"Konflikten har åtgärdats.";
}
