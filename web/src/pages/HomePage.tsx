/**
 * Home Page - Phase 1: Discovery-First MVP
 * 
 * Clean, calming interface focused on hobby discovery.
 * Features:
 * - Art & Craft hobbies only
 * - Local save functionality (no auth required)
 * - "My Saved Hobbies" section
 * - No gamification, stats, or pressure
 */

import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useLocalSavedHobbies } from '@/hooks/useLocalSavedHobbies';
import { useCurrency } from '@/hooks/useCurrency';
import { trackPageView, trackHobbySave } from '@/utils/analytics';

// Art & Craft hobbies data (matches backend)
const ART_CRAFT_HOBBIES = [
  {
    id: 'watercolor-painting',
    title: 'Watercolor Painting',
    description: 'Create beautiful, flowing artwork with watercolors. This calming hobby lets you express creativity through soft washes of color.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629772451220-8569bfac996f?w=800',
    timeRequired: '45-90 min sessions',
    cost: '$48-88',
    rating: 4.8,
  },
  {
    id: 'acrylic-painting',
    title: 'Acrylic Painting',
    description: 'Versatile and forgiving, acrylic painting lets you create bold artwork. Great for beginners.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
    timeRequired: '1-2 hour sessions',
    cost: '$40-60',
    rating: 4.7,
  },
  {
    id: 'pottery-ceramics',
    title: 'Pottery & Ceramics',
    description: 'Shape clay into functional and decorative objects. Tactile and meditative.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629380321590-3b3f75d66dec?w=800',
    timeRequired: '1-2 hour sessions',
    cost: '$45-80',
    rating: 4.9,
  },
  {
    id: 'calligraphy',
    title: 'Calligraphy & Lettering',
    description: 'Transform words into art with beautiful handwriting. Creative and structured.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    timeRequired: '30-60 min sessions',
    cost: '$23-32',
    rating: 4.6,
  },
  {
    id: 'hand-lettering',
    title: 'Hand Lettering',
    description: 'Draw decorative letters and typography. Develop your own unique style.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1596465786192-04e9dc3e0f6d?w=800',
    timeRequired: '30-60 min sessions',
    cost: '$26-42',
    rating: 4.7,
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { savedHobbies, toggleSaveHobby, getSavedCount } = useLocalSavedHobbies();
  const { formatPrice, isLoading: isCurrencyLoading } = useCurrency();
  
  const savedHobbyList = ART_CRAFT_HOBBIES.filter(h => savedHobbies.has(h.id));
  const savedCount = getSavedCount();

  // Track page view on mount
  useEffect(() => {
    trackPageView('/');
  }, []);

  // Handle save with tracking
  const handleToggleSave = (hobbyId: string, hobbyTitle: string) => {
    const wasSaved = savedHobbies.has(hobbyId);
    toggleSaveHobby(hobbyId);
    trackHobbySave(hobbyId, hobbyTitle, !wasSaved);
  };

  const HobbyCard = ({ hobby }: { hobby: typeof ART_CRAFT_HOBBIES[0] }) => {
    const isSaved = savedHobbies.has(hobby.id);
    const displayCost = isCurrencyLoading ? '...' : formatPrice(hobby.cost);

    return (
      <div 
        className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
        onClick={() => navigate(`/hobby/${hobby.id}`)}
      >
        <div className="relative h-48 overflow-hidden">
          <img 
            src={hobby.imageUrl} 
            alt={hobby.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleSave(hobby.id, hobby.title);
            }}
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <span className="text-xl">{isSaved ? '❤️' : '🤍'}</span>
          </button>
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 bg-emerald-500/90 text-white text-xs font-medium rounded-md capitalize">
              {hobby.difficulty}
            </span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{hobby.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hobby.description}</p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>⭐ {hobby.rating}</span>
            <span>⏱️ {hobby.timeRequired}</span>
            <span>💰 {displayCost}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-serif font-medium text-gray-900 mb-6 leading-tight">
              Discover Your Creative Hobby
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Explore calming, hands-on hobbies at your own pace. 
              No pressure, no rush—just creative fulfillment.
            </p>
            <Link to="/explore">
              <Button size="lg" className="px-8">
                Browse Hobbies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Saved Hobbies Section */}
      {savedCount > 0 && (
        <section className="py-12 bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif font-medium text-gray-900">
                  My Saved Hobbies
                </h2>
                <p className="text-gray-600 mt-1">{savedCount} {savedCount === 1 ? 'hobby' : 'hobbies'} saved</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedHobbyList.map(hobby => (
                <HobbyCard key={hobby.id} hobby={hobby} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Hobbies Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-2xl font-serif font-medium text-gray-900 mb-2">
              Art & Craft Hobbies
            </h2>
            <p className="text-gray-600">
              Perfect for beginners seeking creative fulfillment and stress relief
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ART_CRAFT_HOBBIES.map(hobby => (
              <HobbyCard key={hobby.id} hobby={hobby} />
            ))}
          </div>
        </div>
      </section>

      {/* Calming Footer Message */}
      <section className="py-16 bg-amber-50/50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-lg text-gray-700 font-medium mb-2">
            Take your time. There's no rush to choose.
          </p>
          <p className="text-gray-600">
            Save hobbies that interest you and explore when you're ready.
          </p>
        </div>
      </section>
    </div>
  );
};
