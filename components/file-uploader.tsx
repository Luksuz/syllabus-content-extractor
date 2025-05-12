"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Upload } from "lucide-react"
// import { SyllabusDisplay } from "./syllabus-display" // Parent will handle display
// import type { SyllabusData } from "@/lib/types" // Parent will handle type
import { useDropzone } from "react-dropzone"
// import { Badge } from "@/components/ui/badge" // Model selection UI removed for now for simplicity

interface FileUploaderProps {
  apiEndpoint: string;
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
  fileKeyName?: string;
  submitButtonText?: string;
  acceptedFileTypes?: { [key: string]: string[] };
  extraFormData?: Record<string, string>; // For additional fields like 'model'
  children?: React.ReactNode; // To allow custom content inside, if needed
}

export function FileUploader({
  apiEndpoint,
  onSuccess,
  onError,
  fileKeyName = "file",
  submitButtonText = "Upload Document",
  acceptedFileTypes = { "application/pdf": [".pdf"] },
  extraFormData,
  children,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  // const [result, setResult] = useState<any | null>(null) // Parent will manage result state
  const [internalError, setInternalError] = useState<string | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0]
    if (selectedFile) {
      setFile(selectedFile)
      setInternalError(null)
      onError("") // Clear parent error
    } else {
      setFile(null)
      const message = "Please select a valid file."
      setInternalError(message)
      onError(message) // Propagate error to parent
    }
  }, [onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: 1,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsProcessing(true)
    setInternalError(null)
    onError("") // Clear parent error

    try {
      const formData = new FormData()
      formData.append(fileKeyName, file)

      if (extraFormData) {
        for (const key in extraFormData) {
          formData.append(key, extraFormData[key]);
        }
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        let errorMsg = `Error: ${response.status}`;
        // Add specific check for 413 Payload Too Large
        if (response.status === 413) {
            errorMsg = "File is too large. Please keep files under 4.5 MB. or send only the first 15 pages.";
        } else {
            // Try to parse JSON error only if not 413
            try {
              const errorData = await response.json()
              errorMsg = errorData.error || errorData.message || errorMsg
            } catch (jsonError) {
              // If response is not JSON, use status text
              errorMsg = response.statusText || errorMsg
            }
        }
        throw new Error(errorMsg)
      }

      const data = await response.json()
      // setResult(data) // Parent will manage result
      onSuccess(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred while processing the document"
      setInternalError(message)
      onError(message) // Propagate error to parent
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {children} {/* Allow embedding model selector or other elements here */}
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <span className="text-sm font-medium text-gray-900">
              {file ? file.name : isDragActive ? "Drop the file here" : `Drag & drop or click to upload`}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {Object.values(acceptedFileTypes).flat().join(', ')} files are supported
            </span>
          </div>

          {internalError && <div className="text-red-500 text-sm mt-2">{internalError}</div>}

          <Button type="submit" className="w-full" disabled={!file || isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </form>
      </Card>

      {/* Result display will be handled by the parent component */}
      {/* {result && <SyllabusDisplay data={result} />} */}
    </div>
  )
}
