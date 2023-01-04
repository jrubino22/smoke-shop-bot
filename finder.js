const playwright = require('playwright');
const browserType = 'chromium';
async function main() {
  const shopNameArray = [];
  const phoneNumArray = [];
  const addressArray = [];
  const websiteArray = [];

  for (let zipCode = 10001; zipCode < 10005; zipCode++) {
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
    } catch {
      zipCode = zipCode - 1;
    }
    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);

    const storeContainer = page.locator('div[data-js-log-root]');

    const count = await storeContainer.count();
    const storeName =
      page.locator('span[class="OSrXXb"]') ||
      page.locator('div[role="heading"]');
    console.log('count', count);
    for (let i = 0; i < count; i++) {
      console.log('text', await storeContainer.nth(i));
      shopNameArray.push(await storeContainer.nth(i).textContent());
    }

    await page.waitForTimeout(3000);

    await browser.close();
  }

  console.log('shop names', shopNameArray);
}
main();

// console.log('sc', storeContainer);
// storeContainer.evaluateAll(
//   shopNameArray.push(
//     await page.$('div[class="fontHeadlineSmall"]').textContent
//   )
// );

// const count1 = await expect(page.$('a[data-hveid="CAEQAw"]')).toHaveCount(0)
// const findFunction = () => {
//   if (count1) {
//     return page.locator('a[data-hveid="CAEQAw"]');
//   } else if (page.$('a[data-hveid="CAMQAw"]')) {
//     return page.locator('a[data-hveid="CAMQAw"]');
//   } else if (page.$('a[data-hveid="CAEQAw"]')) {
//     return page.locator('a[data-hveid="CAEQAw"]');
//   } else {
//     zipCode = zipCode - 1;
//   }
// };

//  const mapClicks1 = page.$('a[data-hveid="CAEQAw"]');
//   const mapClicks2 = page.$('a[data-hveid="CAMQAw"]');
//   const mapClicks3 = page.$('a[data-hveid="CAIQAw"]');
//  mapClicks1 ? await mapClicks1.click() : mapClicks2 ? await mapClicks2.click() : mapClicks3 ? await mapClicks3.click() : page.refresh()
