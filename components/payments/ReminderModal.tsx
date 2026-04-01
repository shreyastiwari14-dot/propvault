'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface ReminderModalProps {
  open: boolean
  onClose: () => void
  message: string
  productionName: string
}

export function ReminderModal({ open, onClose, message, productionName }: ReminderModalProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="WhatsApp Payment Reminder" size="md">
      <div className="space-y-4">
        <p className="text-xs text-[#8A8A84]">Generated for: <strong className="text-[#111110]">{productionName}</strong></p>
        <div className="bg-[#F7F6F3] rounded-xl p-4 border border-[#E5E3DE]">
          <p className="text-sm text-[#111110] whitespace-pre-wrap leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">Close</Button>
          <Button onClick={handleCopy} className="flex-1">
            {copied ? (
              <><svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
            ) : (
              <><svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy to Clipboard</>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
