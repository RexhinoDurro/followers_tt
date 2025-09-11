// data/services.ts
import type { ServiceCategory } from '../types';

export const serviceCategories: ServiceCategory[] = [
  {
    platform: 'instagram',
    name: 'Instagram Growth',
    icon: '📸',
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    gradient: 'from-purple-600 to-pink-600',
    services: [
      {
        id: 'ig-followers',
        name: 'Instagram Followers',
        platform: 'instagram',
        type: 'followers',
        description: 'Grow your Instagram following with real, active followers',
        icon: '👥',
        minQuantity: 100,
        maxQuantity: 100000,
        basePrice: 15, // $15 per 1000
        features: ['Real followers', 'Gradual delivery', '90-day guarantee', '24/7 support']
      },
      {
        id: 'ig-likes',
        name: 'Instagram Likes',
        platform: 'instagram',
        type: 'likes',
        description: 'Boost engagement with authentic Instagram likes',
        icon: '❤️',
        minQuantity: 50,
        maxQuantity: 50000,
        basePrice: 8,
        features: ['Instant delivery', 'High quality', '30-day refill', 'Safe & secure']
      },
      {
        id: 'ig-comments',
        name: 'Instagram Comments',
        platform: 'instagram',
        type: 'comments',
        description: 'Get meaningful comments from real users',
        icon: '💬',
        minQuantity: 10,
        maxQuantity: 5000,
        basePrice: 25,
        features: ['Custom comments', 'Native language', 'Real profiles', 'Manual review']
      },
      {
        id: 'ig-views',
        name: 'Instagram Views',
        platform: 'instagram',
        type: 'views',
        description: 'Increase your video views and reach',
        icon: '👁️',
        minQuantity: 100,
        maxQuantity: 1000000,
        basePrice: 5,
        features: ['Fast delivery', 'High retention', 'Worldwide views', 'Analytics boost']
      }
    ]
  },
  {
    platform: 'tiktok',
    name: 'TikTok Growth',
    icon: '🎵',
    color: 'bg-gradient-to-r from-black to-red-600',
    gradient: 'from-black to-red-600',
    services: [
      {
        id: 'tt-followers',
        name: 'TikTok Followers',
        platform: 'tiktok',
        type: 'followers',
        description: 'Build your TikTok audience with engaged followers',
        icon: '👥',
        minQuantity: 100,
        maxQuantity: 100000,
        basePrice: 12,
        features: ['Active followers', 'Gradual growth', '60-day guarantee', 'Algorithm boost']
      },
      {
        id: 'tt-likes',
        name: 'TikTok Likes',
        platform: 'tiktok',
        type: 'likes',
        description: 'Increase your video likes for better reach',
        icon: '❤️',
        minQuantity: 50,
        maxQuantity: 100000,
        basePrice: 6,
        features: ['Instant likes', 'Viral potential', '30-day refill', 'FYP boost']
      },
      {
        id: 'tt-views',
        name: 'TikTok Views',
        platform: 'tiktok',
        type: 'views',
        description: 'Boost your video views and visibility',
        icon: '👁️',
        minQuantity: 1000,
        maxQuantity: 10000000,
        basePrice: 3,
        features: ['High retention', 'Global reach', 'Fast delivery', 'For You Page']
      },
      {
        id: 'tt-shares',
        name: 'TikTok Shares',
        platform: 'tiktok',
        type: 'shares',
        description: 'Get more shares to amplify your content',
        icon: '🔄',
        minQuantity: 25,
        maxQuantity: 10000,
        basePrice: 20,
        features: ['Viral boost', 'Organic growth', 'Real shares', 'Engagement spike']
      }
    ]
  },
  {
    platform: 'youtube',
    name: 'YouTube Growth',
    icon: '📺',
    color: 'bg-gradient-to-r from-red-600 to-red-700',
    gradient: 'from-red-600 to-red-700',
    services: [
      {
        id: 'yt-subscribers',
        name: 'YouTube Subscribers',
        platform: 'youtube',
        type: 'subscribers',
        description: 'Grow your YouTube channel with real subscribers',
        icon: '👥',
        minQuantity: 100,
        maxQuantity: 100000,
        basePrice: 18,
        features: ['Real subscribers', 'Monetization boost', '120-day guarantee', 'Channel growth']
      },
      {
        id: 'yt-views',
        name: 'YouTube Views',
        platform: 'youtube',
        type: 'views',
        description: 'Increase video views and watch time',
        icon: '👁️',
        minQuantity: 1000,
        maxQuantity: 10000000,
        basePrice: 7,
        features: ['High retention', 'Watch time boost', 'SEO benefits', 'Monetization eligible']
      },
      {
        id: 'yt-likes',
        name: 'YouTube Likes',
        platform: 'youtube',
        type: 'likes',
        description: 'Get more likes to improve engagement',
        icon: '👍',
        minQuantity: 50,
        maxQuantity: 50000,
        basePrice: 10,
        features: ['Real likes', 'Algorithm boost', '45-day refill', 'Ranking improvement']
      },
      {
        id: 'yt-comments',
        name: 'YouTube Comments',
        platform: 'youtube',
        type: 'comments',
        description: 'Boost engagement with quality comments',
        icon: '💬',
        minQuantity: 10,
        maxQuantity: 5000,
        basePrice: 30,
        features: ['Custom comments', 'Real profiles', 'Conversation starter', 'Manual review']
      }
    ]
  }
];
