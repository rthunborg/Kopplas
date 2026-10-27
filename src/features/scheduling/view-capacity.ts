import { validateWorkHoursInput } from "../resources/work-hours";
import { validateCapacityInputs } from "../resources/capacity-inputs";
import { bookingRange, prepareDailyCapacity, type DailyCapacityInput } from "./capacity";
import { intersectRanges, localDayRange, validateLocalDate } from "./time-zone";
import type { SchedulingPerson, SchedulingBooking } from "./types";
import type { SchedulingCapacityCell } from "./view-types";
export function capacityDisplayCell(personId:string,date:string,budget:number|null,demand:number|null,bookingIds:readonly string[]): SchedulingCapacityCell {
  if(budget===null || demand===null || !Number.isFinite(budget) || !Number.isFinite(demand))return {personId,date,budget:null,demand:null,balance:null,occupancy:null,state:"unavailable",bookingIds:[]};
  return {personId,date,budget,demand,balance:budget-demand,occupancy:budget>0?demand/budget*100:null,state:budget<=0?(demand>0?"overbooked-no-capacity":"no-capacity"):demand>budget?"overbooked":"available",bookingIds};
}
/** Full authorized planned demand is additive; toolbar block filters never enter this adapter. */
export function schedulingCapacityCells(input: DailyCapacityInput, people:readonly Pick<SchedulingPerson,"id"|"shifts"|"exceptions">[], bookings:readonly SchedulingBooking[], dates:readonly string[]): SchedulingCapacityCell[] {
  if(!Array.isArray(input.calendarDays) || !Number.isFinite(input.rules.planningBufferMinutes) || input.rules.planningBufferMinutes<0 || !Number.isSafeInteger(input.rules.planningBufferMinutes*60000000) || !Array.isArray(input.rules.authorizedOvertime))throw new Error("Invalid capacity facts");
  const seen=new Set<string>();for(const day of input.calendarDays){validateLocalDate(day.date);if(!validateCapacityInputs({calendarDay:day}).ok || seen.has(day.date))throw new Error("Invalid calendar facts");seen.add(day.date);}
  return people.flatMap(person=>{
    if(!validateWorkHoursInput(person).ok || !validateCapacityInputs({exceptions:person.exceptions}).ok)throw new Error("Invalid schedule facts");
    return dates.map(date=>{validateLocalDate(date);if(!person.shifts.length)return capacityDisplayCell(person.id,date,null,null,[]);const day=localDayRange(date);let demand=BigInt(0);const ids:string[]=[];
      for(const booking of new Map(bookings.map(b=>[b.id,b])).values()){if(booking.status!=="planned" || !booking.assigneeIds.includes(person.id))continue;const overlap=intersectRanges(bookingRange(booking),day);if(overlap){demand+=overlap.end-overlap.start;ids.push(booking.id);}}
      const terms=prepareDailyCapacity(input,person,date)(demand).terms;
      return capacityDisplayCell(person.id,date,terms.availableMinutes+terms.existingBookingMinutes,terms.existingBookingMinutes,ids);
    });
  });
}
