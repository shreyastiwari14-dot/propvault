import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-sonnet-4-6'
const FAST_MODEL = 'claude-haiku-4-5-20251001'

function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

// ─── For seed script: analyse a local image to extract item details ───────────
export interface ItemDetails {
  name: string
  material: string | null
  color: string | null
  height: string | null
  length: string | null
  width: string | null
  depth: string | null
  description: string | null
}

export async function analyzeItemForSeed(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  itemCode: string
): Promise<ItemDetails> {
  const prompt = `You are cataloguing a furniture/prop item for a film production prop house.
Item code: ${itemCode}

Look at this image and return ONLY a JSON object:
{
  "name": "descriptive product name (e.g. 'Tufted Wingback Armchair')",
  "material": "primary material (e.g. 'Wood + Fabric', 'Metal', 'Cane + Wood')",
  "color": "primary color description (e.g. 'Beige', 'Dark Brown', 'Teal Blue')",
  "height": "estimated height with unit (e.g. '36\"') or null",
  "length": "estimated length/depth with unit or null",
  "width": "estimated width with unit or null",
  "depth": null,
  "description": "one sentence max 12 words describing the item or null"
}
Return ONLY the JSON. No explanation.`

  const response = await client().messages.create({
    model: FAST_MODEL,
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
        { type: 'text', text: prompt },
      ],
    }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  const text = content.text.trim()
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`No JSON in response for ${itemCode}`)
  return JSON.parse(match[0]) as ItemDetails
}

// ─── For photo upload: get a name/category for an item photo ─────────────────
export async function analyzePhoto(imageBase64: string, mediaType: 'image/jpeg' | 'image/png' | 'image/webp') {
  const prompt = `Analyse this prop/item image. Return ONLY JSON:
{"suggested_name":"descriptive item name","suggested_category":"Furniture|Chairs|Tables|Storage|Mirrors|Miscellaneous","suggested_era":null}`

  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
        { type: 'text', text: prompt },
      ],
    }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return JSON.parse(content.text.trim())
}

// ─── PDF extraction (kept for future use) ────────────────────────────────────
export async function extractItemsFromPdf(pdfUrl: string) {
  const prompt = `Extract every product/item from this PDF catalogue.
Return a JSON array — one object per item:
[{"name":"","material":null,"color":null,"height":null,"length":null,"width":null,"description":""}]
Return ONLY the JSON array.`

  const response = await client().messages.create({
    model: FAST_MODEL,
    max_tokens: 8096,
    messages: [{
      role: 'user',
      content: [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { type: 'document', source: { type: 'url', url: pdfUrl } } as any,
        { type: 'text', text: prompt },
      ],
    }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  const text = content.text.trim()
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('No JSON array in response')
  return JSON.parse(jsonMatch[0])
}

// ─── Payment reminder generation ─────────────────────────────────────────────
export async function generatePaymentReminder(params: {
  shopName: string; productionName: string; itemName: string; amountPending: number; dueDate: string
}): Promise<string> {
  const prompt = `Write a professional WhatsApp payment reminder for a film prop shop.
Shop: ${params.shopName} | Production: ${params.productionName} | Item: ${params.itemName} | Amount: ₹${params.amountPending} | Due: ${params.dueDate}
Under 100 words. Polite. End with [Your Name].
Return only the message.`

  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return content.text.trim()
}
