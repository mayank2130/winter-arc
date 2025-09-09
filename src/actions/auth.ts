'use server';

import { client } from "@/lib/prisma";

export async function createUser({ clerkId, email, imageUrl }: {
  clerkId: string;
  email: string;
  imageUrl: string;
}) {
  try {
    const existingUser = await client.user.findUnique({
      where: { clerkId },
    });

    if (existingUser) return { success: true, user: existingUser };

    const newUser = await client.user.create({
      data: { clerkId, email, imageUrl },
    });

    return { success: true, user: newUser };
    
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}