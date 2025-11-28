export type PublicAd = {
  _id: string
  title: string
  description?: string
  platform?: string | { platform: string }
  price?: number
  duration?: { value?: number; unit?: string }
}

