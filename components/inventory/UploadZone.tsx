'use client'
import { useState, useRef, useCallback } from 'react'
import type { ExtractedItem, PhotoAnalysis } from '@/lib/supabase/types'

type UploadStep = 'idle' | 'uploading' | 'parsing' | 'reviewing' | 'error'

interface UploadZoneProps {
  shopId: string
  onPdfExtracted: (items: ExtractedItem[], pdfUploadId: string) => void
  onPhotoAnalyzed: (analysis: PhotoAnalysis, file: File) => void
}

export function UploadZone({ shopId, onPdfExtracted, onPhotoAnalyzed }: UploadZoneProps) {
  const [step, setStep] = useState<UploadStep>('idle')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name)
    setError('')
    setStep('uploading')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('shop_id', shopId)

    try {
      const isPdf = file.type === 'application/pdf'
      const endpoint = isPdf ? '/api/upload/pdf' : '/api/upload/photo'

      setStep('parsing')
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 120000)
      const res = await fetch(endpoint, { method: 'POST', body: formData, signal: controller.signal }).finally(() => clearTimeout(timer))

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      setStep('reviewing')

      if (isPdf) {
        onPdfExtracted(data.items, data.pdf_upload_id)
      } else {
        onPhotoAnalyzed(data.analysis, file)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setStep('error')
    }
  }, [shopId, onPdfExtracted, onPhotoAnalyzed])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const steps = [
    { key: 'uploading', label: 'Uploading' },
    { key: 'parsing', label: 'Parsing with AI' },
    { key: 'reviewing', label: 'Ready to Review' },
  ]
  const currentStepIndex = steps.findIndex(s => s.key === step)

  if (step === 'uploading' || step === 'parsing') {
    return (
      <div className="border-2 border-[#E5E3DE] rounded-xl p-12 flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="font-semibold text-[#111110]">Processing: {fileName}</p>
        </div>
        <div className="flex items-center gap-3 w-full max-w-sm">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                i < currentStepIndex ? 'bg-[#22C55E] text-white' :
                i === currentStepIndex ? 'bg-[#D4501A] text-white' :
                'bg-[#E5E3DE] text-[#8A8A84]'
              }`}>
                {i < currentStepIndex ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i === currentStepIndex ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-xs">{i + 1}</span>
                )}
              </div>
              <span className={`text-xs whitespace-nowrap ${i === currentStepIndex ? 'text-[#D4501A] font-medium' : 'text-[#8A8A84]'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-[#E5E3DE]" />}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="border-2 border-[#EF4444] border-dashed rounded-xl p-12 flex flex-col items-center gap-4">
        <svg className="w-10 h-10 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-center">
          <p className="font-semibold text-[#EF4444]">Upload Failed</p>
          <p className="text-sm text-[#8A8A84] mt-1">{error}</p>
        </div>
        <button
          onClick={() => { setStep('idle'); setError('') }}
          className="px-4 py-2 bg-[#D4501A] text-white text-sm font-medium rounded-lg hover:bg-[#B8431A]"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-colors ${
        dragOver
          ? 'border-[#D4501A] bg-[#FEF0EA]'
          : 'border-[#E5E3DE] hover:border-[#8A8A84] bg-white'
      }`}
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className={`p-4 rounded-full ${dragOver ? 'bg-[#D4501A]' : 'bg-[#F7F6F3]'}`}>
        <svg className={`w-8 h-8 ${dragOver ? 'text-white' : 'text-[#8A8A84]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-semibold text-[#111110]">
          {dragOver ? 'Drop to upload' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-sm text-[#8A8A84] mt-1">
          PDF (up to 500MB) or Images (JPG, PNG, WEBP)
        </p>
        <p className="text-xs text-[#8A8A84] mt-3 max-w-xs">
          PDFs are parsed by AI to extract all items automatically. Images are analyzed to suggest name, category, and era.
        </p>
      </div>
    </div>
  )
}
