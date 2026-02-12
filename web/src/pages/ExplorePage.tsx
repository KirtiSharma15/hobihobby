/**
 * Explore Page - Phase 1: Discovery-First MVP
 * 
 * Simple category browsing with filters.
 * Features:
 * - Browse by difficulty, time, budget
 * - Art & Craft category focus
 * - Local save functionality
 * - Clean, calming UI
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useLocalSavedHobbies } from '@/hooks/useLocalSavedHobbies';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/utils/cn';
import { trackPageView, trackFilterUse, trackHobbySave } from '@/utils/analytics';

// Art & Craft hobbies data (matches backend)
const ART_CRAFT_HOBBIES = [
  {
    id: 'watercolor-painting',
    title: 'Watercolor Painting',
    description: 'Create beautiful, flowing artwork with watercolors. This calming hobby lets you express creativity through soft washes of color.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629772451220-8569bfac996f?w=800',
    timeRequired: '45-90 min',
    cost: '$48-88',
    rating: 4.8,
    tags: ['creative', 'relaxing', 'art'],
  },
  {
    id: 'acrylic-painting',
    title: 'Acrylic Painting',
    description: 'Versatile and forgiving, acrylic painting lets you create bold artwork. Great for beginners.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
    timeRequired: '1-2 hours',
    cost: '$40-60',
    rating: 4.7,
    tags: ['creative', 'colorful', 'art'],
  },
  {
    id: 'pottery-ceramics',
    title: 'Pottery & Ceramics',
    description: 'Shape clay into functional and decorative objects. Tactile and meditative.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629380321590-3b3f75d66dec?w=800',
    timeRequired: '1-2 hours',
    cost: '$45-80',
    rating: 4.9,
    tags: ['creative', 'hands-on', 'craft'],
  },
  {
    id: 'calligraphy',
    title: 'Calligraphy & Lettering',
    description: 'Transform words into art with beautiful handwriting. Creative and structured.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    timeRequired: '30-60 min',
    cost: '$23-32',
    rating: 4.6,
    tags: ['creative', 'precise', 'writing'],
  },
  {
    id: 'hand-lettering',
    title: 'Hand Lettering',
    description: 'Draw decorative letters and typography. Develop your own unique style.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1596465786192-04e9dc3e0f6d?w=800',
    timeRequired: '30-60 min',
    cost: '$26-42',
    rating: 4.7,
    tags: ['creative', 'typography', 'design'],
  },
];

type FilterType = 'all' | 'quick' | 'budget-friendly' | 'saved';

const FILTERS: { id: FilterType; label: string; icon: string }[] = [
  { id: 'all', label: 'All Hobbies', icon: '🎨' },
  { id: 'quick', label: 'Quick Start', icon: '⚡' },
  { id: 'budget-friendly', label: 'Budget-Friendly', icon: '💰' },
  { id: 'saved', label: 'Saved', icon: '❤️' },
];

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const { savedHobbies, toggleSaveHobby } = useLocalSavedHobbies();
  const { formatPrice, isLoading: isCurrencyLoading } = useCurrency();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Track page view on mount
  useEffect(() => {
    trackPageView('/explore');
  }, []);

  // Handle filter change with tracking
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    if (filter !== 'all') {
      trackFilterUse('explore_filter', filter);
    }
  };

  // Handle save with tracking
  const handleToggleSave = (hobbyId: string, hobbyTitle: string) => {
    const wasSaved = savedHobbies.has(hobbyId);
    toggleSaveHobby(hobbyId);
    trackHobbySave(hobbyId, hobbyTitle, !wasSaved);
  };

  // Filter hobbies based on selected filter
  const filteredHobbies = useMemo(() => {
    switch (activeFilter) {
      case 'quick':
        // Hobbies that can be done in 30-60 min
        return ART_CRAFT_HOBBIES.filter(h => 
          h.timeRequired?.includes('30') || h.timeRequired?.includes('45')
        );
      case 'budget-friendly':
        // Hobbies under $50 to start
        return ART_CRAFT_HOBBIES.filter(h => {
          const costMatch = h.cost?.match(/\$(\d+)/);
          if (costMatch) {
            return parseInt(costMatch[1]) < 50;
          }
          return false;
        });
      case 'saved':
        return ART_CRAFT_HOBBIES.filter(h => savedHobbies.has(h.id));
      default:
        return ART_CRAFT_HOBBIES;
    }
  }, [activeFilter, savedHobbies]);

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
      {/* Header */}
      <section className="py-12 border-b border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-serif font-medium text-gray-900 mb-2">
            Explore Hobbies
          </h1>
          <p className="text-gray-600">
            Find your perfect creative hobby
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {FILTERS.map(filter => (
              <button
                key={filter.id}
                onClick={() => handleFilterChange(filter.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  activeFilter === filter.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results count */}
          <p className="text-sm text-gray-500 mb-6">
            {filteredHobbies.length} {filteredHobbies.length === 1 ? 'hobby' : 'hobbies'} found
          </p>

          {filteredHobbies.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHobbies.map(hobby => (
                <HobbyCard key={hobby.id} hobby={hobby} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">
                {activeFilter === 'saved' ? '💝' : '🔍'}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {activeFilter === 'saved' 
                  ? 'No saved hobbies yet' 
                  : 'No hobbies match this filter'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {activeFilter === 'saved'
                  ? 'Tap the heart icon on any hobby to save it here'
                  : 'Try a different filter to explore more options'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-amber-50/50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-xl font-serif font-medium text-gray-900 mb-3">
            Why Art & Craft?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Creative hobbies like painting, pottery, and calligraphy are perfect for 
            stress relief and self-expression. They require minimal physical energy 
            and can be practiced at home on your own schedule.
          </p>
        </div>
      </section>
    </div>
  );
};
