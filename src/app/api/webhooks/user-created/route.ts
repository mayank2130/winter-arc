import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createUser } from "@/actions/auth";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const userId = payload.data.id;
    if (!userId) return new NextResponse("Missing user ID", { status: 400 });

    const user = await (await clerkClient()).users.getUser(userId);

    const result = await createUser({
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress || "",
      imageUrl: user.imageUrl,
    });

    if (result.success) {
      return new NextResponse("User created in DB", { status: 200 });
    } else {
      return new NextResponse("User not created in DB", { status: 500 });
    }
  } catch (err) {
    console.error("Error in user.created webhook:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
