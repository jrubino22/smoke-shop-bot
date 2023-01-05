const playwright = require('playwright');
const browserType = 'chromium';
const { expect } = require('@playwright/test');
const fs = require('fs');


async function main() {
  const shopNameArray = [];
  const phoneNumArray = [];
  const addressArray = [];

  for (let zipCode = 10001; zipCode < 10002; zipCode++) {
    const browser = await playwright[browserType].launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://google.com');
    await page.waitForLoadState('load');

    const searchTerm = `smoke shops zip code ${zipCode}`;
    const input = page.locator('input[name="q"]');

    await input.fill(searchTerm);
    await page.waitForTimeout(2000);
    await input.press('Enter');

    const links = page.locator('a[data-hveid="CAEQAw"]');
    console.log(' sc ', links);
    try {
      await links.click();
      await page.waitForLoadState('load');
      await page
        .locator('div[role="feed"]')
        .evaluate((e) => (e.scrollTop = e.scrollHeight * 2));
    } catch {
      zipCode = zipCode - 1;
    }

    await page.waitForTimeout(2000);
    const storeContainer = page.locator('[role="article"]');
    const count = await storeContainer.count();
    console.log('count', count);
    const re = new RegExp([0 - 9]);

    for (let i = 0; i < count; i++) {
      const c = storeContainer.nth(i).locator('[jstcache="154"]');
      const n = await c.count();

      const phoneNum = await storeContainer
        .nth(i)
        .locator('[jstcache="154"]')
        .nth(n - 1)
        .textContent();

      console.log('phone: ', phoneNum);

      try {
        shopNameArray.push(
          await storeContainer.nth(i).getAttribute('aria-label')
        );
        addressArray.push(
          (await storeContainer
            .nth(i)
            .locator('[jstcache="154"]')
            .nth(1)
            .textContent()) +
            ' - ' +
            zipCode
        );
        if (phoneNum) {
          phoneNumArray.push(phoneNum);
        } else {
          phoneNumArray.push('not listed');
        }
      } catch {
        i = i;
      }
    }

    await page.waitForTimeout(3000);

    await browser.close();
  }

  console.log('shop names', shopNameArray);
  console.log('phone Numbers', phoneNumArray);
  console.log('addresses', addressArray);

  const headers = ['Name', 'Phone Number', 'Address'];
  const columns = [shopNameArray, phoneNumArray, addressArray];

  function csvRows(headers, columns) {
    const output = [headers];
    const numRows = columns
      .map((col) => col.length)
      .reduce((a, b) => Math.max(a, b));

    for (let row = 0; row < numRows; row++) {
      output.push(columns.map((c) => c[row] || ''));
    }

    return output;
  }

  function csvString(data) {
    let output = '';
    data.forEach((row) => (output += row.join(',') + '\n'));
    return output;
  }

  function csvConstructor(headers, columns) {
    return csvString(csvRows(headers, columns));
  }


fs.appendFile(`shops.csv`, csvConstructor(headers, columns), function (err) {
  if (err) throw err;
})

}
main();
