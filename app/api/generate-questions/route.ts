import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    // TODO: Potentially extract other parameters from formData if needed

    // Assuming process_document_generate_questions is an internal API route
    // The base URL for internal API routes can be constructed or might need to be absolute
    // depending on your deployment environment. For local development,
    // `request.nextUrl.origin` should give the base.
    const internalApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/process_pdf_generate_questions/`;

    // Forward the FormData to the internal endpoint
    const response = await fetch(internalApiUrl, {
      method: "POST",
      body: formData,
      // You might need to pass through headers if required by the target endpoint
      // headers: request.headers, // Be careful with forwarding all headers
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error from internal API:", response.status, errorData);
      return NextResponse.json(
        { error: `Internal API request failed: ${errorData}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/generate-questions:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 