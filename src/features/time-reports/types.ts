/** Safe client DTOs; private command digests and actor/tenant authority never cross this seam. */

export type ReportInput = { readonly attemptId: string; readonly date: string; readonly minutes: number; readonly note: string | null; readonly bookingId: string | null; readonly jobId: string | null };

export type AnnotationInput = { readonly attemptId: string; readonly reportId: string; readonly expectedRevision: number; readonly note: string | null };

export type TimeReport = { readonly id: string; readonly userId: string; readonly date: string; readonly minutes: number; readonly note: string | null; readonly bookingId: string | null; readonly jobId: string | null; readonly status: "submitted"; readonly bookedMinutesAtFiling: number | null; readonly deltaMinutes?: number | null; readonly reviewNote: string | null; readonly reviewRevision: number; readonly reviewedBy: string | null; readonly reviewedAt: string | null; readonly createdAt: string; readonly personLabel?: string; readonly jobLabel?: string };

export type TimeReportBookingPrefill = { readonly bookingId: string; readonly startsAt: string; readonly endsAt: string; readonly minutes: number | null; readonly jobId: string | null; readonly date: string; readonly jobLabel?: string };

export type TimeReportActionDescriptor = { readonly canReportOwn: boolean; readonly ownSelfPersonIds: readonly string[] };

export type TimeReportQuery = { readonly week?: string; readonly weekStart?: string; readonly mode?: "own" | "review"; readonly personId?: string; readonly jobId?: string; readonly prefillBookingId?: string };

export type TimeReportReadData = { readonly userId: string; readonly canReportOwn: boolean; readonly canReview: boolean; readonly weekStart: string; readonly reports: readonly TimeReport[]; readonly bookedDates: readonly string[]; readonly jobs: readonly {id:string;label:string}[]; readonly people: readonly {id:string;label:string}[]; readonly bookings: readonly TimeReportBookingPrefill[]; readonly prefill: TimeReportBookingPrefill | null; readonly totalMinutes: number; readonly missingDates: readonly string[]; readonly byPerson: readonly {userId:string;minutes:number}[]; readonly byJob: readonly {jobId:string|null;minutes:number}[] };

export type TimeReportReadResult = {readonly ok:true;readonly status:"success";readonly data:TimeReportReadData}|{readonly ok:false;readonly status:"error";readonly code:string;readonly message?:string};

export type TimeReportMutationResult = {readonly status:"success";readonly reportId:string}|{readonly status:"error";readonly code:string;readonly message:string;readonly uncertain:boolean};

export type TimeReportDraft = {readonly date:string;readonly hours:string;readonly note:string;readonly bookingId:string|null;readonly jobId:string|null;readonly mode?:"hours"|"interval";readonly startsAtLocal?:string;readonly endsAtLocal?:string;readonly exactPrefillUnavailable?:boolean};

