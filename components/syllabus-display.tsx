"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  SyllabusData,
  Section,
  Question,
  MultipleChoiceQuestion,
  FillInBlankQuestion,
  OpenEndedQuestion,
} from "@/lib/types"
import { CheckCircle, XCircle } from "lucide-react"

interface SyllabusDisplayProps {
  data: SyllabusData
}

export function SyllabusDisplay({ data }: SyllabusDisplayProps) {
  const [activeTab, setActiveTab] = useState("all")

  // Filter pages based on the active tab
  const filteredPages =
    activeTab === "all"
      ? data
      : activeTab === "exercises"
        ? data.filter((page) => page.is_exercise_page)
        : data.filter((page) => !page.is_exercise_page)

  const renderMultipleChoiceQuestion = (question: MultipleChoiceQuestion) => (
    <div className="border rounded-md p-4 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="font-medium">{question.prompt}</div>
        <Badge className="bg-blue-100 text-blue-800 font-normal">Multiple Choice</Badge>
      </div>

      <div className="mt-2 space-y-2">
        {question.options.map((option, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {option.correct ? (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-300 flex-shrink-0" />
            )}
            <span className={option.correct ? "font-medium" : ""}>{option.text}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderFillInBlankQuestion = (question: FillInBlankQuestion) => (
    <div className="border rounded-md p-4 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="font-medium">{question.prompt}</div>
        <Badge className="bg-green-100 text-green-800 font-normal">Fill in the Blank</Badge>
      </div>

      <div className="mt-2 space-y-3">
        {question.qa_pairs.map((pair, idx) => (
          <div key={idx} className="space-y-1">
            <div className="text-sm">{pair.text_with_blank}</div>
            <div className="pl-4 border-l-2 border-green-500">
              <span className="text-sm font-medium text-green-700">Answer: </span>
              <span className="text-sm">{pair.blank_text_answer}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderOpenEndedQuestion = (question: OpenEndedQuestion) => (
    <div className="border rounded-md p-4 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="font-medium">{question.prompt}</div>
        <Badge className="bg-purple-100 text-purple-800 font-normal">Open Ended</Badge>
      </div>

      {question.answer && (
        <div className="mt-3 pt-3 border-t border-dashed">
          <div className="text-sm font-medium text-gray-700">Answer:</div>
          <div className="text-sm mt-1">{question.answer}</div>
        </div>
      )}
    </div>
  )

  const renderQuestion = (question: Question) => {
    switch (question.question_type) {
      case "multiple_choice":
        return renderMultipleChoiceQuestion(question as MultipleChoiceQuestion)
      case "fill_in_blank":
        return renderFillInBlankQuestion(question as FillInBlankQuestion)
      case "open_ended":
        return renderOpenEndedQuestion(question as OpenEndedQuestion)
      default:
        return <div>Unknown question type</div>
    }
  }

  const renderSection = (section: Section) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Section {section.section_number}</CardTitle>
      </CardHeader>
      <CardContent>
        {section.section_questions && section.section_questions.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium mb-3">Questions ({section.section_questions.length})</h4>
            {section.section_questions.map((question, idx) => (
              <div key={idx}>{renderQuestion(question)}</div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No questions found in this section</p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="mt-8 w-full">
      <h2 className="text-2xl font-bold mb-6">Syllabus Structure</h2>

      <Tabs defaultValue="all" className="w-full mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Pages</TabsTrigger>
          <TabsTrigger value="exercises">Exercise Pages</TabsTrigger>
          <TabsTrigger value="lectures">Lecture Pages</TabsTrigger>
        </TabsList>
      </Tabs>

      <Accordion type="single" collapsible className="w-full">
        {filteredPages.map((page, pageIdx) => (
          <AccordionItem key={pageIdx} value={`page-${pageIdx}`}>
            <AccordionTrigger className="text-xl font-semibold">
              Page {pageIdx + 1} {page.is_exercise_page ? "(Exercise)" : "(Lecture)"}
            </AccordionTrigger>
            <AccordionContent>
              {page.sections && page.sections.length > 0 ? (
                <div className="pl-4">
                  {page.sections.map((section, sectionIdx) => (
                    <div key={sectionIdx} className="mb-6">
                      {renderSection(section)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No sections found on this page</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
