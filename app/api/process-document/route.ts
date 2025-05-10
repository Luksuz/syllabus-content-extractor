import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("pdf") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if the file is a PDF
    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 })
    }

    try {
      // Create a new FormData object to send to the external API
      const apiFormData = new FormData()
      apiFormData.append("pdf", file)

      console.log("Sending request to external API...")

      // Send the PDF to the external API
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/extract-sections/`, {
        method: "POST",
        headers: {
          // Add the ngrok-skip-browser-warning header to bypass the warning
          "ngrok-skip-browser-warning": "true",
        },
        body: apiFormData,
      })

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text()
        console.error("API Error:", errorText)
        throw new Error(`External API error: ${apiResponse.status} ${apiResponse.statusText}`)
      }

      // Get the JSON response from the API
      const data = await apiResponse.json()
      return NextResponse.json(data)
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)

      // For demo purposes, return mock data if the external API is unavailable
      console.log("Using fallback mock data...")
      return NextResponse.json(getMockData())
    }
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json(
      { error: "Failed to process document: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 },
    )
  }
}

// Mock data function for fallback when the API is unavailable
function getMockData() {
  return [
    {
      is_exercise_page: true,
      sections: [
        {
          section_number: 1.0,
          section_questions: [
            {
              question_type: "multiple_choice",
              prompt: "What is the capital of France?",
              options: [
                { text: "London", correct: false },
                { text: "Paris", correct: true },
                { text: "Berlin", correct: false },
                { text: "Madrid", correct: false },
              ],
            },
            {
              question_type: "fill_in_blank",
              prompt: "Complete the following sentences about geography:",
              qa_pairs: [
                { text_with_blank: "The largest ocean on Earth is the _____ Ocean.", blank_text_answer: "Pacific" },
                { text_with_blank: "The longest river in the world is the _____ River.", blank_text_answer: "Nile" },
              ],
            },
          ],
        },
      ],
    },
    {
      is_exercise_page: false,
      sections: [
        {
          section_number: 2.0,
          section_questions: [
            {
              question_type: "open_ended",
              prompt: "Explain the water cycle and its importance to Earth's ecosystems.",
              answer:
                "The water cycle is the continuous movement of water within Earth and its atmosphere. It includes processes like evaporation, condensation, precipitation, infiltration, and runoff. This cycle is crucial for maintaining ecosystems as it replenishes freshwater supplies, regulates climate, and supports all life on Earth.",
            },
          ],
        },
      ],
    },
  ]
}

export const config = {
  api: {
    bodyParser: false,
  },
}
