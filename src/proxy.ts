import { NextResponse } from "next/server";

export default function handler(req: Request) {
  return NextResponse.next();
}