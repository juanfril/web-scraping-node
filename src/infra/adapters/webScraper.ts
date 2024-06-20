import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { ScrapedData } from '../../domain/model';
import { Scraper } from '../../application/scraper.port';

export class WebScraper implements Scraper {
  async scrape(): Promise<ScrapedData[]> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    await page.goto('https://members.collegeofopticians.ca/Public-Register', {
      waitUntil: 'networkidle2',
    });

    await page.click('input[value="Find"]');
    await page.waitForSelector('.rgRow, .rgAltRow');

    const scrapedData: ScrapedData[] = [];
    let currentPage = 1;
    const maxPagesPerRun = 2; // Number of pages to scrape per run
    let batchNumber = 1;

    while (true) {
      const batchData: ScrapedData[] = [];

      for (let i = 0; i < maxPagesPerRun; i++) {
        // Scrape the results
        const data = await page.evaluate(() => {
          const rows = Array.from(
            document.querySelectorAll('.rgRow, .rgAltRow')
          );
          return rows.map((row) => ({
            name:
              row.querySelector('td:nth-child(2)')?.textContent?.trim() || '',
            details:
              row.querySelector('td:nth-child(3)')?.textContent?.trim() || '',
          }));
        });
        batchData.push(...data);

        // Check if there is a next page
        const nextButton = await page.$('.rgPageNext');
        if (nextButton) {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            nextButton.click(),
          ]);
          currentPage++;
        } else {
          break;
        }
      }

      // Save the current batch to a JSON file
      fs.writeFileSync(
        path.join(__dirname, `../../data/batch_${batchNumber}.json`),
        JSON.stringify(batchData, null, 2)
      );
      batchNumber++;

      scrapedData.push(...batchData);

      // Exit the loop if there are no more pages
      if (!(await page.$('.rgPageNext'))) {
        break;
      }
    }

    await browser.close();
    return scrapedData;
  }
}
