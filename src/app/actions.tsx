"use server";

import { db } from "@/db";
import { user, scrapedData } from "@/db/schema";
import { revalidatePath } from "next/cache";

// export async function addPost(userId: string, content: string) {
//   const update = await db.insert(post).values({
//     user_id: userId,
//     content,
//   });

//   revalidatePath("/");
//   return update;
// }

export async function addScrapedData(
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

export async function createUser(userId: string) {
  const update = await db.insert(user).values({
    clerkId: userId,
  });

  revalidatePath("/");
  return update;
}
