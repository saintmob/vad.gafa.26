import { updatePerson } from "@/lib/data";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Cannot update in production mode." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const data = await updatePerson(body);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
