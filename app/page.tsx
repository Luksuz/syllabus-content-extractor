"use client"; // Required for useState and event handlers

import { FileUploader } from "@/components/file-uploader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { SyllabusDisplay } from "@/components/syllabus-display"
import type { SyllabusData } from "@/lib/types"

// Define TypeScript interfaces
interface QuestionOption {
  text: string;
  is_correct: boolean;
}

interface FillInBlankPair {
  blank_text: string;
  blank_text_answer: string;
}

interface Question {
  question_type: "multiple_choice" | "fill_in_blank" | "open_ended";
  prompt: string;
  options: QuestionOption[] | null;
  fill_in_blank_pairs: FillInBlankPair[] | null;
  open_ended_answer: string | null;
}

interface GeneratedTopicQuestions {
  toc_item_title: string;
  questions: Question[];
}

// New interface for the ToC data from the generator API (matches ExtractToCOutput)
interface TocItem {
  title: string;
  description: string;
}
interface TableOfContentsData {
  items: TocItem[];
  description: string;
  audience_level: string;
}

// Updated interface for the combined API response
interface FullAnalysisData {
  table_of_contents: TableOfContentsData; // Use the new ToC interface
  topic_questions: GeneratedTopicQuestions[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"analyzer" | "generator">(
    "analyzer"
  );
  const [activeGeneratorSubTab, setActiveGeneratorSubTab] = useState<"questions" | "toc">("questions");

  // State for Syllabus Analyzer (uses SyllabusData - Page[])
  const [syllabusData, setSyllabusData] = useState<SyllabusData | null>(null);
  const [errorSyllabus, setErrorSyllabus] = useState<string | null>(null);
  const [analyzerModel, setAnalyzerModel] = useState("gpt-4.1-mini");

  // State for Question Generator - now holds the full analysis data
  const [fullAnalysisData, setFullAnalysisData] = useState<FullAnalysisData | null>(null);
  const [errorQuestions, setErrorQuestions] = useState<string | null>(null);

  // Handler for Syllabus Analyzer success
  const handleSyllabusUploadSuccess = (data: SyllabusData) => {
    setSyllabusData(data);
    setErrorSyllabus(null);
  };

  // Handler for Syllabus Analyzer error
  const handleSyllabusUploadError = (errorMessage: string) => {
    setErrorSyllabus(errorMessage);
    setSyllabusData(null);
  };

  // Handler for Question Generator success
  const handleQuestionUploadSuccess = (data: FullAnalysisData) => { // Expect FullAnalysisData
    setFullAnalysisData(data);
    setErrorQuestions(null);
    setActiveGeneratorSubTab("questions"); // Default to questions tab on new data
  };

  // Handler for Question Generator error
  const handleQuestionUploadError = (errorMessage: string) => {
    setErrorQuestions(errorMessage);
    setFullAnalysisData(null);
  };
  
  // Mock data for development - uses new FullAnalysisData and TableOfContentsData structure
  useEffect(() => {
    if (activeTab === "generator" && process.env.NODE_ENV === "development" && !fullAnalysisData && !errorQuestions) {
      const mockData: FullAnalysisData = {
        table_of_contents: { // Conforms to TableOfContentsData
          items: [
            { title: "Mock ToC Item 1", description: "Description for mock item 1 from generator" },
            { title: "Mock ToC Item 2", description: "Description for mock item 2 from generator" },
          ],
          description: "This is a mock syllabus description from generator.",
          audience_level: "Beginner (Mock Generator)",
        },
        topic_questions: [
          {
            toc_item_title: "Mock ToC Item 1",
            questions: [
              {
                question_type: "multiple_choice",
                prompt: "What is the main purpose of a programming language (Mock)?",
                options: [
                  { text: "To create graphical designs", is_correct: false },
                  { text: "To communicate with computers", is_correct: true },
                ],
                fill_in_blank_pairs: null,
                open_ended_answer: null,
              },
            ],
          },
          {
            toc_item_title: "Mock ToC Item 2",
            questions: [
              {
                question_type: "open_ended",
                prompt: "Explain compiled vs. interpreted languages (Mock).",
                options: null,
                fill_in_blank_pairs: null,
                open_ended_answer: "Mock answer.",
              },
            ],
          },
        ],
      };
      // To test the display without calling the actual API immediately:
      // setFullAnalysisData(mockData);
      // console.log("Loaded mock FullAnalysisData for development display.");
    }
  }, [activeTab, fullAnalysisData, errorQuestions]);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="mb-8 flex justify-center space-x-4">
          <Button
            onClick={() => setActiveTab("analyzer")}
            variant={activeTab === "analyzer" ? "default" : "outline"}
          >
            Syllabus Analyzer
          </Button>
          <Button
            onClick={() => {
              setActiveTab("generator");
              // Optionally clear previous generator results or set default sub-tab
              // setFullAnalysisData(null);
              // setErrorQuestions(null);
              // setActiveGeneratorSubTab("questions"); 
            }}
            variant={activeTab === "generator" ? "default" : "outline"}
          >
            Question Generator
          </Button>
        </div>

        {activeTab === "analyzer" && (
          <>
            <h1 className="text-4xl font-bold mb-8 text-center">
              Syllabus Structure Analyzer
            </h1>
            <FileUploader
              key="analyzer-uploader" 
              apiEndpoint="/api/process-document"
              onSuccess={handleSyllabusUploadSuccess}
              onError={handleSyllabusUploadError}
              fileKeyName="pdf" // as per original FileUploader logic
              submitButtonText="Process Syllabus"
              extraFormData={{ model: analyzerModel }}
            >
              <div className="mb-4">
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <div className="relative">
                  <select
                    id="model"
                    value={analyzerModel}
                    onChange={e => setAnalyzerModel(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 pr-10 py-2 pl-3 text-base appearance-none bg-white"
                  >
                    <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                    <option value="gpt-4.1">gpt-4.1</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    {analyzerModel === "gpt-4.1-mini" ? (
                      <Badge className="bg-blue-100 text-blue-800">$0.5/300</Badge>
                    ) : (
                      <Badge className="bg-purple-100 text-purple-800">$2.5/300</Badge>
                    )}
                  </div>
                </div>
              </div>
            </FileUploader>
            {errorSyllabus && <p className="text-center mt-4 text-red-500">Error: {errorSyllabus}</p>}
            {syllabusData && (
              <div className="mt-8">
                <SyllabusDisplay data={syllabusData} />
              </div>
            )}
          </>
        )}

        {activeTab === "generator" && (
          <>
            <h1 className="text-4xl font-bold mb-8 text-center">
              Question Generator
            </h1>
            <p className="text-center mb-4">
              Upload a document to generate a Table of Contents and questions based on its content.
            </p>
            <FileUploader
              key="generator-uploader"
              apiEndpoint="/api/generate-questions" // This API now returns FullAnalysisData
              onSuccess={handleQuestionUploadSuccess} // Updated handler
              onError={handleQuestionUploadError}
              fileKeyName="pdf"
              submitButtonText="Generate Analysis"
            />
            
            {errorQuestions && <p className="text-center mt-4 text-red-500">Error: {errorQuestions}</p>}

            {fullAnalysisData && (
              <div className="mt-8 w-full">
                {/* Sub-tabs for Generator */}
                <div className="mb-6 flex justify-center space-x-2 border-b">
                  <Button 
                    variant={activeGeneratorSubTab === 'questions' ? 'default' : 'ghost'} 
                    onClick={() => setActiveGeneratorSubTab("questions")}
                    className="pb-2 rounded-b-none"
                  >
                    Generated Questions
                  </Button>
                  <Button 
                    variant={activeGeneratorSubTab === 'toc' ? 'default' : 'ghost'} 
                    onClick={() => setActiveGeneratorSubTab("toc")}
                    className="pb-2 rounded-b-none"
                  >
                    Table of Contents
                  </Button>
                </div>

                {activeGeneratorSubTab === "questions" && fullAnalysisData.topic_questions.length > 0 && (
                  <div className="space-y-8">
                    <h2 className="text-3xl font-semibold mb-6 text-center">Generated Questions</h2>
                    {fullAnalysisData.topic_questions.map((topicData, topicIndex) => (
                      <div key={topicIndex} className="p-6 border rounded-xl shadow-lg bg-white mb-8">
                        <h3 className="text-2xl font-semibold mb-4 text-primary border-b pb-2">
                          Topic: {topicData.toc_item_title}
                        </h3>
                        {topicData.questions.length > 0 ? (
                          topicData.questions.map((q, index) => (
                            <div key={index} className="p-4 border rounded-lg shadow-sm bg-gray-50 mb-4">
                              <p className="font-medium text-lg mb-2">Q{index + 1}: {q.prompt}</p>
                              <Badge variant="secondary" className="mb-2">{q.question_type.replace(/_/g, ' ').toUpperCase()}</Badge>
                              {q.question_type === "multiple_choice" && q.options && (
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                  {q.options.map((opt, i) => (
                                    <li key={i} className={`${opt.is_correct ? "font-bold text-green-700" : ""} text-gray-800`}>
                                      {opt.text} {opt.is_correct && <span className="text-green-600"> (Correct)</span>}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {q.question_type === "fill_in_blank" && q.fill_in_blank_pairs && (
                                <div className="mt-2">
                                   <p className="mb-1 text-gray-800"><strong>Prompt:</strong> {q.prompt}</p>
                                  <p className="mt-1 text-gray-800"><strong>Answers:</strong></p>
                                  <ul className="list-disc pl-5 space-y-1">
                                  {q.fill_in_blank_pairs.map((pair, i) => (
                                    <li key={i} className="text-gray-800">
                                      For blank "{pair.blank_text}": <code className="bg-gray-200 p-1 rounded text-sm text-gray-900">{pair.blank_text_answer}</code>
                                    </li>
                                  ))}
                                  </ul>
                                </div>
                              )}
                              {q.question_type === "open_ended" && q.open_ended_answer && (
                                <p className="mt-2 text-gray-800"><strong>Suggested Answer:</strong> {q.open_ended_answer}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600 italic">No questions generated for this topic.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {activeGeneratorSubTab === "questions" && fullAnalysisData.topic_questions.length === 0 && (
                    <p className="text-center text-gray-600 mt-6">No questions were generated or available for the uploaded document.</p>
                )}

                {activeGeneratorSubTab === "toc" && (
                  <div className="mt-8">
                     <h2 className="text-3xl font-semibold mb-6 text-center">Table of Contents</h2>
                    {/* 
                      TODO: The SyllabusDisplay component expects SyllabusData (Page[]).
                      We now have fullAnalysisData.table_of_contents which is TableOfContentsData.
                      We need to either adapt SyllabusDisplay or create a new component 
                      to render TableOfContentsData (items, description, audience_level).
                      For now, let's put a placeholder or a simple list rendering.
                    */}
                    {fullAnalysisData && fullAnalysisData.table_of_contents && (
                      <div className="p-6 border rounded-xl shadow-lg bg-white">
                        <h3 className="text-xl font-semibold mb-2">Syllabus Description:</h3>
                        <p className="mb-4 text-gray-700">{fullAnalysisData.table_of_contents.description}</p>
                        
                        <h3 className="text-xl font-semibold mb-2">Audience Level:</h3>
                        <p className="mb-4 text-gray-700">{fullAnalysisData.table_of_contents.audience_level}</p>
                        
                        <h3 className="text-xl font-semibold mb-2">ToC Items:</h3>
                        {fullAnalysisData.table_of_contents.items.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-2">
                            {fullAnalysisData.table_of_contents.items.map((item, index) => (
                              <li key={index} className="mb-1">
                                <strong className="text-primary">{item.title}</strong>
                                {item.description && <p className="text-sm text-gray-600"> - {item.description}</p>}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">No table of contents items found.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {/* Message if no data and not loading/error */}
            {!fullAnalysisData && !errorQuestions && activeTab === "generator" && (
                 <p className="text-center text-gray-500 mt-10">Upload a document to see its analysis and generated questions.</p>
            )}
          </>
        )}
      </div>
    </main>
  )
}
