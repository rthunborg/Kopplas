/** 35.8-P P-6 essential real-app acceptance. Run only with configured production
 * server + local fixture; no mocked successful command or browser-side money engine.
 */
import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

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
async function signIn(page: Page) {
  const account = fixture().adminA;
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in" });
  await hydrated(submit);
  await page.getByLabel("E-post").fill(account.email);
  await page.getByLabel("Lösenord").fill(account.password);
  await submit.click();
  await expect(page).toHaveURL(/\/dashboard/);
}
async function ownCalculation(page: Page) {
  await signIn(page);
  await page.goto("/calculations");
  const create = page.getByTestId("new-calculation");
  await hydrated(create);
  await create.click();
  const form = page.getByTestId("new-calculation-form");
  const title = `Safety ${crypto.randomUUID()}`;
  await form.getByLabel("Titel").fill(title);
  await form.getByLabel("Kund", { exact: true }).selectOption({ index: 1 });
  await expect(form).toHaveAttribute("data-editor-ready", "true");
  await form.getByRole("button", { name: "Skapa kalkyl" }).click();
  await expect(page).toHaveURL(/\/calculations\/[a-f0-9-]+$/);
  await expect(page.getByTestId("calculation-header")).toBeVisible();
  return page.url();
}
function headerForm(page: Page) { return page.getByTestId("calculation-header").locator("form").first(); }

for (const viewport of [{ width: 360, height: 640 }, { width: 1280, height: 900 }]) {
  test(`E35-8-T-unknown / confirmed: lost committed response retains original handle through remount (${viewport.width})`, async ({ page, context }) => {
    await page.setViewportSize(viewport);
    const url = await ownCalculation(page);
    const form = headerForm(page);
    const title = `Committed ${crypto.randomUUID()}`;
    await hydrated(form.getByLabel("Titel"));
    await form.getByLabel("Titel").fill(title);
    let intercepted = 0;
    let originalBody = "";
    await page.route("**/calculations/**", async route => {
      const request = route.request();
      if (request.method() !== "POST" || !request.headers()["next-action"] || intercepted) return route.continue();
      intercepted++;
      originalBody = request.postData() ?? "";
      // Forward the REAL mutation and wait for the server result before dropping
      // only its response. Independent reread below proves persistence separately.
      await route.fetch();
      await route.abort("failed");
    });
    await expect(form).toHaveAttribute("data-editor-ready", "true");
    await form.getByRole("button", { name: "Spara titel" }).click();
    await expect.poll(() => intercepted).toBe(1);
    expect(originalBody).toMatch(/operation[_-]?id/i);
    await expect(form.getByText("Kalkylen har sparats.")).toHaveCount(0);
    await expect(form.getByRole("status")).toContainText(/obekräft|inte.*bekräft|okänt|osäkert/i);
    // Another read sees the write but does not prove the operation to this form.
    const observer = await context.newPage();
    await observer.goto(url);
    await expect(headerForm(observer).getByLabel("Titel")).toHaveValue(title);
    await observer.close();
    await page.unroute("**/calculations/**");
    await page.reload();
    const remounted = headerForm(page);
    await expect(remounted.getByLabel("Titel")).toHaveValue(title);
    await expect(remounted.getByText("Kalkylen har sparats.")).toHaveCount(0);
    // Reconciliation is explicit; remount/reconnect cannot submit a new write.
    await remounted.getByRole("button", { name: /kontrollera|stäm av/i }).click();
    await expect(remounted.getByRole("status")).toContainText(/sparats|bekräft/i);
    expect(intercepted).toBe(1);
  });
}

test("E35-8-T-stale: an original header decision cannot overwrite the other tab's confirmed edit", async ({ page, context }) => {
  const url = await ownCalculation(page);
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
  } finally { await other.close(); }
});


test("E35-8-T-late-result: original A cannot reset or save later unsent draft B",async({page,context})=>{
  const url=await ownCalculation(page);const form=headerForm(page);await expect(form).toHaveAttribute("data-editor-ready","true");
  const saved=`A ${crypto.randomUUID()}`,later=`B ${crypto.randomUUID()}`;await form.getByLabel("Titel").fill(saved);
  let release!:()=>void;const released=new Promise<void>(resolve=>release=resolve);let held=false, posts=0;
  await page.route("**/calculations/**",async route=>{if(route.request().method()!=="POST"||!route.request().headers()["next-action"]||!route.request().postData()?.includes("operation_id"))return route.continue();posts++;if(held)return route.continue();held=true;const response=await route.fetch();await released;await route.fulfill({response});});
  try{await form.getByRole("button",{name:"Spara titel"}).click();await expect.poll(()=>held).toBe(true);await expect(form.getByRole("button",{name:"Spara titel"})).toBeDisabled();await form.evaluate(el=>(el as HTMLFormElement).requestSubmit());await form.getByLabel("Titel").fill(later);}
  finally{release();}
  await expect(form.getByRole("status")).toContainText(/nya ändringar.*inte sparade/i);await expect(form.getByLabel("Titel")).toHaveValue(later);expect(posts).toBe(1);await expect(form.getByText("Kalkylen har sparats.")).toHaveCount(0);
  const observer=await context.newPage();try{await observer.goto(url);await expect(headerForm(observer).getByLabel("Titel")).toHaveValue(saved);}finally{await observer.close();}
});

test("E35-8-T-connection-required / submitting / error-retry: unsent draft survives reconnect without automatic replay",async({page,context})=>{
  const url=await ownCalculation(page);const form=headerForm(page);await expect(form).toHaveAttribute("data-editor-ready","true");const draft=`Offline ${crypto.randomUUID()}`;await form.getByLabel("Titel").fill(draft);
  await context.setOffline(true);try{await form.getByRole("button",{name:"Spara titel"}).click();await expect(form.getByRole("status")).toContainText(/inte skickade/i);await expect(form.getByLabel("Titel")).toHaveValue(draft);}finally{await context.setOffline(false);}
  const observer=await context.newPage();try{await observer.goto(url);await expect(headerForm(observer).getByLabel("Titel")).not.toHaveValue(draft);}finally{await observer.close();}
  await form.getByLabel("Titel").fill("");await form.getByRole("button",{name:"Spara titel"}).click();await expect(form.getByRole("alert")).toBeVisible();
  await form.getByLabel("Titel").fill(draft);await form.getByRole("button",{name:"Spara titel"}).click();await expect(form.getByText("Kalkylen har sparats.")).toBeVisible();
});

test("P-6 CalculationList: lost create response recovers the same target after remount",async({page})=>{
  await signIn(page);await page.goto("/calculations");await hydrated(page.getByTestId("new-calculation"));await page.getByTestId("new-calculation").click();const form=page.getByTestId("new-calculation-form");await expect(form).toHaveAttribute("data-editor-ready","true");const title=`Lost create ${crypto.randomUUID()}`;await form.getByLabel("Titel").fill(title);await form.getByLabel("Kund",{exact:true}).selectOption({index:1});
  const loss=await loseResponse(page,"**/calculations");await form.getByRole("button",{name:"Skapa kalkyl"}).click();await expect.poll(loss.count).toBe(1);await expect(form.getByRole("status")).toContainText(/obekräftat/i);await loss.remove();await page.reload();await page.getByTestId("new-calculation").click();const remounted=page.getByTestId("new-calculation-form");await remounted.getByRole("button",{name:"Kontrollera resultat"}).click();await remounted.getByRole("link",{name:"Öppna bekräftat resultat"}).click();await expect(headerForm(page).getByLabel("Titel")).toHaveValue(title);
});

for(const host of ["section","row","tax","quote"] as const){
  test(`P-6 ${host}: real lost response retains separate identity and explicit proof recovery`,async({page,context})=>{
    const url=await ownCalculation(page);await addSection(page);await addRow(page);
    if(host==="quote"){const tax=page.getByTestId("tax-document-settings").locator("form");await expect(tax).toHaveAttribute("data-editor-ready","true");await tax.getByRole("button",{name:"Spara skatte- och momsuppgifter"}).click();await expect(tax.getByRole("status")).toContainText(/sparats/);await page.getByTestId("create-quote").filter({visible:true}).click();}
    const form=host==="section"?page.getByTestId("section-editor").first().locator("form").filter({has:page.getByRole("button",{name:"Spara sektion"})}):host==="row"?page.getByTestId("row-edit-form").first():host==="tax"?page.getByTestId("tax-document-settings").locator("form"):page.getByTestId("pre-quote-preview").locator("form");
    await expect(form).toHaveAttribute("data-editor-ready","true");const value=`Uncertain ${host} ${crypto.randomUUID()}`;
    if(host==="section")await form.getByLabel("Sektionstitel").fill(value);if(host==="row")await form.getByLabel("Etikett (visas i offert)").fill(value);
    const loss=await loseResponse(page,"**/calculations/**");const button=host==="quote"?form.getByTestId("confirm-create-quote-version"):form.getByRole("button",{name:host==="section"?"Spara sektion":host==="row"?"Spara rad":"Spara skatte- och momsuppgifter"});await button.click();await expect.poll(loss.count).toBe(1);await expect(form.getByRole("status")).toContainText(/obekräftat/i);
    // Neighboring header form is never confirmed by this operation.
    await expect(headerForm(page).getByText("Kalkylen har sparats.")).toHaveCount(0);
    await form.getByRole("button",{name:"Kontrollera resultat"}).click();await expect(form.getByRole("status")).toContainText(/ursprungliga.*bekräftad/i);await loss.remove();
    if(host==="quote"){await form.getByRole("link",{name:"Öppna bekräftat resultat"}).click();await expect(page).toHaveURL(/\/quotes\/[^/]+\/versions\/[^/]+$/);}
    else {const observer=await context.newPage();try{await observer.goto(url);if(host==="section")await expect(observer.getByLabel("Sektionstitel").first()).toHaveValue(value);if(host==="row")await expect(observer.getByLabel("Etikett (visas i offert)").first()).toHaveValue(value);if(host==="tax")await expect(observer.getByLabel("Momshantering")).toHaveValue("STANDARD_VAT_25");}finally{await observer.close();}}
  });
}
async function addSection(page:Page){await page.getByTestId("add-section").click();const form=page.getByTestId("add-section-form");await expect(form).toHaveAttribute("data-editor-ready","true");await form.getByLabel("Sektionstitel").fill("Safety section");await form.getByRole("button",{name:"Skapa sektion"}).click();await expect(page.getByTestId("section-editor")).toHaveCount(1);}
async function addRow(page:Page){await page.getByTestId("add-row").click();const form=page.getByTestId("row-create-form");await expect(form).toHaveAttribute("data-editor-ready","true");await form.getByLabel("Antal",{exact:true}).fill("1");await form.getByLabel("Enhet",{exact:true}).fill("h");await form.getByLabel("Kostnad (kr)").fill("20");await form.getByLabel("Pris (kr)").fill("100");await form.getByLabel("Moms (%)").fill("25");await form.getByRole("button",{name:"Lägg till rad",exact:true}).click();await expect(page.getByTestId("row-edit-form")).toHaveCount(1);}
async function loseResponse(page:Page,pattern:string){let count=0;await page.route(pattern,async route=>{if(route.request().method()!=="POST"||!route.request().headers()["next-action"]||count||!route.request().postData()?.includes("operation_id"))return route.continue();count++;await route.fetch();await route.abort("failed");});return{count:()=>count,remove:()=>page.unroute(pattern)};}
// Full downstream seventeen-state presentation acceptance remains separately owned.
