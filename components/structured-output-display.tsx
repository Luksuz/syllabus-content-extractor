"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Question, QuestionType, StructuredOutput, Submodule } from "@/lib/types"

interface StructuredOutputDisplayProps {
  data: StructuredOutput
}

export function StructuredOutputDisplay({ data }: StructuredOutputDisplayProps) {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null)

  const getQuestionTypeBadge = (type: QuestionType) => {
    const colors: Record<QuestionType, string> = {
      MULTIPLE_CHOICE: "bg-blue-100 text-blue-800",
      FILL_IN_THE_BLANK: "bg-green-100 text-green-800",
      OPEN_ENDED: "bg-purple-100 text-purple-800",
      MATCHING: "bg-yellow-100 text-yellow-800",
      DIAGRAM: "bg-red-100 text-red-800",
      OTHER: "bg-gray-100 text-gray-800",
    }

    return <Badge className={`${colors[type]} font-normal`}>{type.replace(/_/g, " ")}</Badge>
  }

  const renderQuestion = (question: Question) => (
    <div className="border rounded-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium">{question.text}</div>
        {getQuestionTypeBadge(question.type)}
      </div>

      {question.options && question.options.length > 0 && (
        <div className="mt-2 pl-4">
          <div className="text-sm text-gray-500 mb-1">Options:</div>
          <ul className="list-disc pl-5">
            {question.options.map((option, idx) => (
              <li key={idx} className="text-sm">
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}

      {question.answer && (
        <div className="mt-3 pt-3 border-t border-dashed">
          <div className="text-sm font-medium text-gray-700">Answer:</div>
          <div className="text-sm mt-1">{question.answer}</div>
        </div>
      )}
    </div>
  )

  const renderSubmodule = (submodule: Submodule) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{submodule.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {submodule.description && <p className="text-sm text-gray-600 mb-4">{submodule.description}</p>}

        {submodule.questions && submodule.questions.length > 0 ? (
          <div>
            <h4 className="text-sm font-medium mb-3">Questions ({submodule.questions.length})</h4>
            {submodule.questions.map((question, idx) => (
              <div key={idx}>{renderQuestion(question)}</div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No questions found in this submodule</p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="mt-8 w-full">
      <h2 className="text-2xl font-bold mb-6">Structured Output</h2>

      <Accordion type="single" collapsible className="w-full">
        {data.chapters.map((chapter, idx) => (
          <AccordionItem key={idx} value={`chapter-${idx}`}>
            <AccordionTrigger className="text-xl font-semibold">{chapter.title}</AccordionTrigger>
            <AccordionContent>
              {chapter.description && <p className="text-gray-600 mb-4">{chapter.description}</p>}

              {chapter.submodules && chapter.submodules.length > 0 ? (
                <div className="pl-4">
                  {chapter.submodules.map((submodule, subIdx) => (
                    <div key={subIdx} className="mb-6">
                      {renderSubmodule(submodule)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No submodules found in this chapter</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
