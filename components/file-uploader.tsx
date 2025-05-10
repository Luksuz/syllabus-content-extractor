"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"
import { SyllabusDisplay } from "./syllabus-display"
import type { SyllabusData } from "@/lib/types"
import { useDropzone } from "react-dropzone"
import { Badge } from "@/components/ui/badge"

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<SyllabusData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState("gpt-4.1-mini")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setError(null)
    } else {
      setFile(null)
      setError("Please select a valid PDF file")
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("pdf", file)
      formData.append("model", model)

      const response = await fetch("/api/process-document", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while processing the document")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model</label>
            <div className="relative">
              <select
                id="model"
                value={model}
                onChange={e => setModel(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 pr-10 py-2 pl-3 text-base appearance-none bg-white"
              >
                <option value="gpt-4.1-mini">
                  gpt-4.1-mini
                </option>
                <option value="gpt-4.1">
                  gpt-4.1
                </option>
              </select>
              {/* Custom dropdown content for badges */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                {model === "gpt-4.1-mini" ? (
                  <Badge className="bg-blue-100 text-blue-800">$0.5/300</Badge>
                ) : (
                  <Badge className="bg-purple-100 text-purple-800">$2.5/300</Badge>
                )}
              </div>
            </div>
          </div>
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <span className="text-sm font-medium text-gray-900">
              {file ? file.name : isDragActive ? "Drop the PDF here" : "Drag & drop or click to upload a PDF file"}
            </span>
            <span className="text-xs text-gray-500 mt-1">Only PDF files are supported</span>
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <Button type="submit" className="w-full" disabled={!file || isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Document"
            )}
          </Button>
        </form>
      </Card>

      {result && <SyllabusDisplay data={result} />}
    </div>
  )
}
