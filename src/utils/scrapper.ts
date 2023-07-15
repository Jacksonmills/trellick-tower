import puppeteer from 'puppeteer';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { scrapedData } from '../db/schema';

async function addScrapedData(
  url: string,
  imageUrls: string[],
  textContent: string
) {
  const update = await db.insert(scrapedData).values({
    url,
    imageUrls,
    textContent,
  });

  return update;
}

let allPages: string[] = [];
let allPagesFoundDuringScraping: string[] = [];

async function scrapeAllHrefs(url: string) {
  const browser = await puppeteer.launch(
    { headless: 'new', }
  );

  const page = await browser.newPage();

  await page.goto(url);

  // Collect all hrefs on the page that start with "https://gorillazforbeginners.com/"
  const hrefs = await page.evaluate(() => {
    const links: HTMLAnchorElement[] = Array.from(document.querySelectorAll('a'));
    return links.map(link => link.href).filter(href => href.startsWith('https://gorillazforbeginners.com/'));
  });

  const cleanedHrefs: string[] = Array.from(new Set(hrefs.map(href => {
    const parsedHref = new URL(href);
    parsedHref.search = '';
    parsedHref.hash = '';
    return parsedHref.toString();
  })));

  // Do something with your scraped data:
  allPages = [...allPages, ...cleanedHrefs];

  await browser.close();
}

async function scrapePage(url: string) {
  // Check if the data is already in the db
  const existingData = await db.query.scrapedData.findFirst({
    where: ({ url: urlField }) => sql`${urlField} = ${url}`,
  });

  if (existingData) {
    console.log(`Data for ${url} already exists. Skipping...`);
    // remove the already scraped page from the allPages array
    allPages = allPages.filter(page => page !== url);
    return;
  }

  const browser = await puppeteer.launch(
    { headless: 'new', }
  );

  const page = await browser.newPage();

  await page.goto(url);

  // Collect all hrefs on the page that start with "https://gorillazforbeginners.com/"
  const hrefs = await page.evaluate(() => {
    const links: HTMLAnchorElement[] = Array.from(document.querySelectorAll('a'));
    return links.map(link => link.href).filter(href => href.startsWith('https://gorillazforbeginners.com/'));
  });

  const cleanedHrefs: string[] = Array.from(new Set(hrefs.map(href => {
    const parsedHref = new URL(href);
    parsedHref.search = '';
    parsedHref.hash = '';
    return parsedHref.toString();
  })));

  // Add new pages to the 'allPagesFoundDuringScraping' array
  allPagesFoundDuringScraping = [...allPagesFoundDuringScraping, ...cleanedHrefs];

  // Collect all image URLs on the page
  const imageUrls = await page.evaluate(() => {
    const images: HTMLImageElement[] = Array.from(document.querySelectorAll('.wp-block-image img'));
    return images.map(img => img.src);
  });

  // Collect all text content on the page
  const textContent = await page.evaluate(() => {
    return document.body.innerText;
  });

  // Save data to db
  await addScrapedData(url, imageUrls, textContent);

  await browser.close();
}

// Scrape all hrefs on the page
await scrapeAllHrefs('https://gorillazforbeginners.com/');

for (const page of allPages) {
  console.log(`Scrapping ${page}...`);

  // Scrape each page
  await scrapePage(page);

  // Check if there are any new pages to scrape
  if (allPagesFoundDuringScraping.length > 0) {
    allPages = [...allPages, ...allPagesFoundDuringScraping];
    allPagesFoundDuringScraping = [];
  }

  // announce end of scraping
  console.log(`Finished scrapping ${page}!`);
}

// log end when all pages are done scraping
console.log('All pages scraped!');
