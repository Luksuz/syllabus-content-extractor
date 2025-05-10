import { z } from "zod"
import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { RunnableSequence } from "@langchain/core/runnables"
import { JsonOutputParser } from "@langchain/core/output_parsers"
import type { StructuredOutput } from "./types"

// Zod schemas for validation
const QuestionSchema = z.object({
  text: z.string().describe("The text of the question"),
  type: z
    .enum(["MULTIPLE_CHOICE", "FILL_IN_THE_BLANK", "OPEN_ENDED", "MATCHING", "DIAGRAM", "OTHER"])
    .describe("The type of question"),
  options: z.array(z.string()).optional().describe("Options for multiple choice or matching questions"),
  answer: z.string().optional().describe("The answer to the question if available"),
  isUnusualFormat: z.boolean().optional().describe("Flag for questions with unusual formats like diagrams"),
})

const SubmoduleSchema = z.object({
  title: z.string().describe("Title of the submodule"),
  description: z.string().optional().describe("Description of the submodule"),
  questions: z.array(QuestionSchema).describe("Questions in this submodule"),
})

const ChapterSchema = z.object({
  title: z.string().describe("Title of the chapter"),
  description: z.string().optional().describe("Description of the chapter"),
  submodules: z.array(SubmoduleSchema).describe("Submodules in this chapter"),
})

const StructuredOutputSchema = z.object({
  title: z.string().describe("Title of the syllabus"),
  description: z.string().optional().describe("Description or overview of the syllabus"),
  chapters: z.array(ChapterSchema).describe("Chapters in the syllabus"),
})

export async function processWithLangChain(text: string): Promise<StructuredOutput> {
  // Initialize the OpenAI model
  const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.2,
  })

  // Create a prompt template
  const promptTemplate = PromptTemplate.fromTemplate(`
    You are an expert educational content analyzer. Your task is to analyze the following syllabus document and structure it into chapters, submodules, and questions with answers.

    Here are your instructions:
    1. Identify the main chapters or units in the syllabus
    2. For each chapter, identify submodules or sections
    3. For each submodule, extract any questions and their answers
    4. Categorize each question by type (multiple choice, fill-in-the-blank, open-ended, matching, diagram, or other)
    5. If a question has options (like in multiple choice), extract those as well
    6. If answer keys are provided, extract the answers

    Document to analyze:
    {text}

    Provide your analysis in a structured JSON format that follows this schema:
    {schema}

    Be thorough and accurate in your analysis. If you're unsure about any part, make your best guess but flag it appropriately.
  `)

  // Create a JSON output parser
  const outputParser = new JsonOutputParser<StructuredOutput>()

  // Create a runnable sequence
  const chain = RunnableSequence.from([
    {
      text: (input: { text: string }) => input.text,
      schema: () => JSON.stringify(StructuredOutputSchema.describe(), null, 2),
    },
    promptTemplate,
    model,
    outputParser,
  ])

  try {
    // Run the chain
    const result = await chain.invoke({ text })
    return result
  } catch (error) {
    console.error("Error in LangChain processing:", error)
    throw new Error("Failed to process document with LangChain")
  }
}
