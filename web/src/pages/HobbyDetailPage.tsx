/**
 * Hobby Detail Page - Artisan Theme
 *
 * Shows comprehensive hobby information: hero, stats, about, starter kit,
 * a preview of the 365-day journey, nearby classes, and tutorials.
 * Features:
 * - What it is (description) + who it's for (personality fit)
 * - Starter checklist with costs
 * - First 3 beginner steps, previewed as a Day 1-3 journey teaser
 * - Intro video link
 * - Local save functionality
 * - Link to structured learning path
 *
 * Mobile renders an immersive full-bleed hero with floating back/share/save
 * controls. Desktop renders a breadcrumb + contained hero in a 60% content
 * column, with a 40% sticky sidebar holding all primary actions.
 */

import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  Lock,
  Play,
  MapPin,
  Star,
  Sparkles,
  CircleDot,
  Wrench,
  Droplet,
  Settings2,
} from 'lucide-react';
import { useLocalSavedHobbies } from '@/hooks/useLocalSavedHobbies';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/utils/cn';
import { showToast } from '@/utils/toast';
import { trackHobbyView, trackHobbySave, trackTimeOnPage } from '@/utils/analytics';

interface NearbyClass {
  name: string;
  distanceKm: number;
  neighborhood: string;
  note: string;
  rating: number;
}

interface Tutorial {
  title: string;
  duration: string;
  onClick: () => void;
}

// Art & Craft hobby details (matches backend)
interface HobbyDetail {
  id: string;
  name: string;
  title: string;
  tagline: string;
  category: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timePerWeek: string;
  approxStarterCost: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  personalityFit: string;
  starterChecklist: { item: string; cost: string; required: boolean }[];
  estimatedStarterCost: string;
  beginnerSteps: { step: number; title: string; description: string; duration: string; tip: string }[];
  introVideoUrl: string;
  introVideoTitle: string;
  videoDuration: string;
  secondaryTutorial: { title: string; duration: string };
  tertiaryTutorial: { title: string; duration: string };
  nearbyClasses: NearbyClass[];
}

const HOBBY_DETAILS: Record<string, HobbyDetail> = {
  'watercolor-painting': {
    id: 'watercolor-painting',
    name: 'Watercolor Painting',
    title: 'Watercolor Painting',
    tagline: 'Where creativity meets tranquility.',
    category: 'Art',
    description: 'Create beautiful, flowing artwork with watercolors. This calming hobby lets you express creativity through soft washes of color and delicate brushwork.',
    difficulty: 'beginner',
    timePerWeek: '3 hrs/wk',
    approxStarterCost: '$70',
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
    videoDuration: '9:48',
    secondaryTutorial: { title: 'Mixing Your First Palette', duration: '6:15' },
    tertiaryTutorial: { title: 'Painting Your First Landscape', duration: '10:30' },
    nearbyClasses: [
      { name: 'Al Serkal Art Studio', distanceKm: 1.8, neighborhood: 'Al Quoz', note: 'Beginner welcome', rating: 4.7 },
      { name: 'The Watercolor Room', distanceKm: 3.2, neighborhood: 'Jumeirah', note: 'Small groups', rating: 4.9 },
    ],
  },
  'acrylic-painting': {
    id: 'acrylic-painting',
    name: 'Acrylic Painting',
    title: 'Acrylic Painting',
    tagline: 'Bold strokes, quick results.',
    category: 'Art',
    description: 'Versatile and forgiving, acrylic painting lets you create bold artwork that dries quickly. Great for beginners who want to experiment freely.',
    difficulty: 'beginner',
    timePerWeek: '3 hrs/wk',
    approxStarterCost: '$50',
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
    videoDuration: '11:20',
    secondaryTutorial: { title: 'Blending Techniques 101', duration: '7:40' },
    tertiaryTutorial: { title: 'Painting Bold Abstract Shapes', duration: '9:15' },
    nearbyClasses: [
      { name: 'Bloom Art Space', distanceKm: 2.1, neighborhood: 'Al Barsha', note: 'All levels', rating: 4.6 },
      { name: 'Canvas & Co Studio', distanceKm: 3.6, neighborhood: 'Downtown Dubai', note: 'Weekend classes', rating: 4.8 },
    ],
  },
  'pottery-ceramics': {
    id: 'pottery-ceramics',
    name: 'Pottery & Ceramics',
    title: 'Pottery & Ceramics',
    tagline: 'Shape clay into something beautiful.',
    category: 'Art',
    description: 'Pottery is a calming, hands-on craft where you shape clay into bowls, mugs and vases. It\u2019s beginner-friendly, deeply meditative, and you\u2019ll have something real to keep after your very first session. Our AI paces a 365-day journey so you improve a little every week \u2014 no pressure, just progress.',
    difficulty: 'beginner',
    timePerWeek: '3 hrs/wk',
    approxStarterCost: '$80',
    imageUrl: 'https://images.unsplash.com/photo-1629380321590-3b3f75d66dec?w=800',
    rating: 4.9,
    reviewCount: 1245,
    personalityFit: 'Perfect for those who love working with their hands and find peace in repetitive, focused tasks. Great for people who want something physical to show for their efforts.',
    starterChecklist: [
      { item: 'Air-dry clay (2-5 lbs)', cost: '$10-20', required: true },
      { item: 'Turntable', cost: '$10-15', required: true },
      { item: 'Trimming tools', cost: '$5-10', required: true },
      { item: 'Sponge', cost: '$5', required: true },
      { item: 'Glaze set', cost: '$10-15', required: false },
    ],
    estimatedStarterCost: '$45-80',
    beginnerSteps: [
      {
        step: 1,
        title: 'Center your first ball of clay',
        description: 'Knead your clay to remove air bubbles and make it pliable. Roll it, fold it, and press it until smooth.',
        duration: '~15 min',
        tip: 'If clay feels too dry, add a few drops of water while kneading.',
      },
      {
        step: 2,
        title: 'Pinch pot fundamentals',
        description: 'Roll a ball of clay, push your thumb into the center, and pinch the walls while rotating. This is the simplest pottery form.',
        duration: '20-30 min',
        tip: 'Keep walls even thickness (about pencil-width) for best results.',
      },
      {
        step: 3,
        title: 'Shaping your first bowl',
        description: 'Roll clay into long coils and stack them in circles to build a pot. Smooth the inside and outside to blend.',
        duration: '45-60 min',
        tip: 'Score and slip (scratch and wet) surfaces before joining pieces.',
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=MaH2s2Hf7tI',
    introVideoTitle: 'Pottery for total beginners',
    videoDuration: '12:04',
    secondaryTutorial: { title: 'Centering clay on the wheel', duration: '8:52' },
    tertiaryTutorial: { title: 'Glaze & finish your first bowl', duration: '15:20' },
    nearbyClasses: [
      { name: 'Clay Studio Dubai', distanceKm: 2.3, neighborhood: 'Al Quoz', note: 'Beginner welcome', rating: 4.8 },
      { name: 'The Pottery Corner', distanceKm: 4.1, neighborhood: 'JLT', note: 'Wheel-throwing', rating: 4.6 },
    ],
  },
  calligraphy: {
    id: 'calligraphy',
    name: 'Calligraphy & Lettering',
    title: 'Calligraphy & Lettering',
    tagline: 'Turn your handwriting into art.',
    category: 'Writing',
    description: 'Transform words into art with beautiful handwriting. Calligraphy combines creativity with structure, producing elegant lettering.',
    difficulty: 'beginner',
    timePerWeek: '2 hrs/wk',
    approxStarterCost: '$28',
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
    videoDuration: '8:12',
    secondaryTutorial: { title: 'Mastering Lowercase Letters', duration: '6:30' },
    tertiaryTutorial: { title: 'Writing Your First Quote', duration: '7:05' },
    nearbyClasses: [
      { name: 'Ink & Quill Studio', distanceKm: 1.5, neighborhood: 'Al Wasl', note: 'Beginner welcome', rating: 4.7 },
      { name: 'Dubai Calligraphy House', distanceKm: 3.0, neighborhood: 'Deira', note: 'Traditional styles', rating: 4.5 },
    ],
  },
  'hand-lettering': {
    id: 'hand-lettering',
    name: 'Hand Lettering',
    title: 'Hand Lettering',
    tagline: 'Freeform letters, your own style.',
    category: 'Writing',
    description: 'Draw decorative letters and typography by hand. More freeform than calligraphy, hand lettering lets you develop your own unique style.',
    difficulty: 'beginner',
    timePerWeek: '2 hrs/wk',
    approxStarterCost: '$35',
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
    videoDuration: '9:05',
    secondaryTutorial: { title: 'Adding Style & Shadows', duration: '5:48' },
    tertiaryTutorial: { title: 'Designing a Custom Word Art Piece', duration: '8:40' },
    nearbyClasses: [
      { name: 'Lettering Lab Dubai', distanceKm: 2.0, neighborhood: 'Al Barsha', note: 'All levels', rating: 4.6 },
      { name: 'The Type Studio', distanceKm: 3.4, neighborhood: 'Business Bay', note: 'Weekend workshops', rating: 4.7 },
    ],
  },
};

const STRIPE_STYLE: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(135deg, rgba(44,24,16,0.08) 0px, rgba(44,24,16,0.08) 10px, transparent 10px, transparent 20px)',
};

const CHIP_ICONS = [Sparkles, CircleDot, Wrench, Droplet, Settings2];

/** Turns a verbose checklist entry into a short, chip-friendly label. */
const shortenChecklistLabel = (item: string): string =>
  item
    .replace(/\s*\([^)]*\)/g, '')
    .split(/\s+(?:and|or)\s+/i)[0]
    .trim();

const DIFFICULTY_TONE: Record<HobbyDetail['difficulty'], string> = {
  beginner: 'bg-olive/10 text-olive',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-terracotta/10 text-terracotta',
};

interface StatPillProps {
  label: string;
  value: string;
  tone?: HobbyDetail['difficulty'] | 'default';
}

const StatPill: React.FC<StatPillProps> = ({ label, value, tone = 'default' }) => (
  <div
    className={cn(
      'flex flex-col items-center gap-0.5 rounded-xl px-2 py-3 text-center',
      tone === 'default' ? 'border border-border bg-surface text-ink' : DIFFICULTY_TONE[tone]
    )}
  >
    <span className="truncate text-sm font-bold capitalize">{value}</span>
    <span className="text-[11px] opacity-70">{label}</span>
  </div>
);

const NearbyClassCard: React.FC<{ venue: NearbyClass; tint: string }> = ({ venue, tint }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm">
    <div className={cn('h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br', tint)} style={STRIPE_STYLE} />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-ink">{venue.name}</p>
      <p className="truncate text-xs text-taupe">
        {venue.distanceKm} km · {venue.neighborhood} · {venue.note}
      </p>
    </div>
    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ink">
      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
      {venue.rating}
    </span>
  </div>
);

const NEARBY_TINTS = ['from-terracotta/25 to-terracotta/5', 'from-olive/25 to-olive/10', 'from-rose-400/25 to-rose-300/10'];

const NearbyClassesSection: React.FC<{ hobby: HobbyDetail }> = ({ hobby }) => (
  <section>
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-ink">Nearby classes</h2>
      <button
        type="button"
        onClick={() => showToast('The hobby map is launching in a future update')}
        className="text-sm font-medium text-terracotta"
      >
        Map
      </button>
    </div>
    <div className="space-y-3">
      {hobby.nearbyClasses.map((venue, index) => (
        <NearbyClassCard key={venue.name} venue={venue} tint={NEARBY_TINTS[index % NEARBY_TINTS.length]} />
      ))}
    </div>
  </section>
);

const AboutSection: React.FC<{ hobby: HobbyDetail }> = ({ hobby }) => (
  <section>
    <h2 className="mb-3 text-xl font-semibold text-ink">About</h2>
    <p className="text-sm leading-relaxed text-taupe">{hobby.description}</p>
  </section>
);

const WhatYouNeedSection: React.FC<{
  hobby: HobbyDetail;
  displayStarterCost: string;
  priceNote: string | null;
}> = ({ hobby, displayStarterCost, priceNote }) => (
  <section>
    <h2 className="mb-3 text-xl font-semibold text-ink">What you&apos;ll need</h2>
    <div className="mb-4 flex flex-wrap gap-2">
      {hobby.starterChecklist.map((item, index) => {
        const ChipIcon = CHIP_ICONS[index % CHIP_ICONS.length];
        return (
          <span
            key={item.item}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink"
          >
            <ChipIcon className="h-3.5 w-3.5 text-olive" />
            {shortenChecklistLabel(item.item)}
          </span>
        );
      })}
    </div>
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-terracotta/10 p-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-terracotta-dark">Complete starter kit</p>
        {priceNote && <p className="text-xs text-taupe">{priceNote}</p>}
      </div>
      <button
        type="button"
        onClick={() => showToast('Shopping list coming soon')}
        className="shrink-0 rounded-full bg-terracotta px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
      >
        Shop · {displayStarterCost}
      </button>
    </div>
  </section>
);

const JourneySection: React.FC<{ hobby: HobbyDetail; learnPath: string; showCta?: boolean }> = ({
  hobby,
  learnPath,
  showCta = true,
}) => (
  <section>
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-ink">Your 365-day journey</h2>
      <span className="text-xs font-medium text-taupe">AI-guided</span>
    </div>

    <div className="divide-y divide-border rounded-2xl bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-4 pb-4">
        <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-terracotta text-white">
          <span className="text-[9px] font-semibold uppercase leading-none">Day</span>
          <span className="text-base font-bold leading-none">1</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{hobby.beginnerSteps[0].title}</p>
          <p className="text-xs text-taupe">{hobby.beginnerSteps[0].duration} · watch + try</p>
        </div>
      </div>

      {hobby.beginnerSteps.slice(1).map((step, index) => (
        <div key={step.step} className="flex items-center gap-4 pt-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-border">
            <Lock className="h-4 w-4 text-taupe" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-taupe">{step.title}</p>
            <p className="text-xs text-taupe/70">
              {index === 0 ? 'Day 2 · unlocks after Day 1' : 'Day 3'}
            </p>
          </div>
        </div>
      ))}
    </div>

    <p className="mt-3 text-center text-xs text-taupe">+ 362 more days, paced for you</p>

    {showCta && (
      <Link
        to={learnPath}
        className="mt-4 block w-full rounded-2xl bg-terracotta/10 py-3 text-center text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta/15"
      >
        Start Journey →
      </Link>
    )}
  </section>
);

const TutorialCard: React.FC<{ tutorial: Tutorial; imageUrl: string; className?: string }> = ({
  tutorial,
  imageUrl,
  className,
}) => (
  <div onClick={tutorial.onClick} className={cn('cursor-pointer', className)}>
    <div className="relative h-28 w-full overflow-hidden rounded-2xl">
      <img src={imageUrl} alt={tutorial.title} className="h-full w-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
          <Play className="ml-0.5 h-3.5 w-3.5 fill-terracotta text-terracotta" />
        </span>
      </div>
      <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
        {tutorial.duration}
      </span>
    </div>
    <p className="mt-2 line-clamp-2 text-sm font-medium text-ink">{tutorial.title}</p>
    <p className="text-xs text-taupe">HobiHobby · Studio</p>
  </div>
);

const TutorialsSection: React.FC<{
  tutorials: Tutorial[];
  imageUrl: string;
  layout: 'scroll' | 'grid';
}> = ({ tutorials, imageUrl, layout }) => (
  <section>
    <h2 className="mb-4 text-xl font-semibold text-ink">Tutorials</h2>
    <div
      className={
        layout === 'scroll'
          ? 'flex gap-4 overflow-x-auto pb-1'
          : 'grid grid-cols-3 gap-4'
      }
    >
      {tutorials.map((tutorial) => (
        <TutorialCard
          key={tutorial.title}
          tutorial={tutorial}
          imageUrl={imageUrl}
          className={layout === 'scroll' ? 'w-44 shrink-0' : undefined}
        />
      ))}
    </div>
  </section>
);

export const HobbyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { savedHobbies, toggleSaveHobby } = useLocalSavedHobbies();
  const { formatPrice, currency, currencyInfo, isLoading: isCurrencyLoading } = useCurrency();
  const startTimeRef = useRef<number>(Date.now());

  // Get hobby data
  const hobby = HOBBY_DETAILS[id || ''] || HOBBY_DETAILS['watercolor-painting'];
  const isSaved = savedHobbies.has(hobby.id);
  const matchScore = Math.round(hobby.rating * 20);

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

  const handleShare = async () => {
    const shareData = {
      title: hobby.title,
      text: `Check out ${hobby.title} on HobiHobby`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the share sheet - nothing to do
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard');
    } catch {
      showToast('Unable to copy link');
    }
  };

  const priceNote =
    currency !== 'USD' && !isCurrencyLoading ? `Prices shown in ${currencyInfo.name} (${currency})` : null;

  const learnPath = `/hobby/${hobby.id}/learn`;
  const displayStarterCost = isCurrencyLoading ? '...' : formatPrice(hobby.approxStarterCost);

  const tutorials: Tutorial[] = [
    { title: hobby.introVideoTitle, duration: hobby.videoDuration, onClick: handleWatchVideo },
    {
      title: hobby.secondaryTutorial.title,
      duration: hobby.secondaryTutorial.duration,
      onClick: () => showToast('More tutorials coming soon'),
    },
    {
      title: hobby.tertiaryTutorial.title,
      duration: hobby.tertiaryTutorial.duration,
      onClick: () => showToast('More tutorials coming soon'),
    },
  ];

  return (
    <div className="min-h-screen bg-cream pb-40 font-jakarta lg:pb-16">
      {/* ============================= MOBILE ============================= */}
      <div className="lg:hidden">
        {/* Hero image */}
        <div className="relative h-64 w-full overflow-hidden">
          <img src={hobby.imageUrl} alt={hobby.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/10" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-ink shadow-md transition-colors hover:bg-surface"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-ink shadow-md transition-colors hover:bg-surface"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-olive px-3 py-1 text-xs font-bold text-white">
            <Sparkles className="h-3 w-3" />
            {matchScore}% match
          </span>
        </div>

        <div className="relative -mt-4 rounded-t-3xl bg-cream px-4 pt-8 sm:px-6">
          {/* Floating save heart - straddles the hero seam */}
          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? 'Remove from saved' : 'Save hobby'}
            className="absolute -top-5 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-surface shadow-md transition-transform hover:scale-105 sm:right-6"
          >
            <Heart className={cn('h-5 w-5', isSaved ? 'fill-terracotta text-terracotta' : 'text-ink')} />
          </button>

          <h1 className="text-3xl font-bold text-ink">{hobby.title}</h1>
          <p className="mt-1 italic text-taupe">{hobby.tagline}</p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatPill label="difficulty" value={hobby.difficulty} tone={hobby.difficulty} />
            <StatPill label="time" value={hobby.timePerWeek} />
            <StatPill label="starter kit" value={`~${displayStarterCost}`} />
          </div>

          <div className="my-6 h-px bg-border" />

          <div className="space-y-8 pb-10">
            <AboutSection hobby={hobby} />
            <WhatYouNeedSection hobby={hobby} displayStarterCost={displayStarterCost} priceNote={priceNote} />
            <JourneySection hobby={hobby} learnPath={learnPath} />
            <NearbyClassesSection hobby={hobby} />
            <TutorialsSection tutorials={tutorials} imageUrl={hobby.imageUrl} layout="scroll" />
          </div>
        </div>
      </div>

      {/* ============================= DESKTOP ============================= */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-6xl px-8 pt-6">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-sm">
            <Link to="/explore" className="font-medium text-terracotta hover:underline">
              Explore
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-taupe" />
            <span className="text-taupe">Art &amp; Craft</span>
            <ChevronRight className="h-3.5 w-3.5 text-taupe" />
            <span className="text-taupe">{hobby.title}</span>
          </nav>

          <div className="flex items-start gap-10">
            {/* Main content - 60% */}
            <div className="w-[60%]">
              <div className="relative h-80 w-full overflow-hidden rounded-2xl">
                <img src={hobby.imageUrl} alt={hobby.title} className="h-full w-full object-cover" />
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-olive px-3 py-1 text-xs font-bold text-white">
                  <Sparkles className="h-3 w-3" />
                  {matchScore}% match
                </span>
              </div>

              <h1 className="mt-6 text-3xl font-bold text-ink">{hobby.title}</h1>
              <p className="mt-1 italic text-taupe">{hobby.tagline}</p>

              <div className="my-6 h-px bg-border" />

              <div className="space-y-8">
                <AboutSection hobby={hobby} />
                <WhatYouNeedSection hobby={hobby} displayStarterCost={displayStarterCost} priceNote={priceNote} />
                <JourneySection hobby={hobby} learnPath={learnPath} showCta={false} />
                <TutorialsSection tutorials={tutorials} imageUrl={hobby.imageUrl} layout="grid" />
              </div>
            </div>

            {/* Sidebar - 40%, sticky */}
            <aside className="w-[40%]">
              <div className="sticky top-24 space-y-4">
                <div className="space-y-4 rounded-2xl bg-surface p-5 shadow-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <StatPill label="difficulty" value={hobby.difficulty} tone={hobby.difficulty} />
                    <StatPill label="time" value={hobby.timePerWeek} />
                    <StatPill label="starter" value={`~${displayStarterCost}`} />
                  </div>

                  <Link
                    to={learnPath}
                    className="block w-full rounded-2xl bg-terracotta py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
                  >
                    Start Learning →
                  </Link>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta/10 py-3 text-sm font-semibold text-terracotta transition-colors hover:bg-terracotta/15"
                  >
                    <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
                    {isSaved ? 'Saved' : 'Save hobby'}
                  </button>

                  <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="text-taupe">Complete starter kit</span>
                    <span className="font-semibold text-ink">{displayStarterCost}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex w-full items-center justify-center gap-2 text-xs font-medium text-taupe transition-colors hover:text-ink"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share this hobby
                  </button>
                </div>

                <div className="rounded-2xl bg-surface p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <MapPin className="h-4 w-4 text-taupe" />
                      Nearby classes
                    </h3>
                    <button
                      type="button"
                      onClick={() => showToast('The hobby map is launching in a future update')}
                      className="text-xs font-medium text-terracotta"
                    >
                      Map
                    </button>
                  </div>
                  <div className="space-y-3">
                    {hobby.nearbyClasses.map((venue, index) => (
                      <NearbyClassCard
                        key={venue.name}
                        venue={venue}
                        tint={NEARBY_TINTS[index % NEARBY_TINTS.length]}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar - mobile only, sits above the global bottom nav */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface p-4 lg:hidden">
        <Link
          to={learnPath}
          className="block w-full rounded-2xl bg-terracotta py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark"
        >
          Start Learning
        </Link>
      </div>
    </div>
  );
};
