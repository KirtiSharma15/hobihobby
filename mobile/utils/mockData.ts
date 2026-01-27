import { Hobby } from '../types';

export const mockHobbies: Hobby[] = [
  {
    id: '1',
    title: 'Watercolor Painting',
    description: 'Learn the beautiful art of watercolor painting with step-by-step tutorials and techniques.',
    category: 'Creative Arts',
    tags: ['art', 'creative', 'relaxing'],
    difficulty: 'beginner',
    timeRequired: '2-3 hours per session',
    cost: '$50-100',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
    starterKit: {
      items: ['Watercolor paints', 'Brushes', 'Watercolor paper', 'Palette'],
      estimatedCost: 75,
      whereToBuy: ['Local art store', 'Online retailers'],
    },
    tutorials: [
      {
        title: 'Getting Started with Watercolors',
        description: 'Basic techniques and materials',
        url: 'https://example.com/tutorial1',
        duration: '30 minutes',
        difficulty: 'beginner',
      },
    ],
    rating: 4.5,
    reviewCount: 128,
  },
  {
    id: '2',
    title: 'Gardening',
    description: 'Create your own green space and grow beautiful plants, herbs, and vegetables.',
    category: 'Outdoor Activities',
    tags: ['nature', 'outdoor', 'sustainable'],
    difficulty: 'beginner',
    timeRequired: '1-2 hours per week',
    cost: '$30-80',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    starterKit: {
      items: ['Seeds', 'Pots', 'Soil', 'Watering can'],
      estimatedCost: 50,
      whereToBuy: ['Garden center', 'Home improvement stores'],
    },
    tutorials: [
      {
        title: 'Starting Your First Garden',
        description: 'Essential gardening basics',
        url: 'https://example.com/tutorial2',
        duration: '45 minutes',
        difficulty: 'beginner',
      },
    ],
    rating: 4.3,
    reviewCount: 95,
  },
  {
    id: '3',
    title: 'Photography',
    description: 'Capture beautiful moments and learn the art of photography.',
    category: 'Creative Arts',
    tags: ['art', 'technology', 'creative'],
    difficulty: 'intermediate',
    timeRequired: '3-4 hours per session',
    cost: '$200-500',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',
    starterKit: {
      items: ['Camera', 'Tripod', 'Memory cards', 'Lens cleaning kit'],
      estimatedCost: 350,
      whereToBuy: ['Camera stores', 'Online retailers'],
    },
    tutorials: [
      {
        title: 'Photography Fundamentals',
        description: 'Understanding exposure and composition',
        url: 'https://example.com/tutorial3',
        duration: '60 minutes',
        difficulty: 'intermediate',
      },
    ],
    rating: 4.7,
    reviewCount: 203,
  },
  {
    id: '4',
    title: 'Cooking',
    description: 'Master the culinary arts and create delicious meals from scratch.',
    category: 'Cooking & Food',
    tags: ['food', 'creative', 'practical'],
    difficulty: 'beginner',
    timeRequired: '1-2 hours per meal',
    cost: '$100-200',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    starterKit: {
      items: ['Chef knife', 'Cutting board', 'Pots and pans', 'Measuring tools'],
      estimatedCost: 150,
      whereToBuy: ['Kitchen stores', 'Department stores'],
    },
    tutorials: [
      {
        title: 'Basic Cooking Techniques',
        description: 'Essential skills for every cook',
        url: 'https://example.com/tutorial4',
        duration: '40 minutes',
        difficulty: 'beginner',
      },
    ],
    rating: 4.4,
    reviewCount: 156,
  },
  {
    id: '5',
    title: 'Yoga',
    description: 'Improve flexibility, strength, and mental well-being through yoga practice.',
    category: 'Fitness & Health',
    tags: ['fitness', 'wellness', 'mindfulness'],
    difficulty: 'beginner',
    timeRequired: '30-60 minutes per session',
    cost: '$20-50',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    starterKit: {
      items: ['Yoga mat', 'Comfortable clothing', 'Meditation cushion'],
      estimatedCost: 35,
      whereToBuy: ['Sporting goods stores', 'Online retailers'],
    },
    tutorials: [
      {
        title: 'Yoga for Beginners',
        description: 'Basic poses and breathing techniques',
        url: 'https://example.com/tutorial5',
        duration: '30 minutes',
        difficulty: 'beginner',
      },
    ],
    rating: 4.6,
    reviewCount: 189,
  },
];

export const mockCategories = [
  'Creative Arts',
  'Outdoor Activities',
  'Technology',
  'Fitness & Health',
  'Cooking & Food',
  'Music',
  'Reading & Writing',
  'Gaming',
];

export const mockDifficulties = ['beginner', 'intermediate', 'advanced'];




