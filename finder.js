const playwright = require('playwright');
const browserType = 'chromium';
const { expect } = require('@playwright/test');
const fs = require('fs');

async function main() {
  let retryStrikes = 0;
  const shopNameArray = [];
  const phoneNumArray = [];
  const addressArray = [];

  // 10001, 10002, 10003, 10004, 10005, 10006, 10007, 10009, 10010, 10011, 10012,
  // 10013, 10014, 10015, 10016, 10017, 10018

  // 10019, 10020, 10021, 10022, 10023, 10024, 10025, 10026, 10027, 10028, 10029,
  // 10030, 10031, 10032, 10033, 10034, 10035, 10036, 10037, 10038, 10039, 10040,
  // 10041, 10044, 10045, 10048, 10055,

  // 10060, 10069, 10090, 10095, 10098, 10099, 10103, 10104, 10105, 10106, 10107,
  // 10110, 10111, 10112, 10115, 10118, 10119, 10120, 10121, 10122, 10123, 10128,

  const zipCodeArray = [10151, 10151, 10151];
  // 10151, 10152, 10153, 10154, 10155, 10158, 10161, 10162, 10165, 10166, 10167,
  // 10168, 10169, 10170, 10171, 10172, 10173, 10174, 10175, 10176, 10177, 10178,
  // 10199, 10270, 10271, 10278, 10279, 10280, 10281, 10282, 10451, 10452, 10453,
  // 10454, 10455, 10456, 10457, 10458, 10459, 10460, 10461, 10462, 10463, 10464,
  // 10465, 10466, 10467, 10468, 10469, 10470, 10471, 10472, 10473, 10474, 10475,
  // 11201, 11203, 11204, 11205, 11206, 11207, 11208, 11209, 11210, 11211, 11212,
  // 11213, 11214, 11215, 11216, 11217, 11218, 11219, 11220, 11221, 11222, 11223,
  // 11224, 11225, 11226, 11228, 11229, 11230, 11231, 11232, 11233, 11234, 11235,
  // 11236, 11237, 11238, 11239, 11241, 11242, 11243, 11249, 11252, 11256,

  async function iteration1(zipCode) {
    if (zipCode < zipCodeArray.length) {
      const browser = await playwright[browserType].launch({ headless: false });
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto('http://google.com');
      await page.waitForLoadState('load');

      const searchTerm = `smoke shops zip code ${zipCodeArray[zipCode]}`;
      const input = page.locator('input[name="q"]');

      await input.fill(searchTerm);
      await page.waitForTimeout(2000);
      await input.press('Enter');

      const links = page.locator('a[data-hveid="CAEQAw"]');
      console.log(' sc ', links);
      try {
        await links.click();
        await page.waitForLoadState('load');
        for (i = 0; i < 4; i++) {
          await page.locator('div[role="feed"]').evaluate((e) => {
            e.scrollTop = e.scrollHeight;
          });
          await page.waitForTimeout(2000);
        }
      } catch {
        await browser.close();
        retryStrikes++;
        if (retryStrikes > 5) {
          retryStrikes = 0;
          return await iteration1(zipCode + 1);
        } else {
          return await iteration1(zipCode);
        }
      }

      await page.waitForTimeout(2000);
      const storeContainer = page.locator('[role="article"]');
      const count = await storeContainer.count();
      console.log('count', count);

      try {
        console.log('strikes', retryStrikes);
        console.log('index', zipCode);
        for (let i = 0; i < count; i++) {
          const c = storeContainer.nth(i).locator('[jstcache="154"]');
          const n = await c.count();
          const phoneNum1 = await storeContainer
            .nth(i)
            .locator('[jstcache="154"]')
            .nth(n - 1)
            .textContent();

          const phoneNum2 = await storeContainer
            .nth(i)
            .locator('[jstcache="154"]')
            .nth(1)
            .textContent();

          const regex =
            /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

          const address = await storeContainer
            .nth(i)
            .locator('[jstcache="154"]')
            .nth(1)
            .textContent();

          console.log('address', address);

          shopNameArray.push(
            await storeContainer.nth(i).getAttribute('aria-label')
          );
          if (address) {
            addressArray.push(address);
          } else {
            addressArray.push('NYC');
          }
          if (regex.test(phoneNum1)) {
            phoneNumArray.push(phoneNum1);
          } else if (regex.test(phoneNum2)) {
            phoneNumArray.push(phoneNum2);
          } else {
            phoneNumArray.push('not listed');
          }
        }
      } catch {
        await browser.close();
        retryStrikes++;
        if (retryStrikes > 3) {
          retryStrikes = 0;
          return await iteration1(zipCode + 1);
        } else {
          return await iteration1(zipCode);
        }
      }
      retryStrikes = 0;
      await page.waitForTimeout(3000);

      await browser.close();

      iteration1(zipCode + 1);
    } else {
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

        uniqueOutput = [...new Set(output)];

        return uniqueOutput;
      }

      function csvString(data) {
        let output = '';
        data.forEach((row) => (output += row.join(',') + '\n'));
        return output;
      }

      function csvConstructor(headers, columns) {
        return csvString(csvRows(headers, columns));
      }

      fs.appendFile(
        `test.csv`,
        csvConstructor(headers, columns),
        function (err) {
          if (err) throw err;
        }
      );
    }
  }
  iteration1(0);
}

main();
// 154
