import { db } from "@/db";
import { SignInButton, SignedIn, SignedOut, currentUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import AddPostForm from "./_components/AddPostForm";
import { createUser } from "./actions";

export default async function Home() {
  const user = await currentUser();

  const users = user?.id
    ? await db.query.user.findMany({
        where: (u) => eq(u.clerkId, user.id),
      })
    : [];

  if (user && !users[0]) {
    await createUser(user.id);
  }

  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <AddPostForm />
      </SignedIn>
    </div>
  );
}
