export type ShopStatus = 'Available' | 'Reserved' | 'Out' | 'Returned'
export type BookingStatus = 'Requested' | 'Confirmed' | 'Active' | 'Returned' | 'Cancelled'
export type PaymentStatus = 'Pending' | 'Partial' | 'Cleared'
export type ItemCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor'
export type PdfUploadStatus = 'Processing' | 'Parsed' | 'Failed'
export type ItemCategory = 'Furniture' | 'Lighting' | 'Textiles' | 'Kitchenware' | 'Art & Decor' | 'Vehicles' | 'Wardrobe' | 'Electronics' | 'Architectural' | 'Miscellaneous'

export interface Shop {
  id: string
  name: string
  slug: string
  owner_id: string
  contact_email: string | null
  contact_phone: string | null
  logo_url: string | null
  created_at: string
}

export interface Item {
  id: string
  shop_id: string
  name: string
  description: string | null
  category: ItemCategory
  era_style: string | null
  dimensions_raw: string | null
  dimensions_l: number | null
  dimensions_w: number | null
  dimensions_h: number | null
  quantity_total: number
  quantity_available: number
  condition: ItemCondition | null
  status: ShopStatus
  primary_image_url: string | null
  pdf_source_id: string | null
  ai_parsed: boolean
  created_at: string
  updated_at: string
}

export interface ItemPhoto {
  id: string
  item_id: string
  url: string
  is_primary: boolean
  uploaded_at: string
}

export interface PdfUpload {
  id: string
  shop_id: string
  filename: string
  storage_path: string
  status: PdfUploadStatus
  items_extracted: number | null
  uploaded_at: string
}

export interface Booking {
  id: string
  shop_id: string
  item_id: string
  production_name: string
  contact_name: string
  contact_phone: string
  contact_email: string
  quantity_requested: number
  date_from: string
  date_to: string
  status: BookingStatus
  notes: string | null
  created_at: string
  // joined fields
  item?: Item
}

export interface Payment {
  id: string
  booking_id: string
  shop_id: string
  amount_total: number
  amount_paid: number
  amount_pending: number
  status: PaymentStatus
  due_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined fields
  booking?: Booking
}

export interface ExtractedItem {
  name: string
  category: ItemCategory
  era_style: string | null
  dimensions_raw: string | null
  dimensions_l: number | null
  dimensions_w: number | null
  dimensions_h: number | null
  quantity_total: number
  condition: ItemCondition | null
  description: string | null
}

export interface PhotoAnalysis {
  suggested_name: string
  suggested_category: ItemCategory
  suggested_era: string | null
}
