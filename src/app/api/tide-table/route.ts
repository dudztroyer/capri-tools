import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const harbor = searchParams.get("harbor");
  const month = searchParams.get("month");
  const days = searchParams.get("days");

  if (!harbor || !month || !days) {
    return NextResponse.json(
      { error: "Missing required parameters: harbor, month, and days are required" },
      { status: 400 }
    );
  }

  try {
    const apiUrl = `https://tabuamare.devtu.qzz.io/api/v2/tabua-mare/${harbor}/${month}/${days}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API request failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error proxying tide table request:", error);
    return NextResponse.json(
      { error: "Failed to fetch tide table data" },
      { status: 500 }
    );
  }
}

