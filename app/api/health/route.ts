import { NextResponse } from "next/server";
import { connectToDatabase } from "@/src/lib/mongodb";

export async function GET() {
  try {
    await connectToDatabase();

    return NextResponse.json({
      ok: true,
      message: "Database connected successfully",
    });
  } catch (error) {
    console.error("Health check DB error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Database connection failed",
      },
      { status: 500 }
    );
  }
}