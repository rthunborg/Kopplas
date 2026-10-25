import { validateLocalDate } from "@/features/scheduling/time-zone";
import type { AnnotationInput, ReportInput } from "./types";

export const MAX_REPORT_MINUTES = 2147483647;

export function isReportDate(value: unknown): value is string { if(typeof value!=="string")return false;try{validateLocalDate(value);return true;}catch{return false;} }

/** Decimal arithmetic avoids rounding fractional minutes into accepted time. */

export function parseReportHours(value: string): number | null {

  const match = /^(\d{1,10})(?:[.,](\d{1,10}))?$/.exec(value.trim()); if(!match)return null;

  const fraction=match[2]??"", scale=BigInt(10)**BigInt(fraction.length);

  const numerator=(BigInt(match[1]!)*scale+BigInt(fraction||"0"))*BigInt(60);

  if(numerator%scale!==BigInt(0))return null;const minutes=numerator/scale;

  return minutes>BigInt(0)&&minutes<=BigInt(MAX_REPORT_MINUTES)?Number(minutes):null;

}

export function normalizeReportNote(value: unknown): {ok:true;value:string|null}|{ok:false} {

  if(value===null||value===undefined)return {ok:true,value:null};if(typeof value!=="string")return {ok:false};const note=value.trim();return note.length<=2000?{ok:true,value:note||null}:{ok:false};

}

const uuid=(value:unknown):value is string=>typeof value==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export function validateReportInput(value:unknown): {ok:true;data:ReportInput}|{ok:false;code:"VALIDATION_FAILED"} {

  const invalid={ok:false as const,code:"VALIDATION_FAILED" as const};if(!value||typeof value!=="object")return invalid;const row=value as Record<string,unknown>,note=normalizeReportNote(row.note);

  if(!uuid(row.attemptId)||!isReportDate(row.date)||typeof row.minutes!=="number"||!Number.isInteger(row.minutes)||row.minutes<1||row.minutes>MAX_REPORT_MINUTES||!note.ok||(row.bookingId!=null&&!uuid(row.bookingId))||(row.jobId!=null&&!uuid(row.jobId)))return invalid;

  return {ok:true,data:{attemptId:row.attemptId,date:row.date,minutes:row.minutes,note:note.value,bookingId:row.bookingId as string|null??null,jobId:row.jobId as string|null??null}};

}

export function validateAnnotationInput(value:unknown): {ok:true;data:AnnotationInput}|{ok:false;code:"VALIDATION_FAILED"} {

  const invalid={ok:false as const,code:"VALIDATION_FAILED" as const};if(!value||typeof value!=="object")return invalid;const row=value as Record<string,unknown>,note=normalizeReportNote(row.note);

  if(!uuid(row.attemptId)||!uuid(row.reportId)||typeof row.expectedRevision!=="number"||!Number.isSafeInteger(row.expectedRevision)||row.expectedRevision<0||!note.ok)return invalid;

  return {ok:true,data:{attemptId:row.attemptId,reportId:row.reportId,expectedRevision:row.expectedRevision,note:note.value}};

}

