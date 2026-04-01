export type ItemStatus = 'available' | 'booked' | 'maintenance' | 'unavailable'
export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'returned' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partial'

export interface Category {
  id: string
  name: string
  slug: string
  display_order: number
  item_count: number
  created_at: string
  thumbnail_url?: string | null
}

export interface Item {
  id: string
  item_code: string
  name: string
  description: string | null
  category_id: string | null
  material: string | null
  color: string | null
  style: string | null
  height: string | null
  length: string | null
  width: string | null
  depth: string | null
  configuration: string | null
  quantity_total: number
  quantity_available: number
  status: ItemStatus
  source_file: string | null
  created_at: string
  updated_at: string
  // joined
  category?: Category
  primary_image_url?: string | null
  images?: ItemImage[]
}

export interface ItemImage {
  id: string
  item_id: string
  image_url: string
  is_primary: boolean
  display_order: number
  created_at: string
}

export interface Booking {
  id: string
  item_id: string
  booker_name: string
  booker_phone: string
  booker_email: string | null
  production_name: string | null
  booking_date: string
  return_date: string | null
  quantity: number
  status: BookingStatus
  notes: string | null
  created_at: string
  item?: Item
}

export interface Payment {
  id: string
  booking_id: string
  amount: number
  status: PaymentStatus
  due_date: string | null
  paid_date: string | null
  notes: string | null
  created_at: string
  booking?: Booking
}
