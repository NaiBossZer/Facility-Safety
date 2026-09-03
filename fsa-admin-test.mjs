import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const logs = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`${m.type()}: ${m.text()}`); });
page.on('pageerror', e => logs.push(`pageerror: ${e.message}`));
await page.goto('http://127.0.0.1:4178/', { waitUntil: 'networkidle' });
await page.locator('select').selectOption({ index: 1 });
await page.locator('input[type="password"]').fill('1234');
await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
await page.waitForTimeout(500);
await page.getByRole('button', { name: /Admin Console/ }).click();
await page.waitForTimeout(400);
const before = (await page.locator('main').innerText()).slice(0, 700);
for (const digit of '112233') {
  await page.getByRole('button', { name: digit, exact: true }).click();
  await page.waitForTimeout(120);
}
await page.waitForTimeout(1800);
await page.waitForTimeout(1500);
const adminBefore = await page.locator('main').first().innerText();
await page.getByRole('button', { name: 'หมวด & รายการตรวจ' }).click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: 'เพิ่มหมวด' }).click();
await page.locator('input[placeholder*="เช่น ระบบดับเพลิง"]').fill('TEST-ADMIN-CATEGORY');
await page.getByRole('button', { name: 'บันทึก', exact: true }).click();
await page.waitForTimeout(800);
const afterSave = await page.locator('main').first().innerText();
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);
if (await page.getByRole('button', { name: '1', exact: true }).count()) {
  for (const digit of '112233') {
    await page.getByRole('button', { name: digit, exact: true }).click();
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1000);
}
await page.getByRole('button', { name: 'หมวด & รายการตรวจ' }).click();
await page.waitForTimeout(300);
const afterRefresh = await page.locator('main').first().innerText();
const categoryPersisted = afterRefresh.includes('TEST-ADMIN-CATEGORY');
await page.getByRole('button', { name: 'TEST-ADMIN-CATEGORY', exact: true }).click();
await page.getByRole('button', { name: 'เพิ่มรายการตรวจ' }).click();
await page.locator('input[placeholder*="เช่น ตรวจสอบความดัน"]').fill('TEST-ADMIN-ITEM');
await page.getByRole('button', { name: 'บันทึกรายการ', exact: true }).click();
await page.waitForTimeout(800);
const itemAfterSave = await page.locator('main').first().innerText();
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);
if (await page.getByRole('button', { name: '1', exact: true }).count()) {
  for (const digit of '112233') {
    await page.getByRole('button', { name: digit, exact: true }).click();
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1000);
}
await page.getByRole('button', { name: 'หมวด & รายการตรวจ' }).click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: 'TEST-ADMIN-CATEGORY', exact: true }).click();
await page.waitForTimeout(200);
const itemAfterRefresh = await page.locator('main').first().innerText();
const localCatalog = await page.evaluate(() => JSON.parse(localStorage.getItem('fsa:v2:catalog') || 'null'));
console.log(JSON.stringify({ before, adminBefore: adminBefore.slice(0,700), categoryVisibleAfterSave: afterSave.includes('TEST-ADMIN-CATEGORY'), categoryPersistedAfterRefresh: categoryPersisted, itemVisibleAfterSave: itemAfterSave.includes('TEST-ADMIN-ITEM'), itemPersistedAfterRefresh: itemAfterRefresh.includes('TEST-ADMIN-ITEM'), localCategories: localCatalog?.categories?.map(c => c.name), logs }, null, 2));
await browser.close();