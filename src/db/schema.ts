// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  json,
  mysqlTable,
  serial,
  text,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

// users
export const user = mysqlTable(
  "users",
  {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerk_id", { length: 256 }),
  },
  (user) => ({
    clerkIndex: uniqueIndex("clerk_idx").on(user.clerkId),
  })
);

// scraped_data
export const scrapedData = mysqlTable(
  "scraped_data",
  {
    id: serial("id").primaryKey(),
    url: text("url"),
    imageUrls: json("imageUrls"),
    textContent: text("textContent"),
  },
  (scrapedData) => ({
    urlIndex: uniqueIndex("url_idx").on(scrapedData.url),
  }),
);
