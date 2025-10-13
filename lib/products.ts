export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

// Premium subscription product
export const PRODUCTS: Product[] = [
  {
    id: "premium-monthly",
    name: "Premium Monthly",
    description: "Unlock all premium features including detailed analytics, advanced guest management, and more",
    priceInCents: 15, // $0.15/month
  },
]
