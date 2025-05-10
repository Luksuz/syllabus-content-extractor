// Define the types based on the provided JSON schema

// Multiple Choice Question
export interface MultipleChoiceOption {
  text: string
  correct: boolean
}

export interface MultipleChoiceQuestion {
  question_type: "multiple_choice"
  prompt: string
  options: MultipleChoiceOption[]
}

// Fill in Blank Question
export interface QAPair {
  text_with_blank: string
  blank_text_answer: string
}

export interface FillInBlankQuestion {
  question_type: "fill_in_blank"
  prompt: string
  qa_pairs: QAPair[]
}

// Open Ended Question
export interface OpenEndedQuestion {
  question_type: "open_ended"
  prompt: string
  answer?: string
}

// Union type for all question types
export type Question = MultipleChoiceQuestion | FillInBlankQuestion | OpenEndedQuestion

// Section type
export interface Section {
  section_number: number
  section_questions: Question[]
}

// Page type
export interface Page {
  is_exercise_page: boolean
  sections: Section[]
}

// The full syllabus data type (array of pages)
export type SyllabusData = Page[]

export type QuestionType = "MULTIPLE_CHOICE" | "FILL_IN_THE_BLANK" | "OPEN_ENDED" | "MATCHING" | "DIAGRAM" | "OTHER"

export type OldQuestion = {
  text: string
  type: QuestionType
  options?: string[]
  answer?: string
  isUnusualFormat?: boolean
}

export type Submodule = {
  title: string
  description?: string
  questions: OldQuestion[]
}

export type Chapter = {
  title: string
  description?: string
  submodules: Submodule[]
}

export type StructuredOutput = {
  title: string
  description?: string
  chapters: Chapter[]
}
