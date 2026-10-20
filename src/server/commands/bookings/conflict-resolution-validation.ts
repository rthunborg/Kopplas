import type { ResolutionInput, ResolutionRequest } from "@/features/scheduling/conflict-resolver-types";
import { normalizeBookingDecision } from "@/features/resources/booking-editor-input";
import { bookingPayload, validateUpdateBooking } from "./validation";
import type { ValidationResult } from "../envelope-core";
import { bookingActionFitsTransport } from "@/features/resources/booking-transport";
import {validateBookingSeries} from "./series-validation";
export function resolutionRequest(input: ResolutionInput): ResolutionRequest {
  const {commandId,bookingId,action,targetLogicalIds,payload,wholeSeries,following}=input;
  return {commandId,bookingId,action,targetLogicalIds,payload,wholeSeries,...(following?{following}:{})};
}
export function validateConflictResolution(raw: unknown): ValidationResult<ResolutionInput> {
  const invalid={ok:false,code:"VALIDATION_FAILED"} as const;
  if(!bookingActionFitsTransport(raw))return invalid;
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return invalid;const r=raw as Record<string,unknown>;
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if(Object.keys(r).some(k=>!["commandId","bookingId","action","targetLogicalIds","payload","wholeSeries","following","review"].includes(k))||
    typeof r.commandId!=="string"||!uuid.test(r.commandId)||typeof r.bookingId!=="string"||!uuid.test(r.bookingId)||
    !["accept","move","reassign","adjust"].includes(String(r.action))||typeof r.wholeSeries!=="boolean"||!Array.isArray(r.targetLogicalIds)||
    !r.targetLogicalIds.length||r.targetLogicalIds.length>500||r.targetLogicalIds.some(id=>typeof id!=="string"||!id.length||id.length>20000)||new Set(r.targetLogicalIds).size!==r.targetLogicalIds.length)return invalid;
  let payload:ResolutionInput["payload"]=null;
  if(r.action==="accept"){if(r.payload!==null||r.wholeSeries||r.following!==undefined)return invalid;}
  else {
    if(!r.payload||typeof r.payload!=="object")return invalid;
    const result=validateUpdateBooking({...r.payload,commandId:r.commandId,bookingId:r.bookingId});if(!result.ok)return invalid;payload=bookingPayload(result.data);
  }
  let following:ResolutionRequest["following"];
  if(r.following!==undefined){
    const result=validateBookingSeries(r.following,true);if(!result.ok||r.wholeSeries||result.data.commandId!==r.commandId||result.data.pivotOccurrenceId!==r.bookingId||result.data.editorReview)return invalid;
    following=result.data;payload=following.template;
  }
  let review:ResolutionInput["review"];
  if(r.review!==undefined){
    if(!r.review||typeof r.review!=="object"||Array.isArray(r.review))return invalid;const v=r.review as Record<string,unknown>;
    const decision=normalizeBookingDecision(v.decision);if(Object.keys(v).length!==2||typeof v.receipt!=="string"||v.receipt.length>12000||!decision.ok)return invalid;
    review={receipt:v.receipt,decision:decision.data};
  }
  return {ok:true,data:{commandId:r.commandId.toLowerCase(),bookingId:r.bookingId.toLowerCase(),action:r.action as ResolutionInput["action"],
    targetLogicalIds:[...r.targetLogicalIds as string[]].sort(),payload,wholeSeries:r.wholeSeries,...(following?{following}:{}),...(review?{review}:{})}};
}
