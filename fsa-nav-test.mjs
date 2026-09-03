import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const base = 'http://127.0.0.1:4178/';
await page.goto(base, { waitUntil: 'networkidle' });
await page.locator('select').selectOption({ index: 1 });
await page.locator('input[type="password"]').fill('1234');
await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
await page.waitForTimeout(1000);
const nav = [
  ['dashboard','Dashboard'], ['inspection','Inspection Checklist'], ['workorder','Work Orders'],
  ['procurement','E-Procurement'], ['reports','Official Reports'], ['admin','Admin Console']
];
const results = [];
for (const [id,label] of nav) {
  const button = page.getByRole('button', { name: new RegExp(label) }).first();
  await button.click();
  await page.waitForTimeout(350);
  const clickedActive = await button.evaluate(el => el.className.includes('bg-indigo-600') || el.className.includes('bg-[#002D62]'));
  const clickedText = (await page.locator('main').innerText()).slice(0, 180).replace(/\n/g,' | ');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const refreshActive = await page.getByRole('button', { name: new RegExp(label) }).first().evaluate(el => el.className.includes('bg-indigo-600') || el.className.includes('bg-[#002D62]'));
  results.push({ page:id, clickedActive, refreshActive, main: (await page.locator('main').innerText()).slice(0,180).replace(/\n/g,' | ') });
}
console.log(JSON.stringify(results, null, 2));
await browser.close();