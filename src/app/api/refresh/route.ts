import { refreshIssues } from "@/lib/data";
import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Cannot refresh in production mode." }, { status: 403 });
  }

  try {
    const data = await refreshIssues();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
