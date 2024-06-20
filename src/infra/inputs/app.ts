import express from 'express';
import { WebScraper } from '../adapters/webScraper';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

app.get('/scrape', async (_req, res) => {
  const webScraper = new WebScraper();
  try {
    await webScraper.scrape();

    // Combine all batch files
    const dataDir = path.join(__dirname, '../../data');
    const files = fs.readdirSync(dataDir);
    let allData: any[] = [];

    files.forEach((file) => {
      const filePath = path.join(dataDir, file);
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      allData = allData.concat(fileData);
    });

    res.json(allData);
  } catch (error) {
    res.status(500).send('Error during scraping');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
