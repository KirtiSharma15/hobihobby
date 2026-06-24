/**
 * Hobby Detail Page - Phase 2: Learning Paths MVP
 * 
 * Shows comprehensive hobby information with learning path access.
 * Features:
 * - What it is (description)
 * - Who it's for (personality fit)
 * - Starter checklist with costs
 * - First 3 beginner steps
 * - Intro video link
 * - Local save functionality
 * - Link to structured learning path
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useLocalSavedHobbies } from '@/hooks/useLocalSavedHobbies';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/utils/cn';
import { trackHobbyView, trackHobbySave, trackTimeOnPage } from '@/utils/analytics';

// Art & Craft hobby details (matches backend)
interface HobbyDetail {
  id: string;
  name: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl: string;
  rating: number;
  reviewCount: number;
  personalityFit: string;
  starterChecklist: { item: string; cost: string; required: boolean }[];
  estimatedStarterCost: string;
  beginnerSteps: { step: number; title: string; description: string; duration: string; tip: string }[];
  introVideoUrl: string;
  introVideoTitle: string;
}

const HOBBY_DETAILS: Record<string, HobbyDetail> = {
  'watercolor-painting': {
    id: 'watercolor-painting',
    name: 'Watercolor Painting',
    title: 'Watercolor Painting',
    description: 'Create beautiful, flowing artwork with watercolors. This calming hobby lets you express creativity through soft washes of color and delicate brushwork.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629772451220-8569bfac996f?w=800',
    rating: 4.8,
    reviewCount: 892,
    personalityFit: 'Perfect for those who enjoy quiet, meditative activities and want to express themselves visually. Great for relaxation and stress relief.',
    starterChecklist: [
      { item: 'Watercolor paint set (12-24 colors)', cost: '$15-30', required: true },
      { item: 'Watercolor paper pad (9x12")', cost: '$10-15', required: true },
      { item: 'Round brushes set (sizes 2, 6, 10)', cost: '$10-20', required: true },
      { item: 'Water containers (2)', cost: '$5', required: true },
      { item: 'Paper towels or cloth', cost: '$3', required: true },
      { item: 'Palette or white plate', cost: '$5-10', required: false },
    ],
    estimatedStarterCost: '$48-88',
    beginnerSteps: [
      {
        step: 1,
        title: 'Learn Basic Washes',
        description: 'Practice creating flat washes and gradients. Wet your paper, load your brush with paint, and practice making even strokes across the page.',
        duration: '30-45 min',
        tip: 'Start with lots of water and less paint. You can always add more color, but cannot take it away.',
      },
      {
        step: 2,
        title: 'Practice Color Mixing',
        description: 'Learn to mix colors on your palette. Start with primary colors (red, blue, yellow) and create secondary colors.',
        duration: '30-45 min',
        tip: 'Keep a color chart of your mixes for reference.',
      },
      {
        step: 3,
        title: 'Paint a Simple Subject',
        description: 'Choose something simple like a fruit, leaf, or cloud. Use your wash and color mixing skills to create your first complete painting.',
        duration: '45-60 min',
        tip: 'Work from light to dark colors, letting each layer dry before adding the next.',
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=WVrsPoRo5oE',
    introVideoTitle: 'Watercolor Basics for Beginners',
  },
  'acrylic-painting': {
    id: 'acrylic-painting',
    name: 'Acrylic Painting',
    title: 'Acrylic Painting',
    description: 'Versatile and forgiving, acrylic painting lets you create bold artwork that dries quickly. Great for beginners who want to experiment freely.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
            rating: 4.7,
    reviewCount: 756,
    personalityFit: 'Ideal for creative souls who like to experiment. Acrylics are forgiving and dry quickly, making them perfect for those who want immediate results.',
    starterChecklist: [
      { item: 'Acrylic paint set (12 colors)', cost: '$15-25', required: true },
      { item: 'Canvas boards or panels (3-pack)', cost: '$10-15', required: true },
      { item: 'Brush set (flat and round)', cost: '$10-15', required: true },
      { item: 'Palette or paper plates', cost: '$5', required: true },
      { item: 'Cup of water', cost: '$0', required: true },
      { item: 'Easel (tabletop)', cost: '$15-25', required: false },
    ],
    estimatedStarterCost: '$40-60',
    beginnerSteps: [
      {
        step: 1,
        title: 'Understand Paint Consistency',
        description: 'Experiment with thick (impasto) and thin (wash) applications. Try painting swatches with different amounts of water.',
        duration: '20-30 min',
        tip: 'Acrylics dry quickly, so work in small sections and keep your palette moist.',
      },
      {
        step: 2,
        title: 'Practice Brush Techniques',
        description: 'Learn flat strokes, dabbing, and blending. Practice creating gradients by blending two colors while wet.',
        duration: '30-45 min',
        tip: 'Clean your brushes immediately after use, as dried acrylic is hard to remove.',
      },
      {
        step: 3,
        title: 'Create Your First Painting',
        description: 'Paint a simple landscape or abstract piece. Start with the background, let it dry, then add foreground elements.',
        duration: '1-2 hours',
        tip: "Don't worry about mistakes - acrylics can be painted over once dry!",
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=oGPCDGwCpFg',
    introVideoTitle: 'Acrylic Painting for Complete Beginners',
  },
  'pottery-ceramics': {
    id: 'pottery-ceramics',
    name: 'Pottery & Ceramics',
    title: 'Pottery & Ceramics',
    description: 'Shape clay into functional and decorative objects. This tactile, meditative hobby connects you with an ancient craft and produces beautiful results.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629380321590-3b3f75d66dec?w=800',
    rating: 4.9,
    reviewCount: 1245,
    personalityFit: 'Perfect for those who love working with their hands and find peace in repetitive, focused tasks. Great for people who want something physical to show for their efforts.',
    starterChecklist: [
      { item: 'Air-dry clay (2-5 lbs)', cost: '$10-20', required: true },
      { item: 'Basic pottery tools set', cost: '$10-15', required: true },
      { item: 'Rolling pin or PVC pipe', cost: '$5-10', required: true },
      { item: 'Plastic sheets (to work on)', cost: '$5', required: true },
      { item: 'Sponge and water bowl', cost: '$5', required: true },
      { item: 'Acrylic paints for finishing', cost: '$10-15', required: false },
    ],
    estimatedStarterCost: '$45-80',
    beginnerSteps: [
      {
        step: 1,
        title: 'Condition Your Clay',
        description: 'Knead your clay to remove air bubbles and make it pliable. Roll it, fold it, and press it until smooth.',
        duration: '10-15 min',
        tip: 'If clay feels too dry, add a few drops of water while kneading.',
      },
      {
        step: 2,
        title: 'Make a Pinch Pot',
        description: 'Roll a ball of clay, push your thumb into the center, and pinch the walls while rotating. This is the simplest pottery form.',
        duration: '20-30 min',
        tip: 'Keep walls even thickness (about pencil-width) for best results.',
      },
      {
        step: 3,
        title: 'Create a Coil Pot',
        description: 'Roll clay into long coils and stack them in circles to build a pot. Smooth the inside and outside to blend.',
        duration: '45-60 min',
        tip: 'Score and slip (scratch and wet) surfaces before joining pieces.',
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=MaH2s2Hf7tI',
    introVideoTitle: 'Hand Building Pottery for Beginners',
  },
  'calligraphy': {
    id: 'calligraphy',
    name: 'Calligraphy & Lettering',
    title: 'Calligraphy & Lettering',
    description: 'Transform words into art with beautiful handwriting. Calligraphy combines creativity with structure, producing elegant lettering.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    rating: 4.6,
    reviewCount: 567,
    personalityFit: 'Great for detail-oriented people who enjoy precision and practice. Perfect for those who want a calm, focused activity that produces shareable art.',
    starterChecklist: [
      { item: 'Brush pen set (3-4 pens)', cost: '$10-15', required: true },
      { item: 'Calligraphy practice pad', cost: '$8-12', required: true },
      { item: 'Guide sheets (printable)', cost: '$0-5', required: true },
      { item: 'Smooth cardstock (for projects)', cost: '$5-10', required: false },
      { item: 'Traditional dip pen and ink', cost: '$15-25', required: false },
    ],
    estimatedStarterCost: '$23-32',
    beginnerSteps: [
      {
        step: 1,
        title: 'Learn Basic Strokes',
        description: 'Practice the fundamental strokes: downstrokes (thick), upstrokes (thin), curves, and ovals.',
        duration: '30-45 min',
        tip: 'Apply pressure on downstrokes, release on upstrokes for classic thick/thin variation.',
      },
      {
        step: 2,
        title: 'Practice Lowercase Letters',
        description: 'Start with lowercase letters, grouping similar shapes together. Practice a-c-d-g-q, then n-m-h-b-p.',
        duration: '45-60 min',
        tip: 'Use guide sheets under your paper to keep letters consistent.',
      },
      {
        step: 3,
        title: 'Write Your First Word',
        description: 'Connect your letters to write simple words like "hello" or "love". Focus on consistent spacing.',
        duration: '30-45 min',
        tip: 'Slow down at connections between letters. Speed will come with practice.',
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=sBoVGqiSzr4',
    introVideoTitle: 'Calligraphy for Absolute Beginners',
  },
  'hand-lettering': {
    id: 'hand-lettering',
    name: 'Hand Lettering',
    title: 'Hand Lettering',
    description: 'Draw decorative letters and typography by hand. More freeform than calligraphy, hand lettering lets you develop your own unique style.',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1596465786192-04e9dc3e0f6d?w=800',
    rating: 4.7,
    reviewCount: 423,
    personalityFit: 'Perfect for creative people who want flexibility. Unlike strict calligraphy, hand lettering encourages personal style and experimentation.',
    starterChecklist: [
      { item: 'Pencil and eraser', cost: '$3-5', required: true },
      { item: 'Fine-tip markers (black)', cost: '$8-12', required: true },
      { item: 'Brush markers (assorted)', cost: '$10-15', required: true },
      { item: 'Sketch paper pad', cost: '$5-10', required: true },
      { item: 'Grid paper', cost: '$3-5', required: false },
      { item: 'Colored markers set', cost: '$15-25', required: false },
    ],
    estimatedStarterCost: '$26-42',
    beginnerSteps: [
      {
        step: 1,
        title: 'Sketch Letter Shapes',
        description: 'Start with pencil! Draw bubble letters, block letters, and script letters. Experiment with different widths.',
        duration: '30-45 min',
        tip: 'Draw letters lightly first so you can adjust before inking.',
      },
      {
        step: 2,
        title: 'Add Weight and Style',
        description: 'Choose which parts of letters will be thick vs thin. Add serifs, shadows, or decorative elements.',
        duration: '30-45 min',
        tip: 'Thicken all downstrokes for a classic look, or get creative with custom patterns.',
      },
      {
        step: 3,
        title: 'Ink Your Lettering',
        description: 'Trace over your pencil work with markers. Start with outlines, then fill in. Erase pencil marks after ink dries.',
        duration: '45-60 min',
        tip: 'Wait for ink to fully dry before erasing to avoid smudging.',
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=gGQcdIRSjMU',
    introVideoTitle: 'Hand Lettering for Beginners',
  },
};

type TabType = 'overview' | 'checklist' | 'steps';

export const HobbyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { savedHobbies, toggleSaveHobby } = useLocalSavedHobbies();
  const { formatPrice, currency, currencyInfo, isLoading: isCurrencyLoading } = useCurrency();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const startTimeRef = useRef<number>(Date.now());

  // Get hobby data
  const hobby = HOBBY_DETAILS[id || ''] || HOBBY_DETAILS['watercolor-painting'];
  const isSaved = savedHobbies.has(hobby.id);

  // Track page view and time spent
  useEffect(() => {
    // Track hobby view
    trackHobbyView(hobby.id, hobby.name);
    startTimeRef.current = Date.now();

    // Track time on page when leaving
    return () => {
      const seconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (seconds > 3) { // Only track if more than 3 seconds
        trackTimeOnPage(hobby.id, seconds);
      }
    };
  }, [hobby.id, hobby.name]);

  const handleSave = () => {
    toggleSaveHobby(hobby.id);
    trackHobbySave(hobby.id, hobby.name, !isSaved);
  };

  const handleWatchVideo = () => {
    if (hobby.introVideoUrl) {
      window.open(hobby.introVideoUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
      <button
        onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
              <span className="mr-2">←</span>
        Back
      </button>
            <button
              onClick={handleSave}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl">{isSaved ? '❤️' : '🤍'}</span>
            </button>
          </div>
        </div>
      </div>

          {/* Hero Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={hobby.imageUrl}
          alt={hobby.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-block px-3 py-1 bg-emerald-500 text-white text-sm font-medium rounded-md capitalize mb-3">
                  {hobby.difficulty}
                </span>
            <h1 className="text-3xl md:text-4xl font-serif font-medium text-white mb-2">
              {hobby.title}
            </h1>
            <div className="flex items-center gap-3 text-white/90">
              <span>⭐ {hobby.rating}</span>
              <span>•</span>
              <span>{hobby.reviewCount} reviews</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Video Button */}
        <div 
          onClick={handleWatchVideo}
          className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow mb-8"
        >
          <div className="w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">▶️</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Watch Introduction</p>
            <p className="font-medium text-gray-900">{hobby.introVideoTitle}</p>
          </div>
            </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 pb-4">
          {(['overview', 'checklist', 'steps'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
                      className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                activeTab === tab
                  ? 'bg-amber-100 text-amber-800'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {tab === 'checklist' ? 'What You Need' : tab === 'steps' ? 'First Steps' : tab}
            </button>
                  ))}
                </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-serif font-medium text-gray-900 mb-3">
                  What is {hobby.name}?
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {hobby.description}
                </p>
          </div>

              <div>
                <h2 className="text-xl font-serif font-medium text-gray-900 mb-3">
                  Who is it for?
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {hobby.personalityFit}
                </p>
              </div>

              <div className="bg-amber-50 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Estimated cost to start:</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {isCurrencyLoading ? '...' : formatPrice(hobby.estimatedStarterCost)}
                  </span>
                </div>
                {currency !== 'USD' && !isCurrencyLoading && (
                  <p className="text-xs text-gray-500 mt-2 text-right">
                    Prices shown in {currencyInfo.name} ({currency})
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Here's everything you need to get started. Required items are marked with a colored dot.
              </p>
              
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {hobby.starterChecklist.map((item, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        item.required ? 'bg-amber-500' : 'bg-gray-300'
                      )} />
                      <div>
                        <p className="font-medium text-gray-900">{item.item}</p>
                        <p className="text-sm text-gray-500">{item.required ? 'Required' : 'Optional'}</p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-700">
                      {isCurrencyLoading ? '...' : formatPrice(item.cost)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Total estimated cost:</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {isCurrencyLoading ? '...' : formatPrice(hobby.estimatedStarterCost)}
                  </span>
                </div>
                {currency !== 'USD' && !isCurrencyLoading && (
                  <p className="text-xs text-gray-500 mt-2 text-right">
                    Prices shown in {currencyInfo.name} ({currency})
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-6">
              <p className="text-gray-600">
                Start with these 3 beginner-friendly steps. Take your time with each one.
              </p>

              {hobby.beginnerSteps.map(step => (
                <div key={step.step} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded">
                        ⏱️ {step.duration}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 pl-14">
                    {step.description}
                  </p>
                  <div className="bg-emerald-50 rounded-lg p-4 ml-14">
                    <p className="text-sm">
                      <span className="font-medium text-emerald-700">💡 Tip: </span>
                      <span className="text-gray-700">{step.tip}</span>
                    </p>
                    </div>
                    </div>
              ))}
                      </div>
                    )}
                  </div>

        {/* Start Learning CTA */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-8 border border-amber-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-serif font-medium text-gray-900 mb-1">
                Ready to learn {hobby.name}?
              </h3>
              <p className="text-gray-600">
                Follow our structured beginner course with videos, articles, and hands-on exercises.
              </p>
            </div>
            <Link
              to={`/hobby/${hobby.id}/learn`}
              className="inline-flex items-center justify-center px-6 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors whitespace-nowrap"
            >
              Start Learning →
            </Link>
          </div>
        </div>

        {/* Save CTA */}
        <div className="text-center py-8 border-t border-gray-100">
          <Button
            onClick={handleSave}
            variant={isSaved ? 'secondary' : 'default'}
            size="lg"
            className="min-w-[200px]"
          >
            {isSaved ? 'Saved to My Hobbies ❤️' : 'Save This Hobby'}
          </Button>
          <p className="text-sm text-gray-500 mt-3">
            Save hobbies to find them easily later
          </p>
        </div>
      </div>
    </div>
  );
};
