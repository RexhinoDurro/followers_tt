import type { Package } from "../types";

// data/pricing.ts
export const packages: Package[] = [
  // Instagram Followers
  {
    id: 'ig-followers-starter',
    serviceId: 'ig-followers',
    name: 'Starter',
    quantity: 1000,
    price: 15,
    features: ['1K Real Followers', '3-5 day delivery', '90-day guarantee'],
    deliveryTime: '3-5 days',
    guarantee: '90 days'
  },
  {
    id: 'ig-followers-growth',
    serviceId: 'ig-followers',
    name: 'Growth',
    quantity: 5000,
    price: 65,
    originalPrice: 75,
    discount: 13,
    popular: true,
    features: ['5K Real Followers', '5-7 day delivery', '90-day guarantee', 'Priority support'],
    deliveryTime: '5-7 days',
    guarantee: '90 days'
  },
  {
    id: 'ig-followers-pro',
    serviceId: 'ig-followers',
    name: 'Professional',
    quantity: 10000,
    price: 120,
    originalPrice: 150,
    discount: 20,
    features: ['10K Real Followers', '7-10 day delivery', '90-day guarantee', 'VIP support'],
    deliveryTime: '7-10 days',
    guarantee: '90 days'
  },
  // TikTok Followers
  {
    id: 'tt-followers-starter',
    serviceId: 'tt-followers',
    name: 'Starter',
    quantity: 1000,
    price: 12,
    features: ['1K Active Followers', '2-4 day delivery', '60-day guarantee'],
    deliveryTime: '2-4 days',
    guarantee: '60 days'
  },
  {
    id: 'tt-followers-viral',
    serviceId: 'tt-followers',
    name: 'Viral',
    quantity: 10000,
    price: 100,
    originalPrice: 120,
    discount: 17,
    popular: true,
    features: ['10K Active Followers', '5-8 day delivery', '60-day guarantee', 'Algorithm boost'],
    deliveryTime: '5-8 days',
    guarantee: '60 days'
  },
  // YouTube Subscribers
  {
    id: 'yt-subs-starter',
    serviceId: 'yt-subscribers',
    name: 'Creator',
    quantity: 1000,
    price: 18,
    features: ['1K Real Subscribers', '5-7 day delivery', '120-day guarantee'],
    deliveryTime: '5-7 days',
    guarantee: '120 days'
  },
  {
    id: 'yt-subs-monetize',
    serviceId: 'yt-subscribers',
    name: 'Monetization',
    quantity: 4000,
    price: 65,
    originalPrice: 72,
    discount: 10,
    popular: true,
    features: ['4K Real Subscribers', 'Monetization ready', '7-10 day delivery', '120-day guarantee'],
    deliveryTime: '7-10 days',
    guarantee: '120 days'
  }
];