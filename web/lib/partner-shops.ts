export type ShopService = {
  name: string
  type: "STANDARD" | "PRIORITY"
  price: number
  description: string
  features: string[]
  slotsRemaining?: number
  maxSlots?: number
}

export type PartnerShop = {
  id: number
  slug: string
  name: string
  address: string
  city: string
  hours: string
  rating: number
  location: {
    lat: number
    lng: number
  }
  description: string
  services: ShopService[]
}

export const cebuInstituteOfTechnology = {
  name: "Cebu Institute of Technology - University",
  address: "N. Bacalso Ave., Cebu City, Philippines",
  location: {
    lat: 10.294665473840583,
    lng: 123.88110178079,
  },
}

export const partnerShops: PartnerShop[] = [
  {
    id: 1,
    slug: "gf22-laundry-hub",
    name: "GF22 Laundry Hub",
    address: "Osmeña Blvd, Cebu City",
    city: "Cebu City",
    hours: "7:00 AM - 9:00 PM",
    rating: 4.8,
    location: {
      lat: 10.297668461435508,
      lng: 123.88157664147491,
    },
    description: "Reliable wash-and-fold services with fast turnaround for students and nearby residents.",
    services: [
      {
        name: "Standard Wash & Fold",
        type: "STANDARD",
        price: 120,
        description: "Regular queue processing with detergent and folding included.",
        features: ["Detergent included", "Fold & pack", "4-6 hour turnaround"],
      },
      {
        name: "Priority Wash & Fold",
        type: "PRIORITY",
        price: 180,
        description: "Faster same-day processing with reserved priority slots.",
        features: ["Reserved slot", "Fold & pack", "2-3 hour turnaround"],
        slotsRemaining: 3,
        maxSlots: 10,
      },
      {
        name: "Express Dry Clean",
        type: "PRIORITY",
        price: 260,
        description: "For delicate garments and uniforms that need extra care.",
        features: ["Steam finishing", "Garment-safe treatment", "Same-day pickup"],
        slotsRemaining: 2,
        maxSlots: 6,
      },
    ],
  },
  {
    id: 2,
    slug: "wash-n-spin-laundromat",
    name: "Wash 'n Spin Laundromat",
    address: "Mango Ave, Cebu City",
    city: "Cebu City",
    hours: "6:00 AM - 10:00 PM",
    rating: 4.7,
    location: {
      lat: 10.29520243140057,
      lng: 123.88307538157194,
    },
    description: "A student-friendly laundromat with balanced pricing and quick service options.",
    services: [
      {
        name: "Standard Wash & Fold",
        type: "STANDARD",
        price: 110,
        description: "Affordable everyday laundry service.",
        features: ["Detergent included", "Fold & pack", "Same-day processing"],
      },
      {
        name: "Priority Wash & Fold",
        type: "PRIORITY",
        price: 170,
        description: "Priority queue for faster drop-off to pickup flow.",
        features: ["Reserved slot", "SMS-ready completion", "2-3 hour turnaround"],
        slotsRemaining: 5,
        maxSlots: 12,
      },
      {
        name: "Blanket Care",
        type: "STANDARD",
        price: 220,
        description: "Bulk laundry handling for blankets and bedding.",
        features: ["Large-load handling", "Softener option", "Careful drying"],
      },
    ],
  },
  {
    id: 3,
    slug: "isas-laundry",
    name: "Isa's Laundry",
    address: "Colon St, Cebu City",
    city: "Cebu City",
    hours: "8:00 AM - 8:00 PM",
    rating: 4.9,
    location: {
      lat: 10.300177858591343,
      lng: 123.88940743858849,
    },
    description: "Best for delicate care and small-batch laundry with a clean finish.",
    services: [
      {
        name: "Standard Wash & Fold",
        type: "STANDARD",
        price: 115,
        description: "Everyday laundry with careful sorting and folding.",
        features: ["Detergent included", "Fold & pack", "Gentle handling"],
      },
      {
        name: "Priority Wash & Fold",
        type: "PRIORITY",
        price: 175,
        description: "Fast turnaround for urgent student and office laundry.",
        features: ["Reserved slot", "Quick turnaround", "Priority handling"],
        slotsRemaining: 4,
        maxSlots: 8,
      },
      {
        name: "Delicates Care",
        type: "STANDARD",
        price: 240,
        description: "Gentle wash for delicate garments, uniforms, and special fabrics.",
        features: ["Gentle wash", "Fabric-safe treatment", "Separate handling"],
      },
    ],
  },
  {
    id: 4,
    slug: "wash-me-clean-laundry",
    name: "Wash Me Clean Laundry",
    address: "Gorordo Ave, Cebu City",
    city: "Cebu City",
    hours: "6:30 AM - 9:30 PM",
    rating: 4.6,
    location: {
      lat: 10.294854263221387,
      lng: 123.88842576253055,
    },
    description: "Convenient neighborhood laundry with pickup-ready service windows.",
    services: [
      {
        name: "Standard Wash & Fold",
        type: "STANDARD",
        price: 105,
        description: "Daily laundry service with flexible drop-off windows.",
        features: ["Detergent included", "Fold & pack", "Budget friendly"],
      },
      {
        name: "Priority Wash & Fold",
        type: "PRIORITY",
        price: 165,
        description: "Priority queue for faster processing and earlier pickup.",
        features: ["Reserved slot", "Faster turnaround", "SMS update"],
        slotsRemaining: 6,
        maxSlots: 10,
      },
      {
        name: "Pickup & Delivery",
        type: "PRIORITY",
        price: 280,
        description: "Door-to-door laundry pickup and delivery within the Cebu City area.",
        features: ["Pickup available", "Delivery included", "Convenient scheduling"],
        slotsRemaining: 2,
        maxSlots: 4,
      },
    ],
  },
  {
    id: 5,
    slug: "bj-laundry",
    name: "B&J Laundry",
    address: "Gen. Maxilom Ave, Cebu City",
    city: "Cebu City",
    hours: "7:00 AM - 10:00 PM",
    rating: 4.7,
    location: {
      lat: 10.294765664665952,
      lng: 123.88281226139755,
    },
    description: "A dependable partner shop with strong capacity for daily and priority loads.",
    services: [
      {
        name: "Standard Wash & Fold",
        type: "STANDARD",
        price: 100,
        description: "Straightforward laundry service with same-day availability.",
        features: ["Detergent included", "Fold & pack", "Fast queue"],
      },
      {
        name: "Priority Wash & Fold",
        type: "PRIORITY",
        price: 160,
        description: "Priority service for faster laundering and pickup.",
        features: ["Reserved slot", "Fast turnaround", "Priority handling"],
        slotsRemaining: 4,
        maxSlots: 9,
      },
      {
        name: "Heavy Load Care",
        type: "STANDARD",
        price: 210,
        description: "Best for bulky blankets, comforters, and mixed-load items.",
        features: ["Large-load friendly", "Softener option", "Bulk handling"],
      },
    ],
  },
]

export function getPartnerShopById(shopId: number) {
  return partnerShops.find((shop) => shop.id === shopId)
}

export function getFeaturedPartnerShop() {
  return partnerShops[0]
}