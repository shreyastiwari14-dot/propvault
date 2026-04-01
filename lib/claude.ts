import Anthropic from '@anthropic-ai/sdk'
import type { ExtractedItem, ItemCategory, PhotoAnalysis } from './supabase/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const MODEL = 'claude-sonnet-4-6'
const FAST_MODEL = 'claude-haiku-4-5-20251001'

export async function extractItemsFromPdf(pdfBase64: string): Promise<ExtractedItem[]> {
  const prompt = `Extract every prop/item from this PDF. Return a compact JSON array — one object per item, no omissions:
[{"name":"","category":"Furniture|Lighting|Textiles|Kitchenware|Art & Decor|Vehicles|Wardrobe|Electronics|Architectural|Miscellaneous","era_style":null,"dimensions_raw":null,"dimensions_l":null,"dimensions_w":null,"dimensions_h":null,"quantity_total":1,"condition":"Excellent|Good|Fair|Poor|null","description":""}]
Rules: category and condition must match the exact values shown. dimensions in cm. description max 20 words. Return ONLY the JSON array.`

  const response = await anthropic.messages.create({
    model: FAST_MODEL,
    max_tokens: 8096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: pdfBase64,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const text = content.text.trim()
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('No JSON array found in response')

  return JSON.parse(jsonMatch[0]) as ExtractedItem[]
}

export async function analyzePhoto(imageBase64: string, mediaType: 'image/jpeg' | 'image/png' | 'image/webp'): Promise<PhotoAnalysis> {
  const prompt = `Analyse this prop/item image from a film production prop shop.
Return ONLY a JSON object with this structure:
{
  "suggested_name": "descriptive item name",
  "suggested_category": "one of: Furniture, Lighting, Textiles, Kitchenware, Art & Decor, Vehicles, Wardrobe, Electronics, Architectural, Miscellaneous",
  "suggested_era": "visual era/style or null"
}
Return ONLY the JSON. No preamble. No explanation.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  return JSON.parse(content.text.trim()) as PhotoAnalysis
}

export async function searchItems(
  items: Array<{ id: string; name: string; category: string; era_style: string | null; description: string | null }>,
  query: string
): Promise<string[]> {
  const prompt = `You are a prop search assistant for a film production prop shop.

Available items (JSON):
${JSON.stringify(items)}

Search query: "${query}"

Return a JSON array of item IDs that match the search query. Consider name, category, era, and description. Be generous with matching — if something could plausibly match, include it.

Return ONLY a JSON array of UUIDs. Example: ["uuid1", "uuid2"]
Return empty array [] if nothing matches.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const text = content.text.trim()
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) return []

  return JSON.parse(jsonMatch[0]) as string[]
}

export async function generatePaymentReminder(params: {
  shopName: string
  productionName: string
  itemName: string
  amountPending: number
  dueDate: string
}): Promise<string> {
  const prompt = `Write a professional but warm WhatsApp payment reminder message in English for a film production prop shop.

Details:
- Shop name: ${params.shopName}
- Production name: ${params.productionName}
- Item borrowed: ${params.itemName}
- Amount pending: ₹${params.amountPending}
- Due date: ${params.dueDate}

Keep it under 100 words. Polite but clear. End with the shop owner's name placeholder [Your Name].
Return only the message text.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  return content.text.trim()
}
