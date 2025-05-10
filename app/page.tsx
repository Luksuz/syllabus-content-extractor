import { FileUploader } from "@/components/file-uploader"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">Syllabus Structure Analyzer</h1>
        <div className="flex justify-center mb-4">
          <Badge>$0.5 per 300 pages</Badge>
        </div>
        <p className="text-center mb-8">
          Upload a syllabus document (PDF) to extract its structure, sections, and questions.
        </p>
        <FileUploader />
      </div>
    </main>
  )
}
