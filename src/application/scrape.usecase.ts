import { ScrapedData } from '../domain/model';
import { Scraper } from './scraper.port';

export class ScrapeUsecase {
  constructor(private scraper: Scraper) {}

  async execute(): Promise<ScrapedData[]> {
    console.log('inside execute');

    return this.scraper.scrape();
  }
}
