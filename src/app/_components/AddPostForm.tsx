"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { addPost } from "../actions";

export default function AddPostForm() {
  const [postContent, setPostContent] = useState("");
  const [userId, setUserId] = useState("");
  const { userId: userIdFromClerk } = useAuth();

  if (!userIdFromClerk) return null;

  if (userId !== userIdFromClerk) setUserId(userIdFromClerk);

  const handleSubmit = () => {
    addPost(userId, postContent);
    setPostContent("");
  };

  return (
    <form action={handleSubmit} className="flex flex-col items-center">
      <input
        type="text"
        name="user_id"
        value={userId}
        onChange={() => null}
        hidden
      />
      <input
        type="text"
        name="post"
        placeholder="Write something..."
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        className="rounded border-2 p-2 px-4 text-black"
      />
      <br />
      <button
        type="submit"
        className="rounded border-2 bg-green-700 p-2 px-4 hover:bg-green-600"
      >
        Add New Post
      </button>
    </form>
  );
}
