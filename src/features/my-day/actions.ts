"use server";
import { readMyDay } from "@/server/read-models/my-day";
import type { MyDayQuery } from "./types";

export async function readMyDayAction(input: MyDayQuery) { return readMyDay(input); }
