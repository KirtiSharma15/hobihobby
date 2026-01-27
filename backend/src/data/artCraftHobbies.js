/**
 * Art & Craft Hobbies Data
 * 
 * Phase 1 focused data: Painting, Pottery, Calligraphy
 * Each hobby includes:
 * - What it is (description)
 * - Who it's for (personality fit)
 * - Starter checklist with costs
 * - First 3 beginner steps
 * - Intro video URL
 */

const ART_CRAFT_HOBBIES = [
  {
    id: 'watercolor-painting',
    name: 'Watercolor Painting',
    title: 'Watercolor Painting',
    description: 'Create beautiful, flowing artwork with watercolors. This calming hobby lets you express creativity through soft washes of color and delicate brushwork.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629772451220-8569bfac996f?w=800',
    tags: ['creative', 'relaxing', 'art', 'painting'],
    rating: 4.8,
    reviewCount: 892,
    averageRating: 4.8,
    totalRatings: 892,
    physicalEnergy: 'low',
    mentalEnergy: 'medium',
    budgetLevel: 'low',
    timeLevel: 'medium',
    // Who it's for
    personalityFit: 'Perfect for those who enjoy quiet, meditative activities and want to express themselves visually. Great for relaxation and stress relief.',
    // Starter checklist
    starterChecklist: [
      { item: 'Watercolor paint set (12-24 colors)', cost: '$15-30', required: true },
      { item: 'Watercolor paper pad (9x12")', cost: '$10-15', required: true },
      { item: 'Round brushes set (sizes 2, 6, 10)', cost: '$10-20', required: true },
      { item: 'Water containers (2)', cost: '$5', required: true },
      { item: 'Paper towels or cloth', cost: '$3', required: true },
      { item: 'Palette or white plate', cost: '$5-10', required: false },
      { item: 'Masking tape', cost: '$5', required: false },
    ],
    estimatedStarterCost: '$48-88',
    // First 3 beginner steps
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
        description: 'Learn to mix colors on your palette. Start with primary colors (red, blue, yellow) and create secondary colors. Experiment with water-to-paint ratios.',
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
    // Intro video
    introVideoUrl: 'https://www.youtube.com/watch?v=WVrsPoRo5oE',
    introVideoTitle: 'Watercolor Basics for Beginners',
  },
  {
    id: 'acrylic-painting',
    name: 'Acrylic Painting',
    title: 'Acrylic Painting',
    description: 'Versatile and forgiving, acrylic painting lets you create bold artwork that dries quickly. Great for beginners who want to experiment freely.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
    tags: ['creative', 'colorful', 'art', 'painting'],
    rating: 4.7,
    reviewCount: 756,
    averageRating: 4.7,
    totalRatings: 756,
    physicalEnergy: 'low',
    mentalEnergy: 'medium',
    budgetLevel: 'low',
    timeLevel: 'medium',
    personalityFit: 'Ideal for creative souls who like to experiment. Acrylics are forgiving and dry quickly, making them perfect for those who want immediate results.',
    starterChecklist: [
      { item: 'Acrylic paint set (12 colors)', cost: '$15-25', required: true },
      { item: 'Canvas boards or panels (3-pack)', cost: '$10-15', required: true },
      { item: 'Brush set (flat and round)', cost: '$10-15', required: true },
      { item: 'Palette or paper plates', cost: '$5', required: true },
      { item: 'Cup of water', cost: '$0', required: true },
      { item: 'Easel (tabletop)', cost: '$15-25', required: false },
      { item: 'Palette knife', cost: '$5-10', required: false },
    ],
    estimatedStarterCost: '$40-60',
    beginnerSteps: [
      {
        step: 1,
        title: 'Understand Paint Consistency',
        description: 'Experiment with thick (impasto) and thin (wash) applications. Try painting swatches with different amounts of water to see how the paint behaves.',
        duration: '20-30 min',
        tip: 'Acrylics dry quickly, so work in small sections and keep your palette moist with a spray bottle.',
      },
      {
        step: 2,
        title: 'Practice Brush Techniques',
        description: 'Learn flat strokes, dabbing, and blending. Practice creating gradients by blending two colors while the paint is still wet.',
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
  {
    id: 'pottery-ceramics',
    name: 'Pottery & Ceramics',
    title: 'Pottery & Ceramics',
    description: 'Shape clay into functional and decorative objects. This tactile, meditative hobby connects you with an ancient craft and produces beautiful, tangible results.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1629380321590-3b3f75d66dec?w=800',
    tags: ['creative', 'hands-on', 'meditative', 'craft'],
    rating: 4.9,
    reviewCount: 1245,
    averageRating: 4.9,
    totalRatings: 1245,
    physicalEnergy: 'medium',
    mentalEnergy: 'low',
    budgetLevel: 'medium',
    timeLevel: 'medium',
    personalityFit: 'Perfect for those who love working with their hands and find peace in repetitive, focused tasks. Great for people who want something physical to show for their efforts.',
    starterChecklist: [
      { item: 'Air-dry clay (2-5 lbs)', cost: '$10-20', required: true },
      { item: 'Basic pottery tools set', cost: '$10-15', required: true },
      { item: 'Rolling pin or PVC pipe', cost: '$5-10', required: true },
      { item: 'Plastic sheets (to work on)', cost: '$5', required: true },
      { item: 'Sponge and water bowl', cost: '$5', required: true },
      { item: 'Acrylic paints for finishing', cost: '$10-15', required: false },
      { item: 'Sealant spray', cost: '$8-12', required: false },
    ],
    estimatedStarterCost: '$45-80',
    beginnerSteps: [
      {
        step: 1,
        title: 'Condition Your Clay',
        description: 'Knead your clay to remove air bubbles and make it pliable. Roll it, fold it, and press it until it feels smooth and consistent.',
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
        description: 'Roll clay into long coils (snakes) and stack them in circles to build a pot. Smooth the inside and outside to blend the coils.',
        duration: '45-60 min',
        tip: 'Score and slip (scratch and wet) surfaces before joining pieces.',
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=MaH2s2Hf7tI',
    introVideoTitle: 'Hand Building Pottery for Beginners',
  },
  {
    id: 'calligraphy',
    name: 'Calligraphy',
    title: 'Calligraphy & Lettering',
    description: 'Transform words into art with beautiful handwriting. Calligraphy combines creativity with structure, producing elegant lettering for cards, art, and personal projects.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800',
    tags: ['creative', 'precise', 'writing', 'art'],
    rating: 4.6,
    reviewCount: 567,
    averageRating: 4.6,
    totalRatings: 567,
    physicalEnergy: 'low',
    mentalEnergy: 'medium',
    budgetLevel: 'low',
    timeLevel: 'low',
    personalityFit: 'Great for detail-oriented people who enjoy precision and practice. Perfect for those who want a calm, focused activity that produces shareable art.',
    starterChecklist: [
      { item: 'Brush pen set (3-4 pens)', cost: '$10-15', required: true },
      { item: 'Calligraphy practice pad', cost: '$8-12', required: true },
      { item: 'Guide sheets (printable)', cost: '$0-5', required: true },
      { item: 'Smooth cardstock (for projects)', cost: '$5-10', required: false },
      { item: 'Traditional dip pen and ink', cost: '$15-25', required: false },
      { item: 'Lightbox or bright window', cost: '$15-30', required: false },
    ],
    estimatedStarterCost: '$23-32',
    beginnerSteps: [
      {
        step: 1,
        title: 'Learn Basic Strokes',
        description: 'Practice the fundamental strokes: downstrokes (thick), upstrokes (thin), curves, and ovals. These form the building blocks of all letters.',
        duration: '30-45 min',
        tip: 'Apply pressure on downstrokes, release on upstrokes. This creates the characteristic thick/thin variation.',
      },
      {
        step: 2,
        title: 'Practice Lowercase Letters',
        description: 'Start with lowercase letters, grouping similar shapes together. Practice a-c-d-g-q, then move to n-m-h-b-p, etc.',
        duration: '45-60 min',
        tip: 'Use guide sheets under your paper to keep letters consistent in size and slant.',
      },
      {
        step: 3,
        title: 'Write Your First Word',
        description: 'Connect your letters to write simple words. Start with short words like "hello" or "love" and focus on consistent spacing.',
        duration: '30-45 min',
        tip: 'Slow down at connections between letters. Speed will come with practice.',
      },
    ],
    introVideoUrl: 'https://www.youtube.com/watch?v=sBoVGqiSzr4',
    introVideoTitle: 'Calligraphy for Absolute Beginners',
  },
  {
    id: 'hand-lettering',
    name: 'Hand Lettering',
    title: 'Hand Lettering',
    description: 'Draw decorative letters and typography by hand. More freeform than calligraphy, hand lettering lets you develop your own unique style.',
    category: 'Art & Craft',
    difficulty: 'beginner',
    imageUrl: 'https://images.unsplash.com/photo-1596465786192-04e9dc3e0f6d?w=800',
    tags: ['creative', 'typography', 'design', 'art'],
    rating: 4.7,
    reviewCount: 423,
    averageRating: 4.7,
    totalRatings: 423,
    physicalEnergy: 'low',
    mentalEnergy: 'medium',
    budgetLevel: 'low',
    timeLevel: 'low',
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
        description: 'Start with pencil! Draw bubble letters, block letters, and script letters. Experiment with different widths and heights.',
        duration: '30-45 min',
        tip: 'Draw letters lightly first so you can adjust before inking.',
      },
      {
        step: 2,
        title: 'Add Weight and Style',
        description: 'Choose which parts of letters will be thick vs thin. Add serifs, shadows, or decorative elements to your pencil sketches.',
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
];

// Category metadata for filtering
const CATEGORIES = [
  {
    id: 'art-craft',
    name: 'Art & Craft',
    icon: '🎨',
    count: ART_CRAFT_HOBBIES.length,
    description: 'Express yourself through painting, pottery, and lettering',
  },
];

// Difficulty filters
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

// Time commitment filters
const TIME_LEVELS = {
  low: 'Quick (15-30 min sessions)',
  medium: 'Moderate (45-90 min sessions)',
  high: 'Extended (2+ hour sessions)',
};

// Budget filters
const BUDGET_LEVELS = {
  low: 'Under $50 to start',
  medium: '$50-150 to start',
  high: '$150+ to start',
};

module.exports = {
  ART_CRAFT_HOBBIES,
  CATEGORIES,
  DIFFICULTIES,
  TIME_LEVELS,
  BUDGET_LEVELS,
};


