import { ScrapedData } from '../domain/model';

export interface Scraper {
  scrape(): Promise<ScrapedData[]>;
}
