import { NextResponse } from "next/server";

export default function handler(req: Request) {
  console.log("Request received:");
  return NextResponse.next();
}