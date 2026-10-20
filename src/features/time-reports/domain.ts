import { localDateForInstant, nextLocalDate, parseUtcInstant, stockholmLocalToUtc, weekdayForDate } from "@/features/scheduling/time-zone";
import { isReportDate, MAX_REPORT_MINUTES } from "./validation";

export function reportMinutesBetween(startsAt:string,endsAt:string):number|null {try{const delta=parseUtcInstant(endsAt)-parseUtcInstant(startsAt),minute=BigInt(60000000);if(delta<=BigInt(0)||delta%minute!==BigInt(0)||delta/minute>BigInt(MAX_REPORT_MINUTES))return null;return Number(delta/minute);}catch{return null;} }

export function reportMinutesFromLocalInterval(start:string,end:string):number|null {try{return reportMinutesBetween(stockholmLocalToUtc(`${start.length===16?start+":00":start}`),stockholmLocalToUtc(`${end.length===16?end+":00":end}`));}catch{return null;} }

export function shiftReportDate(date:string,days:number):string {if(!isReportDate(date))throw new Error("Invalid report date");return new Date(Date.parse(`${date}T00:00:00Z`)+days*86400000).toISOString().slice(0,10);}

export function reportWeekStart(date:string):string{return shiftReportDate(date,1-weekdayForDate(date));}

export function reportToday():string{return localDateForInstant(parseUtcInstant(new Date().toISOString()));}

export function completedNudgeDates(asOf:string):string[]{const today=localDateForInstant(parseUtcInstant(asOf)),dates:string[]=[];for(let offset=-7;offset<0;offset++){const date=shiftReportDate(today,offset);if(weekdayForDate(date)<=5)dates.push(date);}return dates;}

export function reportedBookedDelta(report:{minutes:number;bookedMinutesAtFiling:number|null}):number|null{return report.bookedMinutesAtFiling===null?null:report.minutes-report.bookedMinutesAtFiling;}

export function personalWeek<T extends {id:string;userId:string;date:string;minutes:number;status:string}>({weekStart,userId,reports,bookedDates}:{weekStart:string;userId:string;reports:readonly T[];bookedDates:readonly string[]}) {

  const days:{date:string;reports:T[];minutes:number;missing:boolean}[]=[];for(let date=weekStart;days.length<7;date=nextLocalDate(date)){const rows=reports.filter(row=>row.userId===userId&&row.date===date&&row.status==="submitted");days.push({date,reports:rows,minutes:rows.reduce((n,row)=>n+row.minutes,0),missing:weekdayForDate(date)<=5&&bookedDates.includes(date)&&rows.length===0});}

  return {days,totalMinutes:days.reduce((n,day)=>n+day.minutes,0),missingDates:days.filter(day=>day.missing).map(day=>day.date)};

}

/** Keep the numeric snapshot's decimal representation; do not round fractional provenance. */
export function formatReportMinutes(minutes:number):string {
  const literal=String(minutes);
  if(/[eE]/.test(literal))return `${literal.replace(".",",")} min`;
  const [whole,fraction]=literal.split("."),integerMinutes=Number(whole),hours=Math.floor(integerMinutes/60),remainder=integerMinutes%60;
  return remainder===0&&!fraction?`${hours} h`:`${hours} h ${remainder}${fraction?","+fraction:""} min`;
}

export function reportLocalInput(instant:string):string {const parts=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Stockholm",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(instant)).map(p=>[p.type,p.value]));return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;}

