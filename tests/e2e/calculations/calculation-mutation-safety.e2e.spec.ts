/** 35.8-P P-6 essential real-app acceptance. Run only with configured production
 * server + local fixture; no mocked successful command or browser-side money engine.
 */
import { test, expect, type Page, type Locator, type TestInfo, type Request as BrowserRequest } from "@playwright/test";
import { readFileSync, writeSync } from "node:fs";
import path from "node:path";

// Attempt-local checkpoints only; absence is UNKNOWN, never a root-cause claim.
const stageLines = {
  "before-marked-setup": "E35_8_STAGE before-marked-setup FAIL\n",
  "login-open": "E35_8_STAGE login-open FAIL\n",
  "login-ready": "E35_8_STAGE login-ready FAIL\n",
  "login-submit": "E35_8_STAGE login-submit FAIL\n",
  "login-destination": "E35_8_STAGE login-destination FAIL\n",
  "create-page": "E35_8_STAGE create-page FAIL\n",
  "create-open": "E35_8_STAGE create-open FAIL\n",
  "create-input": "E35_8_STAGE create-input FAIL\n",
  "create-context-ready": "E35_8_STAGE create-context-ready FAIL\n",
  "create-submit": "E35_8_STAGE create-submit FAIL\n",
  "editor-destination": "E35_8_STAGE editor-destination FAIL\n",
  "editor-visible": "E35_8_STAGE editor-visible FAIL\n",
  "outside-setup": "E35_8_STAGE outside-setup FAIL\n",
} as const;
type Stage = keyof typeof stageLines;
const lastStage = new WeakMap<TestInfo, Stage>();
const emitted = new WeakSet<TestInfo>();
function mark(info: TestInfo, name: Stage) {
  try {
    if (typeof name === "string" && Object.hasOwn(stageLines, name)) lastStage.set(info, name);
  } catch { /* Observation cannot change the original test outcome. */ }
}
function emitFailure(info: TestInfo) {
  try {
    if (emitted.has(info)) return;
    const value = info.status;
    if (value !== "failed" && value !== "timedOut" && value !== "interrupted") return;
    emitted.add(info); // Claim once before any formatting/output attempt.
    const name = lastStage.get(info);
    const line = typeof name === "string" && Object.hasOwn(stageLines, name)
      ? stageLines[name] : stageLines["before-marked-setup"];
    writeSync(1, line); // Synchronous, bounded output: no callback or orphaned task.
  } catch { /* Missing/partial marker remains UNKNOWN; never rethrow or retry. */ }
}
// Metadata-only hook intentionally requests no fixtures.
test.afterEach(({}, info) => { emitFailure(info); });

const captureViewports = [{ width: 1280, height: 900 }, { width: 360, height: 640 }] as const;
type CaptureHost = "calculation-list" | "calculation-header" | "section-editor" | "row-editor" | "tax-settings" | "pre-quote-preview";
type CaptureCondition = "confirmed" | "submitting" | "unconfirmed" | "stale" | "refused-unsent" | "late-draft" | "invalid" | "empty";
/** Attach the original viewport PNG bytes: the existing JSON reporter retains body.
 * Assertions run at each real viewport, before capture; resizing never creates a request. */
async function captureState(page: Page, testInfo: TestInfo, host: CaptureHost, condition: CaptureCondition,
  form: Locator, assertState: () => Promise<void>, currentViewportOnly = false) {
  const originalViewport = page.viewportSize();
  if (!originalViewport) throw new Error("Producer captures require a concrete viewport");
  try {
    for (const viewport of currentViewportOnly ? [originalViewport] : captureViewports) {
      if (!currentViewportOnly) await page.setViewportSize(viewport);
      const focus = condition === "empty" ? form.getByText("Inga rader ännu i den här sektionen.", { exact: true })
        : condition === "submitting" ? form.locator('button[type="submit"]')
        : condition === "invalid" || condition === "stale" ? form.getByRole("alert").first()
        : form.getByRole("status").first();
      await focus.scrollIntoViewIfNeeded();
      await expect(focus).toBeVisible();
      await assertState();
      const captureId = `35-8-p-${host}-${condition}-${viewport.width}x${viewport.height}`;
      const buffer = await page.screenshot({ fullPage: false });
      await testInfo.attach(captureId + ".png", { body: buffer, contentType: "image/png" });
    }
  } finally {
    if (!currentViewportOnly) await page.setViewportSize(originalViewport);
  }
}

interface Fixture { adminA: { email: string; password: string }; }
function fixture(): Fixture {
  return JSON.parse(readFileSync(path.join(process.cwd(), "tests/e2e/.auth/fixture.json"), "utf8"));
}
async function hydrated(locator: Locator) {
  await locator.waitFor({ state: "visible" });
  await locator.evaluate(el => new Promise<void>(resolve => {
    const tick = () => Object.keys(el).some(k => k.startsWith("__react")) ? resolve() : requestAnimationFrame(tick);
    tick();
  }));
}
async function signIn(page: Page, testInfo: TestInfo) {
  const account = fixture().adminA;
  mark(testInfo, "login-open");
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in" });
  mark(testInfo, "login-ready");
  await hydrated(submit);
  await page.getByLabel("E-post").fill(account.email);
  await page.getByLabel("Lösenord").fill(account.password);
  mark(testInfo, "login-submit");
  await submit.click();
  mark(testInfo, "login-destination");
  await expect(page).toHaveURL(/\/dashboard/);
  mark(testInfo, "outside-setup");
}
async function ownCalculation(page: Page, testInfo: TestInfo) {
  await signIn(page,testInfo);
  mark(testInfo, "create-page");
  await page.goto("/calculations");
  const create = page.getByTestId("new-calculation");
  mark(testInfo, "create-open");
  await hydrated(create);
  await create.click();
  const form = page.getByTestId("new-calculation-form");
  const title = `Safety ${crypto.randomUUID()}`;
  mark(testInfo, "create-input");
  await form.getByLabel("Titel").fill(title);
  await form.getByLabel("Kund", { exact: true }).selectOption({ index: 1 });
  mark(testInfo, "create-context-ready");
  await expect(form).toHaveAttribute("data-editor-ready", "true");
  mark(testInfo, "create-submit");
  await form.getByRole("button", { name: "Skapa kalkyl" }).click();
  mark(testInfo, "editor-destination");
  await expect(page).toHaveURL(/\/calculations\/[a-f0-9-]+$/);
  mark(testInfo, "editor-visible");
  await expect(page.getByTestId("calculation-header")).toBeVisible();
  mark(testInfo, "outside-setup");
  return page.url();
}
function headerForm(page: Page) { return page.getByTestId("calculation-header").locator("form").first(); }

for (const viewport of [{ width: 360, height: 640 }, { width: 1280, height: 900 }]) {
  test(`E35-8-T-unknown / confirmed: lost committed response retains original handle through remount (${viewport.width})`, async ({ page, context }, testInfo) => {
    await page.setViewportSize(viewport);
    const url = await ownCalculation(page,testInfo);
    const form = headerForm(page);
    const title = `Committed ${crypto.randomUUID()}`;
    await hydrated(form.getByLabel("Titel"));
    await form.getByLabel("Titel").fill(title);
    let intercepted = 0;
    let originalBody = "";
    let responseComplete!: () => void, responseFailed!: (error: unknown) => void;
    const responseCompleted = new Promise<void>((resolve, reject) => { responseComplete = resolve; responseFailed = reject; });
    void responseCompleted.catch(() => {}); // The original promise is awaited below and during cleanup.
    await page.route("**/calculations/**", async route => {
      const request = route.request();
      if (request.method() !== "POST" || !request.headers()["next-action"] || intercepted) return route.continue();
      intercepted++;
      originalBody = request.postData() ?? "";
      // Forward the REAL mutation and wait for the server result before dropping
      // only its response. Independent reread below proves persistence separately.
      try {
        await route.fetch();
        await captureState(page, testInfo, "calculation-header", "submitting", form, async () => {
          await expect(form.locator('button[type="submit"]')).toBeDisabled();
          await expect(form.getByLabel("Titel")).toHaveValue(title);
        }, true);
        await route.abort("failed");
        responseComplete();
      } catch (error) {
        responseFailed(error);
        await route.abort("failed").catch(() => {});
      }
    });
    try {
    await expect(form).toHaveAttribute("data-editor-ready", "true");
    await form.getByRole("button", { name: "Spara titel" }).click();
    await expect.poll(() => intercepted).toBe(1);
    await responseCompleted;
    expect(originalBody).toMatch(/operation[_-]?id/i);
    await expect(form.getByText("Kalkylen har sparats.")).toHaveCount(0);
    await expect(form.getByRole("status")).toContainText(/obekräft|inte.*bekräft|okänt|osäkert/i);
    await captureState(page, testInfo, "calculation-header", "unconfirmed", form, async () => {
      await expect(form.getByRole("status")).toContainText(/obekräft|inte.*bekräft|okänt|osäkert/i);
      await expect(form.getByLabel("Titel")).toHaveValue(title);
      await expect(form.getByText("Kalkylen har sparats.")).toHaveCount(0);
    }, true);
    // Another read sees the write but does not prove the operation to this form.
    const observer = await context.newPage();
    try {
      await observer.goto(url);
      await expect(headerForm(observer).getByLabel("Titel")).toHaveValue(title);
    } finally { await observer.close(); }
    await page.unroute("**/calculations/**");
    await page.reload();
    const remounted = headerForm(page);
    await expect(remounted.getByLabel("Titel")).toHaveValue(title);
    await expect(remounted.getByText("Kalkylen har sparats.")).toHaveCount(0);
    // Reconciliation is explicit; remount/reconnect cannot submit a new write.
    await remounted.getByRole("button", { name: /kontrollera|stäm av/i }).click();
    await expect(remounted.getByRole("status")).toContainText(/sparats|bekräft/i);
    expect(intercepted).toBe(1);
    await captureState(page, testInfo, "calculation-header", "confirmed", remounted, async () => {
      await expect(remounted.getByRole("status")).toContainText(/ursprungliga.*bekräftad/i);
      await expect(remounted.getByLabel("Titel")).toHaveValue(title);
    }, true);
    } finally {
      await page.unroute("**/calculations/**");
      if (intercepted) await responseCompleted;
    }
  });
}

test("E35-8-T-stale: an original header decision cannot overwrite the other tab's confirmed edit", async ({ page, context }, testInfo) => {
  const url = await ownCalculation(page,testInfo);
  const other = await context.newPage();
  try {
    await other.goto(url);
    const stale = headerForm(page);
    const fresh = headerForm(other);
    await hydrated(fresh.getByLabel("Titel"));
    await stale.getByLabel("Titel").fill("Retained unsent old decision");
    const winner = `Newer ${crypto.randomUUID()}`;
    await fresh.getByLabel("Titel").fill(winner);
    await fresh.getByRole("button", { name: "Spara titel" }).click();
    await expect(fresh.getByRole("status")).toContainText(/sparats/);
    await stale.getByRole("button", { name: "Spara titel" }).click();
    await expect(stale.getByText("Kalkylen har sparats.")).toHaveCount(0);
    await expect(stale.getByRole("alert")).toContainText(/ändrat|ändrats|inaktuell|uppdatera/i);
    await expect(stale.getByLabel("Titel")).toHaveValue("Retained unsent old decision");
    await other.reload();
    await expect(headerForm(other).getByLabel("Titel")).toHaveValue(winner);
    await captureState(page, testInfo, "calculation-header", "stale", stale, async () => {
      await expect(stale.getByRole("alert")).toContainText(/ändrat|ändrats|inaktuell|uppdatera/i);
      await expect(stale.getByLabel("Titel")).toHaveValue("Retained unsent old decision");
      await expect(stale.getByText("Kalkylen har sparats.")).toHaveCount(0);
    });
  } finally { await other.close(); }
});


test("E35-8-T-late-result: original A cannot reset or save later unsent draft B",async({page,context},testInfo)=>{
  const url=await ownCalculation(page,testInfo);const form=headerForm(page);await expect(form).toHaveAttribute("data-editor-ready","true");
  const saved=`A ${crypto.randomUUID()}`,later=`B ${crypto.randomUUID()}`;await form.getByLabel("Titel").fill(saved);
  let release!:()=>void;const released=new Promise<void>(resolve=>release=resolve);let held=false, posts=0;
  await page.route("**/calculations/**",async route=>{if(route.request().method()!=="POST"||!route.request().headers()["next-action"]||!route.request().postData()?.includes("operation_id"))return route.continue();posts++;if(held)return route.continue();held=true;const response=await route.fetch();await released;await route.fulfill({response});});
  try{await form.getByRole("button",{name:"Spara titel"}).click();await expect.poll(()=>held).toBe(true);await expect(form.getByRole("button",{name:"Spara titel"})).toBeDisabled();await form.evaluate(el=>(el as HTMLFormElement).requestSubmit());await form.getByLabel("Titel").fill(later);}
  finally{release();}
  await expect(form.getByRole("status")).toContainText(/nya ändringar.*inte sparade/i);await expect(form.getByLabel("Titel")).toHaveValue(later);expect(posts).toBe(1);await expect(form.getByText("Kalkylen har sparats.")).toHaveCount(0);
  const observer=await context.newPage();try{await observer.goto(url);await expect(headerForm(observer).getByLabel("Titel")).toHaveValue(saved);}finally{await observer.close();}
  await captureState(page,testInfo,"calculation-header","late-draft",form,async()=>{
    await expect(form.getByRole("status")).toContainText(/nya ändringar.*inte sparade/i);await expect(form.getByLabel("Titel")).toHaveValue(later);await expect(form.getByText("Kalkylen har sparats.")).toHaveCount(0);
  });
});

test("E35-8-T-connection-required / submitting / error-retry: unsent draft survives reconnect without automatic replay",async({page,context},testInfo)=>{
  const url=await ownCalculation(page,testInfo);const form=headerForm(page);await expect(form).toHaveAttribute("data-editor-ready","true");const draft=`Offline ${crypto.randomUUID()}`;await form.getByLabel("Titel").fill(draft);
  await context.setOffline(true);try{await form.getByRole("button",{name:"Spara titel"}).click();await expect(form.getByRole("status")).toContainText(/inte skickade/i);await expect(form.getByLabel("Titel")).toHaveValue(draft);await captureState(page,testInfo,"calculation-header","refused-unsent",form,async()=>{await expect(form.getByRole("status")).toContainText(/inte skickade/i);await expect(form.getByLabel("Titel")).toHaveValue(draft);});}finally{await context.setOffline(false);}
  const observer=await context.newPage();try{await observer.goto(url);await expect(headerForm(observer).getByLabel("Titel")).not.toHaveValue(draft);}finally{await observer.close();}
  await form.getByLabel("Titel").fill("   ");await form.getByRole("button",{name:"Spara titel"}).click();await expect(form.getByRole("alert")).toBeVisible();
  await captureState(page,testInfo,"calculation-header","invalid",form,async()=>{await expect(form.getByRole("alert")).toBeVisible();await expect(form.getByLabel("Titel")).toHaveValue("   ");});
  await form.getByLabel("Titel").fill(draft);await form.getByRole("button",{name:"Spara titel"}).click();await expect(form.getByText("Kalkylen har sparats.")).toBeVisible();
});

test("P-6 CalculationList: lost create response recovers the same target after remount",async({page,context},testInfo)=>{
  await signIn(page,testInfo);mark(testInfo,"create-page");await page.goto("/calculations");mark(testInfo,"create-open");await hydrated(page.getByTestId("new-calculation"));await page.getByTestId("new-calculation").click();const form=page.getByTestId("new-calculation-form");mark(testInfo,"create-context-ready");await expect(form).toHaveAttribute("data-editor-ready","true");mark(testInfo,"outside-setup");const title=`Lost create ${crypto.randomUUID()}`;await form.getByLabel("Titel").fill(title);await form.getByLabel("Kund",{exact:true}).selectOption({index:1});
  const loss=await loseResponse(page,"**/calculations",async()=>captureState(page,testInfo,"calculation-list","submitting",form,async()=>{await expect(form.locator('button[type="submit"]')).toBeDisabled();await expect(form.getByLabel("Titel")).toHaveValue(title);}));
  try {
    await form.getByRole("button",{name:"Skapa kalkyl"}).click();await expect.poll(loss.count).toBe(1);await loss.completed;await expect(form.getByRole("status")).toContainText(/obekräftat/i);
    await captureState(page,testInfo,"calculation-list","unconfirmed",form,async()=>{await expect(form.getByRole("status")).toContainText(/obekräftat/i);await expect(form.getByLabel("Titel")).toHaveValue(title);});
    await loss.remove();await page.reload();await page.getByTestId("new-calculation").click();const remounted=page.getByTestId("new-calculation-form");await remounted.getByRole("button",{name:"Kontrollera resultat"}).click();
    const resultLink=remounted.getByRole("link",{name:"Öppna bekräftat resultat"});await expect(resultLink).toBeVisible();
    const target=await resultLink.getAttribute("href");if(!target)throw new Error("Missing confirmed calculation target");
    const observer=await context.newPage();try{await observer.goto(target);await expect(headerForm(observer).getByLabel("Titel")).toHaveValue(title);}finally{await observer.close();}
    await captureState(page,testInfo,"calculation-list","confirmed",remounted,async()=>{await expect(remounted.getByRole("status")).toContainText(/ursprungliga.*bekräftad/i);await expect(resultLink).toBeVisible();});
    await remounted.getByRole("link",{name:"Öppna bekräftat resultat"}).click();await expect(headerForm(page).getByLabel("Titel")).toHaveValue(title);
  } finally { await loss.remove(); }
});

for(const host of ["section","row","tax","quote"] as const){
  test(`P-6 ${host}: real lost response retains separate identity and explicit proof recovery`,async({page,context},testInfo)=>{
    const url=await ownCalculation(page,testInfo);await addSection(page);
    if(host==="section"){
      const emptySection=page.getByTestId("section-editor").first();
      await captureState(page,testInfo,"section-editor","empty",emptySection,async()=>{
        await expect(emptySection.getByText("Inga rader ännu i den här sektionen.",{exact:true})).toBeVisible();
        await expect(emptySection.getByTestId("row-edit-form")).toHaveCount(0);
        await expect(emptySection.getByLabel("Sektionstitel",{exact:true})).toHaveValue("Safety section");
      });
    }
    await addRow(page);
    if(host==="quote"){const tax=page.getByTestId("tax-document-settings").locator("form");await expect(tax).toHaveAttribute("data-editor-ready","true");await tax.getByRole("button",{name:"Spara skatte- och momsuppgifter"}).click();await expect(tax.getByRole("status")).toContainText(/sparats/);await page.getByTestId("create-quote").filter({visible:true}).click();}
    const form=host==="section"?page.getByTestId("section-editor").first().locator("form").filter({has:page.getByRole("button",{name:"Spara sektion"})}):host==="row"?page.getByTestId("row-edit-form").first():host==="tax"?page.getByTestId("tax-document-settings").locator("form"):page.getByTestId("pre-quote-preview").locator("form");
    await expect(form).toHaveAttribute("data-editor-ready","true");const value=`Uncertain ${host} ${crypto.randomUUID()}`;
    if(host==="section")await form.getByLabel("Sektionstitel").fill(value);if(host==="row")await form.getByLabel("Etikett (visas i offert)").fill(value);
    const captureHost:CaptureHost=host==="section"?"section-editor":host==="row"?"row-editor":host==="tax"?"tax-settings":"pre-quote-preview";
    const assertValues=async()=>{if(host==="section")await expect(form.getByLabel("Sektionstitel")).toHaveValue(value);if(host==="row")await expect(form.getByLabel("Etikett (visas i offert)")).toHaveValue(value);if(host==="tax")await expect(form.getByLabel("Momshantering")).toHaveValue("STANDARD_VAT_25");if(host==="quote")await expect(form.getByTestId("confirm-create-quote-version")).toBeVisible();};
    const button=host==="quote"?form.getByTestId("confirm-create-quote-version"):form.getByRole("button",{name:host==="section"?"Spara sektion":host==="row"?"Spara rad":"Spara skatte- och momsuppgifter"});
    const loss=await loseResponse(page,"**/calculations/**",async()=>captureState(page,testInfo,captureHost,"submitting",form,async()=>{await expect(form.locator('button[type="submit"]')).toBeDisabled();await assertValues();}));
    try {
      await button.click();await expect.poll(loss.count).toBe(1);await loss.completed;await expect(form.getByRole("status")).toContainText(/obekräftat/i);
      await captureState(page,testInfo,captureHost,"unconfirmed",form,async()=>{await expect(form.getByRole("status")).toContainText(/obekräftat/i);await assertValues();});
      // Neighboring header form is never confirmed by this operation.
      await expect(headerForm(page).getByText("Kalkylen har sparats.")).toHaveCount(0);
      await form.getByRole("button",{name:"Kontrollera resultat"}).click();await expect(form.getByRole("status")).toContainText(/ursprungliga.*bekräftad/i);await loss.remove();
      if(host==="quote"){
        const resultLink=form.getByRole("link",{name:"Öppna bekräftat resultat"}),target=await resultLink.getAttribute("href");if(!target)throw new Error("Missing confirmed quote target");
        const observer=await context.newPage();try{await observer.goto(target);await expect(observer).toHaveURL(/\/quotes\/[^/]+\/versions\/[^/]+$/);}finally{await observer.close();}
        await captureState(page,testInfo,captureHost,"confirmed",form,async()=>{await expect(form.getByRole("status")).toContainText(/ursprungliga.*bekräftad/i);await expect(resultLink).toBeVisible();});
        await form.getByRole("link",{name:"Öppna bekräftat resultat"}).click();await expect(page).toHaveURL(/\/quotes\/[^/]+\/versions\/[^/]+$/);
      }
      else {
        const observer=await context.newPage();try{await observer.goto(url);if(host==="section")await expect(observer.getByLabel("Sektionstitel").first()).toHaveValue(value);if(host==="row")await expect(observer.getByLabel("Etikett (visas i offert)").first()).toHaveValue(value);if(host==="tax")await expect(observer.getByLabel("Momshantering")).toHaveValue("STANDARD_VAT_25");}finally{await observer.close();}
        await captureState(page,testInfo,captureHost,"confirmed",form,async()=>{await expect(form.getByRole("status")).toContainText(/ursprungliga.*bekräftad/i);await assertValues();});
      }
    } finally { await loss.remove(); }
  });
}
async function addSection(page:Page){await page.getByTestId("add-section").click();const form=page.getByTestId("add-section-form");await expect(form).toHaveAttribute("data-editor-ready","true");await form.getByLabel("Sektionstitel").fill("Safety section");await form.getByRole("button",{name:"Skapa sektion"}).click();await expect(page.getByTestId("section-editor")).toHaveCount(1);}
async function addRow(page:Page){await page.getByTestId("add-row").click();const form=page.getByTestId("row-create-form");await expect(form).toHaveAttribute("data-editor-ready","true");await form.getByLabel("Antal",{exact:true}).fill("1");await form.getByLabel("Enhet",{exact:true}).fill("h");await form.getByLabel("Kostnad (kr)").fill("20");await form.getByLabel("Pris (kr)").fill("100");await form.getByLabel("Moms (%)").fill("25");await form.getByRole("button",{name:"Lägg till rad",exact:true}).click();await expect(page.getByTestId("row-edit-form")).toHaveCount(1);}
async function loseResponse(page:Page,pattern:string,beforeLoss?:()=>Promise<void>){
  let count=0,complete!:()=>void,fail!:(error:unknown)=>void;
  const completed=new Promise<void>((resolve,reject)=>{complete=resolve;fail=reject;});
  void completed.catch(()=>{}); // Await the original promise in the body and cleanup.
  const handler:Parameters<Page["route"]>[1]=async route=>{
    if(route.request().method()!=="POST"||!route.request().headers()["next-action"]||count||!route.request().postData()?.includes("operation_id"))return route.continue();
    count++;
    try{await route.fetch();await beforeLoss?.();await route.abort("failed");complete();}
    catch(error){fail(error);await route.abort("failed").catch(()=>{});}
  };
  await page.route(pattern,handler);
  return{count:()=>count,completed,remove:async()=>{try{if(count)await completed;}finally{await page.unroute(pattern,handler);}}};
}
// Full downstream seventeen-state presentation acceptance remains separately owned.


async function editorPostedRequest(request: BrowserRequest) {
  const parsed=await new Request("http://localhost",{method:"POST",headers:{"content-type":request.headers()["content-type"]??""},body:request.postData()??""}).formData();
  const field=(name:string)=>{const found=[...parsed].find(([key])=>key===name||key.endsWith(`_${name}`));if(!found||typeof found[1]!=="string")throw new Error(`Missing actual editor field ${name}`);return found[1];};
  return {operationId:field("operation_id"),expected:JSON.parse(field("expected")),title:field("title")};
}

test("P-6 explicit original retry preserves later draft through reconcile and the next fresh submission",async({page,context},testInfo)=>{
  const url=await ownCalculation(page,testInfo),form=headerForm(page);await expect(form).toHaveAttribute("data-editor-ready","true");
  const a=`Original ${crypto.randomUUID()}`,b1=`During check ${crypto.randomUUID()}`,b2=`After check ${crypto.randomUUID()}`;
  const writes:Awaited<ReturnType<typeof editorPostedRequest>>[]=[];let lost=false,holdCheck=false,checkHeld=false;
  let releaseCheck!:()=>void;const released=new Promise<void>(resolve=>releaseCheck=resolve);
  await page.route("**/calculations/**",async route=>{
    const request=route.request();if(request.method()!=="POST"||!request.headers()["next-action"])return route.continue();
    if(request.postData()?.includes("operation_id")){writes.push(await editorPostedRequest(request));if(!lost){lost=true;return route.abort("failed");}return route.continue();}
    if(holdCheck){const response=await route.fetch();checkHeld=true;await released;return route.fulfill({response});}return route.continue();
  });
  await form.getByLabel("Titel").fill(a);await form.getByRole("button",{name:"Spara titel"}).click();
  await expect(form.getByRole("status")).toContainText(/obekräftat/i);expect(writes).toHaveLength(1);
  holdCheck=true;await form.getByRole("button",{name:"Kontrollera resultat"}).click();await expect.poll(()=>checkHeld).toBe(true);
  await form.getByLabel("Titel").fill(b1);releaseCheck();await expect(form.getByRole("status")).toContainText(/fortfarande obekräftat/i);
  await form.getByLabel("Titel").fill(b2);await form.getByRole("button",{name:"Försök samma åtgärd igen"}).click();
  await expect(form.getByRole("status")).toContainText(/ursprungliga.*bekräftad/i);await expect(form.getByLabel("Titel")).toHaveValue(b2);
  expect(writes).toHaveLength(2);expect(writes[1]).toEqual(writes[0]);expect(writes[1]?.title).toBe(a);
  const observer=await context.newPage();try{
    await observer.goto(url);await expect(headerForm(observer).getByLabel("Titel")).toHaveValue(a);
    await form.getByRole("button",{name:"Spara titel"}).click();await expect(form.getByRole("alert")).toContainText(/ändrat|ändrats|inaktuell|uppdatera/i);await expect(form.getByLabel("Titel")).toHaveValue(b2);
    expect(writes).toHaveLength(3);expect(writes[2]?.title).toBe(b2);expect(writes[2]?.operationId).not.toBe(writes[0]?.operationId);
    await observer.reload();await expect(headerForm(observer).getByLabel("Titel")).toHaveValue(a);
    // B was already unsent while A completed. Keep its old binding until an
    // explicit reread/new decision, rather than silently adopting A or newer C.
    await page.reload();const fresh=headerForm(page);await expect(fresh).toHaveAttribute("data-editor-ready","true");await fresh.getByLabel("Titel").fill(b2);await fresh.getByRole("button",{name:"Spara titel"}).click();await expect(fresh.getByText("Kalkylen har sparats.")).toBeVisible();
    expect(writes).toHaveLength(4);expect(writes[3]?.operationId).not.toBe(writes[2]?.operationId);await observer.reload();await expect(headerForm(observer).getByLabel("Titel")).toHaveValue(b2);
  }finally{releaseCheck();await observer.close();}
});

test("P-6 remount permits only matching reentered business request with original expected binding",async({page,context},testInfo)=>{
  const url=await ownCalculation(page,testInfo),form=headerForm(page);await expect(form).toHaveAttribute("data-editor-ready","true");
  const original=`Reenter ${crypto.randomUUID()}`,later=`Different ${crypto.randomUUID()}`;let dropped=false;
  const writes:Awaited<ReturnType<typeof editorPostedRequest>>[]=[];
  await page.route("**/calculations/**",async route=>{const request=route.request();if(request.method()!=="POST"||!request.headers()["next-action"]||!request.postData()?.includes("operation_id"))return route.continue();writes.push(await editorPostedRequest(request));if(!dropped){dropped=true;return route.abort("failed");}return route.continue();});
  await form.getByLabel("Titel").fill(original);await form.getByRole("button",{name:"Spara titel"}).click();await expect(form.getByRole("status")).toContainText(/obekräftat/i);
  await page.reload();const remounted=headerForm(page);await expect(remounted).toHaveAttribute("data-editor-ready","true");
  await remounted.getByRole("button",{name:"Kontrollera resultat"}).click();await expect(remounted.getByRole("status")).toContainText(/samma ursprungliga uppgifter/i);
  await remounted.getByLabel("Titel").fill(later);await remounted.getByRole("button",{name:"Spara titel"}).click();await expect(remounted.getByRole("status")).toContainText(/matchar inte/i);expect(writes).toHaveLength(1);
  await remounted.getByLabel("Titel").fill(original);await remounted.getByRole("button",{name:"Spara titel"}).click();await expect(remounted.getByRole("status")).toContainText(/Underlaget matchar den ursprungliga/i);expect(writes).toHaveLength(1);
  await remounted.getByLabel("Titel").fill(later);await remounted.getByRole("button",{name:"Försök samma åtgärd igen"}).click();await expect(remounted.getByRole("status")).toContainText(/ursprungliga.*bekräftad/i);await expect(remounted.getByLabel("Titel")).toHaveValue(later);
  expect(writes).toHaveLength(2);expect(writes[1]).toEqual(writes[0]);
  const observer=await context.newPage();try{await observer.goto(url);await expect(headerForm(observer).getByLabel("Titel")).toHaveValue(original);}finally{await observer.close();}
});

for(const refusal of ["offline","unresolved-scope","storage-read","storage-write"] as const){
  test(`P-6 pre-dispatch ${refusal} preserves uncontrolled draft without issuing an operation`,async({page},testInfo)=>{
    const url=await ownCalculation(page,testInfo);let writes=0;
    await page.route("**/calculations/**",async route=>{const r=route.request();if(r.method()!=="POST"||!r.headers()["next-action"])return route.continue();if(r.postData()?.includes("operation_id")){writes++;return route.continue();}return refusal==="unresolved-scope"?route.abort("failed"):route.continue();});
    if(refusal==="unresolved-scope")await page.reload();
    const form=headerForm(page);await hydrated(form.getByLabel("Titel"));
    if(refusal!=="unresolved-scope")await expect(form).toHaveAttribute("data-editor-ready","true");
    if(refusal==="storage-read"||refusal==="storage-write"){await page.evaluate(mode=>{const name=mode==="storage-read"?"getItem":"setItem";Storage.prototype[name]=()=>{throw new Error("synthetic unavailable tab storage");};},refusal);}
    if(refusal==="offline")await page.context().setOffline(true);
    const draft=`Unsent ${refusal} ${crypto.randomUUID()}`;await form.getByLabel("Titel").fill(draft);await form.getByRole("button",{name:"Spara titel"}).click();await expect(form.getByRole("status")).toContainText(/inte skickade|skickades inte/i);await expect(form.getByLabel("Titel")).toHaveValue(draft);await expect(form.getByText("Kalkylen har sparats.")).toHaveCount(0);expect(writes).toBe(0);expect(page.url()).toBe(url);
    const tax=page.getByTestId("tax-document-settings").locator("form");await tax.getByLabel("Skatteavdrag",{exact:true}).selectOption("ROT");await tax.getByLabel("Betalningsdatum för ROT",{exact:true}).fill("2026-11-14");await tax.getByRole("button",{name:"Spara skatte- och momsuppgifter"}).click();await expect(tax.getByRole("status")).toContainText(/inte skickade|skickades inte/i);await expect(tax.getByLabel("Skatteavdrag",{exact:true})).toHaveValue("ROT");await expect(tax.getByLabel("Betalningsdatum för ROT",{exact:true})).toHaveValue("2026-11-14");expect(writes).toBe(0);
    if(refusal==="offline")await page.context().setOffline(false);
  });
}

test("P-6 tax pending A revalidation preserves controlled allowance membership and newer B draft",async({page,context},testInfo)=>{
  const url=await ownCalculation(page,testInfo),form=page.getByTestId("tax-document-settings").locator("form");await expect(form).toHaveAttribute("data-editor-ready","true");
  await form.getByLabel("Skatteavdrag",{exact:true}).selectOption("ROT");await form.getByLabel("Betalningsdatum för ROT",{exact:true}).fill("2026-11-13");
  await form.getByLabel("Person 1: ROT kvar (kr)").fill("1000");await form.getByLabel("Person 1: ROT/RUT kvar (kr)").fill("2000");
  let held=false;let release!:()=>void;const released=new Promise<void>(resolve=>release=resolve);
  await page.route("**/calculations/**",async route=>{if(route.request().method()!=="POST"||!route.request().headers()["next-action"]||!route.request().postData()?.includes("operation_id")||held)return route.continue();held=true;const response=await route.fetch();await released;await route.fulfill({response});});
  try{
    await form.getByRole("button",{name:"Spara skatte- och momsuppgifter"}).click();await expect.poll(()=>held).toBe(true);
    await form.getByRole("button",{name:"Lägg till person"}).click();await form.getByLabel("Person 3: ROT kvar (kr)").fill("1234");await form.getByLabel("Betalningsdatum för ROT",{exact:true}).fill("2026-11-14");
  }finally{release();}
  await expect(form.getByRole("status")).toContainText(/nya ändringar.*inte sparade/i);await expect(form.getByLabel("Person 3: ROT kvar (kr)")).toHaveValue("1234");await expect(form.getByLabel("Betalningsdatum för ROT",{exact:true})).toHaveValue("2026-11-14");await expect(form.getByLabel("Skatteavdrag",{exact:true})).toHaveValue("ROT");
  const observer=await context.newPage();try{await observer.goto(url);const persisted=observer.getByTestId("tax-document-settings");await expect(persisted.getByLabel("Betalningsdatum för ROT",{exact:true})).toHaveValue("2026-11-13");await expect(persisted.getByLabel("Person 3: ROT kvar (kr)")).toHaveCount(0);}finally{await observer.close();}
  await captureState(page,testInfo,"tax-settings","late-draft",form,async()=>{await expect(form.getByRole("status")).toContainText(/nya ändringar.*inte sparade/i);await expect(form.getByLabel("Person 3: ROT kvar (kr)")).toHaveValue("1234");await expect(form.getByLabel("Betalningsdatum för ROT",{exact:true})).toHaveValue("2026-11-14");await expect(form.getByLabel("Skatteavdrag",{exact:true})).toHaveValue("ROT");});
});


test("P-6 pending A then draft B cannot adopt concurrent C facts on a later server refresh",async({page,context},testInfo)=>{
  const url=await ownCalculation(page,testInfo),form=headerForm(page),other=await context.newPage();
  await expect(form).toHaveAttribute("data-editor-ready","true");const a=`A ${crypto.randomUUID()}`,b=`B ${crypto.randomUUID()}`,c=`C ${crypto.randomUUID()}`;
  let intercepted=false;let release!:()=>void;const released=new Promise<void>(resolve=>release=resolve);
  let upstreamComplete!:()=>void,upstreamFailed!:(error:unknown)=>void;const upstreamCompleted=new Promise<void>((resolve,reject)=>{upstreamComplete=resolve;upstreamFailed=reject;});
  await page.route("**/calculations/**",async route=>{if(route.request().method()!=="POST"||!route.request().headers()["next-action"]||!route.request().postData()?.includes("operation_id")||intercepted)return route.continue();intercepted=true;try{const response=await route.fetch();upstreamComplete();await released;await route.fulfill({response});}catch(error){upstreamFailed(error);throw error;}});
  try{
    await form.getByLabel("Titel").fill(a);await form.getByRole("button",{name:"Spara titel"}).click();await expect.poll(()=>intercepted).toBe(true);await upstreamCompleted;await form.getByLabel("Titel").fill(b);
    await other.goto(url);const winner=headerForm(other);await expect(winner).toHaveAttribute("data-editor-ready","true");await winner.getByLabel("Titel").fill(c);await winner.getByRole("button",{name:"Spara titel"}).click();await expect(winner.getByText("Kalkylen har sparats.")).toBeVisible();
    release();await expect(form.getByRole("status")).toContainText(/nya ändringar.*inte sparade/i);await expect(form.getByLabel("Titel")).toHaveValue(b);
    // A separate admitted section operation refreshes current header props to C,
    // without navigating away or turning retained title B into a new decision.
    await addSection(page);await expect(page.getByTestId("calculation-header").getByRole("heading",{name:c,exact:true})).toBeVisible();await expect(form.getByLabel("Titel")).toHaveValue(b);
    await form.getByRole("button",{name:"Spara titel"}).click();await expect(form.getByRole("alert")).toContainText(/ändrat|ändrats|inaktuell|uppdatera/i);await expect(form.getByLabel("Titel")).toHaveValue(b);await expect(form.getByText("Kalkylen har sparats.")).toHaveCount(0);
    await other.reload();await expect(headerForm(other).getByLabel("Titel")).toHaveValue(c);
  }finally{release();await other.close();}
});

test("P-6 invalid new create is not admitted before correction",async({page},testInfo)=>{
  await signIn(page,testInfo);mark(testInfo,"create-page");await page.goto("/calculations");mark(testInfo,"create-open");await hydrated(page.getByTestId("new-calculation"));await page.getByTestId("new-calculation").click();const form=page.getByTestId("new-calculation-form");mark(testInfo,"create-context-ready");await expect(form).toHaveAttribute("data-editor-ready","true");mark(testInfo,"outside-setup");let writes=0;
  page.on("request",request=>{if(request.method()==="POST"&&request.headers()["next-action"]&&request.postData()?.includes("operation_id"))writes++;});
  await form.getByLabel("Kund",{exact:true}).selectOption({index:1});await form.getByLabel("Titel").fill("   ");await form.getByRole("button",{name:"Skapa kalkyl"}).click();await expect(form.getByRole("alert").first()).toBeVisible();await expect(form.getByLabel("Titel")).toHaveValue("   ");expect(writes).toBe(0);
  expect(await page.evaluate(()=>Object.keys(sessionStorage).filter(key=>key.startsWith("kopplas/editor/v1/")).length)).toBe(0);
  await captureState(page,testInfo,"calculation-list","invalid",form,async()=>{await expect(form.getByRole("alert").first()).toBeVisible();await expect(form.getByLabel("Titel")).toHaveValue("   ");expect(writes).toBe(0);});
  const corrected=`Corrected ${crypto.randomUUID()}`;await form.getByLabel("Titel").fill(corrected);await form.getByRole("button",{name:"Skapa kalkyl"}).click();await expect(page).toHaveURL(/\/calculations\/[a-f0-9-]+$/);await expect(headerForm(page).getByLabel("Titel")).toHaveValue(corrected);expect(writes).toBe(1);
});
