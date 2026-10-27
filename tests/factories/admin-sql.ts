/**
 * TEST-ONLY admin SQL helper (Story 2.2). Direct `pg` connection to the LOCAL
 * Supabase Postgres as the `postgres` superuser — used for schema introspection
 * (migration-reset green test) and for planting the adversarial search_path
 * object in the SECURITY DEFINER hijack negative (R-006).
 *
 * Confined to `tests/factories/**` (the `check-service-role-containment.mjs`
 * guard scans `tests/`). NEVER imported into `src/`/`app/`/client paths — the app
 * runtime talks to Supabase over the anon key + RLS, never a raw superuser
 * connection.
 *
 * A single lazily-created pool is reused across the run and closed by the suites'
 * global teardown via `closeAdminPool()`.
 */
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { assertLocalStack, LOCAL_SUPABASE_DB_URL } from "../support/test-env";

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    // Hard local-only fail-safe BEFORE any superuser connection is opened — the
    // admin SQL helper runs raw DDL/DML as `postgres` and must never touch a
    // non-local database.
    assertLocalStack();
    pool = new Pool({
      connectionString: LOCAL_SUPABASE_DB_URL,
      // Small pool: the suites are not write-heavy and share one local DB.
      max: 4,
      connectionTimeoutMillis: 5_000,
    });
  }
  return pool;
}

/** Run a parameterized query and return the typed rows. */
export async function adminQuery<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(sql, params as unknown[]);
  return result.rows;
}

/** Run a statement for its side effect (DDL/DML), ignoring the result set. */
export async function adminExec(
  sql: string,
  params: readonly unknown[] = [],
): Promise<void> {
  await getPool().query(sql, params as unknown[]);
}

/**
 * Run a sequence of statements on a SINGLE dedicated connection (so session-local
 * state like `set search_path` persists across them). Used by the R-006 hijack
 * negative, which must SET search_path and then call the helper on the same
 * session. The connection is always released.
 */
export async function adminSession<T>(
  run: (exec: {
    query: <R extends QueryResultRow = QueryResultRow>(
      sql: string,
      params?: readonly unknown[],
    ) => Promise<R[]>;
  }) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    return await run({
      query: async <R extends QueryResultRow = QueryResultRow>(
        sql: string,
        params: readonly unknown[] = [],
      ) => {
        const result = await client.query<R>(sql, params as unknown[]);
        return result.rows;
      },
    });
  } finally {
    // Reset ALL session-local state before returning the connection to the pool.
    // The R-006 hijack negative sets `search_path` and `request.jwt.claim.sub` on
    // this session; without a reset the pooled connection (max: 4) would hand that
    // tampered state to a later `adminQuery`/`adminExec`/`adminSession` caller,
    // causing non-deterministic cross-test contamination under parallelism
    // (review fix 2026-06-26). `discard all` also drops temp tables/prepared
    // statements planted by the adversarial-object setup.
    try {
      await client.query("discard all");
    } finally {
      client.release();
    }
  }
}

/** Close the shared pool (called from suite teardown). Safe to call repeatedly. */
export async function closeAdminPool(): Promise<void> {
  if (pool) {
    const p = pool;
    pool = null;
    await p.end();
  }
}

/** Opt-in SQL-only session. Always destroys its exact existing-pool client.
 * End/removal proves frontend containment, never backend rollback/restoration.
 * Default adminSession/adminQuery/adminExec behavior is deliberately unchanged.
 */
type RetiredClient = PoolClient & {getTransactionStatus?: () => string | null};
type RetiredState = {clientError:boolean;poolError:boolean;fault:()=>void};
type RetiredGate = {owned:WeakSet<object>;active:WeakMap<object,RetiredState>;emit:Pool["emit"]};
const retiredGates = new WeakMap<Pool,RetiredGate>();
function retiredGate(target:Pool): RetiredGate {
  const existing=retiredGates.get(target);
  if(existing){if(target.emit!==existing.emit)throw new Error("Admin retired session dispatch capability refused");return existing;}
  const owned=new WeakSet<object>(),active=new WeakMap<object,RetiredState>(),original=target.emit;
  const emit:Pool["emit"]=function(this:Pool,event:string|symbol,...args:unknown[]) {
    if(this===target&&event==="error"&&args[1]!==null&&(typeof args[1]==="object"||typeof args[1]==="function")&&owned.has(args[1] as object)){
      const state=active.get(args[1] as object);if(state){state.poolError=true;state.fault();}return true;
    }
    return Reflect.apply(original,this,[event,...args]);
  } as Pool["emit"];
  const gate={owned,active,emit};target.emit=emit;retiredGates.set(target,gate);return gate;
}
function retiredClientSink(this:RetiredClient) {
  // The minimal lifetime sink has no per-client closure or raw error parameter.
  const state=forRetiredClient.get(this);if(state){state.clientError=true;state.fault();}
}
const forRetiredClient = new WeakMap<object,RetiredState>();
const retiredEnded = new WeakSet<object>();
function retiredEndSink(this:RetiredClient){retiredEnded.add(this);forRetiredClient.get(this)?.fault();}
export class AdminRetiredSessionError extends Error {
  readonly retirementVerified:boolean;readonly facts:readonly string[];
  constructor(retirementVerified:boolean, facts:readonly string[]) {
    super("Admin retired session failed; fixed lifecycle facts only");this.name="AdminRetiredSessionError";this.retirementVerified=retirementVerified;this.facts=facts;
  }
}
export async function adminRetiredSession<T>(run:(exec:{query<R extends QueryResultRow=QueryResultRow>(sql:string,params?:readonly unknown[]):Promise<R[]>})=>Promise<T>):Promise<T> {
  const target=getPool(),gate=retiredGate(target);
  let acquisitionClosed=false,acquireTimer:ReturnType<typeof setTimeout>|undefined;
  let client:RetiredClient|undefined;
  function register(exact:RetiredClient,state:RetiredState){gate.owned.add(exact);gate.active.set(exact,state);forRetiredClient.set(exact,state);exact.on("error",retiredClientSink);exact.once("end",retiredEndSink);}
  try {
    client=await new Promise<RetiredClient>((resolve,reject)=>{
      acquireTimer=setTimeout(()=>{acquisitionClosed=true;reject(new AdminRetiredSessionError(false,["acquisition-unverified"]));},5_000);
      try {target.connect((error,acquired)=>{
        if(error||!acquired){reject(new AdminRetiredSessionError(false,["acquisition-failed"]));return;}
        const exact=acquired as RetiredClient;
        // Registration precedes exposure, including acquisition after deadline.
        const state:RetiredState={clientError:false,poolError:false,fault:()=>{}};register(exact,state);
        if(acquisitionClosed){
          const cleanup=()=>{clearTimeout(timer);gate.active.delete(exact);forRetiredClient.delete(exact);exact.removeListener("end",cleanup);};
          const timer=setTimeout(cleanup,5_000);exact.once("end",cleanup);
          try {exact.release(true);} catch {cleanup();} // one public retirement, never retry
          return;
        }
        resolve(exact);
      });} catch {reject(new AdminRetiredSessionError(false,["acquisition-failed"]));}
    });
  } finally {acquisitionClosed=true;if(acquireTimer)clearTimeout(acquireTimer);}
  const exact=client,observed=new Set<Promise<unknown>>(),facts:string[]=[];
  let open=true,busy=false,ended=retiredEnded.has(exact),drains=0,deadline=false,callbackDone=false,callbackOk=false;
  let value:T|undefined,releaseFailed=false,initial=false;
  let wake!:()=>void;const stopped=new Promise<void>(resolve=>{wake=resolve;});
  const state=gate.active.get(exact)!;
  const close=()=>{open=false;wake();};state.fault=close;
  const drainWaiters=new Set<()=>void>();
  const onDrain=()=>{drains++;for(const notify of drainWaiters)notify();};
  const onEnd=()=>{ended=true;close();for(const notify of drainWaiters)notify();};
  exact.on("drain",onDrain);exact.on("end",onEnd);
  const status=()=>{try{return typeof exact.getTransactionStatus==="function"?exact.getTransactionStatus():null;}catch{return null;}};
  const timer=setTimeout(()=>{deadline=true;facts.push("operation-deadline");close();},20_000);
  const query=<R extends QueryResultRow>(sql:string,params:readonly unknown[]=[]):Promise<R[]>=>{
    if(!open||busy||ended||state.clientError||state.poolError){const refused=Promise.reject<R[]>(new Error("Admin retired query admission refused"));void refused.catch(()=>{});return refused;}
    busy=true;const before=drains;let actual:Promise<import("pg").QueryResult<R>>;
    try {actual=exact.query<R>(sql,params as unknown[]);}catch(error){actual=Promise.reject(error);}
    observed.add(actual);void actual.catch(()=>{});
    const projected=(async()=>{
      const result=await Promise.race([actual.then(rows=>({ok:true as const,rows}),error=>({ok:false as const,error})),stopped.then(()=>null)]);
      if(!result)throw new Error("Admin retired query settlement unverified");
      if(drains<=before){let notify!:()=>void;const drained=new Promise<void>(resolve=>{notify=resolve;drainWaiters.add(notify);});try{await Promise.race([drained,stopped]);}finally{drainWaiters.delete(notify);}}
      if(drains<=before||ended||!["I","T","E"].includes(status()??"")||state.clientError||state.poolError){close();throw new Error("Admin retired protocol settlement unverified");}
      busy=false;if(!result.ok)throw result.error;return result.rows.rows;
    })();observed.add(projected);void projected.catch(()=>{});return projected;
  };
  let callback:Promise<unknown>=Promise.resolve();
  try {
    initial=status()==="I"&&!ended&&!state.clientError&&!state.poolError;if(!initial)facts.push("initial-protocol-refused");
    if(initial){callback=Promise.resolve().then(()=>run(Object.freeze({query}))).then(result=>{value=result;callbackDone=true;callbackOk=true;},()=>{callbackDone=true;facts.push("callback-failed");});void callback.catch(()=>{});await Promise.race([callback,stopped]);}
  } finally {open=false;clearTimeout(timer);}
  const cleanBeforeRetire=initial&&callbackDone&&!busy&&status()==="I"&&!deadline&&!ended&&!state.clientError&&!state.poolError;
  if(!cleanBeforeRetire)facts.push("pre-retirement-unverified");
  // Closing the port is irreversible, before public release(true) on every path.
  try {exact.release(true);}catch {releaseFailed=true;facts.push("retirement-invocation-failed");}
  let retireTimer:ReturnType<typeof setTimeout>|undefined;
  const joined=Promise.allSettled([...observed,callback]);void joined.catch(()=>{});
  let endNotify!:()=>void;
  const endPromise=ended?Promise.resolve():new Promise<void>(resolve=>{endNotify=resolve;exact.once("end",endNotify);});
  let complete=false;
  try {complete=await Promise.race([Promise.all([joined,endPromise]).then(()=>true),new Promise<false>(resolve=>{retireTimer=setTimeout(()=>resolve(false),5_000);})]);}
  finally {if(retireTimer)clearTimeout(retireTimer);if(endNotify)exact.removeListener("end",endNotify);exact.removeListener("end",onEnd);exact.removeListener("drain",onDrain);drainWaiters.clear();gate.active.delete(exact);forRetiredClient.delete(exact);}
  if(!complete||!ended)facts.push("retirement-join-unverified");
  if(state.clientError)facts.push("owned-client-error");if(state.poolError)facts.push("owned-pool-error");
  const verified=cleanBeforeRetire&&complete&&ended&&!releaseFailed&&!state.clientError&&!state.poolError;
  if(!verified||!callbackOk)throw new AdminRetiredSessionError(verified,Object.freeze(facts));
  return value as T;
}
