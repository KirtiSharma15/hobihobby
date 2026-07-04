/**
 * Learning Paths Data - Phase 2
 * 
 * Structured learning content for each Art & Craft hobby.
 * Each path contains modules with lessons of different types:
 * - video: Curated YouTube tutorials
 * - article: Written guides and tips
 * - exercise: Hands-on practice tasks
 * - challenge: Mini-projects to complete
 */

import type { LearningPath } from '@shared/types';

export const LEARNING_PATHS = {
  'watercolor-painting': {
    id: 'lp-watercolor',
    hobbyId: 'watercolor-painting',
    title: 'Watercolor Foundations',
    description: 'A complete beginner course to master watercolor painting fundamentals. Learn washes, color mixing, and create your first paintings.',
    difficulty: 'beginner',
    estimatedDuration: '4-6 hours',
    totalLessons: 12,
    modules: [
      {
        id: 'wc-m1',
        title: 'Getting Started',
        description: 'Set up your workspace and understand your materials',
        order: 1,
        icon: '🎨',
        lessons: [
          {
            id: 'wc-m1-l1',
            title: 'Understanding Watercolor Supplies',
            description: 'Learn about paints, brushes, paper, and other essentials',
            order: 1,
            type: 'video',
            duration: '12 min',
            videoUrl: 'https://www.youtube.com/watch?v=WVrsPoRo5oE',
            content: 'This video covers all the basic supplies you need to start watercolor painting.',
            externalResources: [
              { title: 'Recommended Beginner Supplies List', url: 'https://www.artistsnetwork.com/art-mediums/watercolor/watercolor-supplies-for-beginners/', type: 'article' }
            ]
          },
          {
            id: 'wc-m1-l2',
            title: 'Setting Up Your Workspace',
            description: 'Create an ideal painting environment',
            order: 2,
            type: 'article',
            duration: '8 min read',
            content: `## Creating Your Watercolor Workspace

A good workspace makes painting more enjoyable. Here's how to set up:

### Essentials
- **Flat surface** at comfortable height (slight tilt optional)
- **Two water containers** - one for rinsing, one for clean water
- **Paper towels or cloth** for blotting brushes
- **Natural or bright light** from the side (not behind you)

### Tips
- Keep supplies within arm's reach
- Protect your surface with newspaper or plastic
- Have a spray bottle to keep paints moist
- Work near a sink if possible for easy cleanup

### The "Golden Rule"
Always test colors on scrap paper before applying to your painting!`,
            externalResources: []
          },
          {
            id: 'wc-m1-l3',
            title: 'Prepare Your First Palette',
            description: 'Practice squeezing and activating paints',
            order: 3,
            type: 'exercise',
            duration: '15 min',
            content: 'Hands-on practice preparing your watercolor palette.',
            exerciseInstructions: [
              'Squeeze small amounts of each color onto your palette (pea-sized)',
              'Arrange colors in rainbow order: reds, oranges, yellows, greens, blues, purples',
              'Spray palette lightly with water',
              'Wait 5 minutes for paints to soften',
              'Test each color on scrap paper to see its intensity'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'wc-m2',
        title: 'Basic Techniques',
        description: 'Master fundamental watercolor techniques',
        order: 2,
        icon: '💧',
        lessons: [
          {
            id: 'wc-m2-l1',
            title: 'Flat and Graded Washes',
            description: 'The foundation of all watercolor painting',
            order: 1,
            type: 'video',
            duration: '15 min',
            videoUrl: 'https://www.youtube.com/watch?v=RvO0JyXuISM',
            content: 'Learn to create smooth, even washes and beautiful gradients.',
            externalResources: []
          },
          {
            id: 'wc-m2-l2',
            title: 'Wet-on-Wet vs Wet-on-Dry',
            description: 'Two essential techniques every painter must know',
            order: 2,
            type: 'article',
            duration: '10 min read',
            content: `## Two Core Techniques

### Wet-on-Wet
Paint applied to wet paper creates soft, diffused edges.
- **Best for**: Skies, backgrounds, dreamy effects
- **How**: Wet paper with clean water, then apply paint
- **Tip**: Paper should be damp, not pooling

### Wet-on-Dry
Paint applied to dry paper creates sharp, defined edges.
- **Best for**: Details, foreground objects, precise shapes
- **How**: Apply paint directly to dry paper
- **Tip**: Let layers dry completely before adding more

### Combining Both
Most paintings use both techniques! Use wet-on-wet for backgrounds and wet-on-dry for details.`,
            externalResources: []
          },
          {
            id: 'wc-m2-l3',
            title: 'Practice Wash Exercises',
            description: 'Create a page of different washes',
            order: 3,
            type: 'exercise',
            duration: '30 min',
            content: 'Practice creating different types of washes.',
            exerciseInstructions: [
              'Divide your paper into 6 rectangles (2x3 grid)',
              'Rectangle 1: Flat wash with one color',
              'Rectangle 2: Graded wash (dark to light)',
              'Rectangle 3: Wet-on-wet soft edges',
              'Rectangle 4: Wet-on-dry sharp edges',
              'Rectangle 5: Two-color gradient',
              'Rectangle 6: Variegated wash (3+ colors blending)',
              'Let dry and note which techniques you want to practice more'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'wc-m3',
        title: 'Color Mastery',
        description: 'Learn color theory and mixing',
        order: 3,
        icon: '🌈',
        lessons: [
          {
            id: 'wc-m3-l1',
            title: 'Color Theory Basics',
            description: 'Understanding the color wheel',
            order: 1,
            type: 'video',
            duration: '10 min',
            videoUrl: 'https://www.youtube.com/watch?v=Qj1FK8n7WgY',
            content: 'Learn how colors work together and how to mix beautiful combinations.',
            externalResources: []
          },
          {
            id: 'wc-m3-l2',
            title: 'Create Your Color Chart',
            description: 'Document your paint mixtures',
            order: 2,
            type: 'exercise',
            duration: '45 min',
            content: 'Create a reference chart of all your color mixes.',
            exerciseInstructions: [
              'Create a grid with your colors along top and side',
              'Fill each cell with the mix of those two colors',
              'Add water variations (full strength, diluted)',
              'Label each mixture for future reference',
              'Note your favorite combinations'
            ],
            externalResources: []
          },
          {
            id: 'wc-m3-l3',
            title: 'Mixing Neutrals and Earth Tones',
            description: 'Create beautiful natural colors',
            order: 3,
            type: 'article',
            duration: '8 min read',
            content: `## Creating Natural Colors

### Mixing Grays
- Blue + Orange = Warm gray
- Red + Green = Neutral gray
- Yellow + Purple = Cool gray
- Add more of one color to shift the temperature

### Earth Tones
- Yellow + touch of red + touch of blue = Brown
- More yellow = Ochre/Tan
- More red = Burnt sienna
- More blue = Umber

### Pro Tip
Natural scenes rarely use pure colors. Always add a complementary color to "knock back" intensity.`,
            externalResources: []
          }
        ]
      },
      {
        id: 'wc-m4',
        title: 'Your First Painting',
        description: 'Put it all together in a complete project',
        order: 4,
        icon: '🖼️',
        lessons: [
          {
            id: 'wc-m4-l1',
            title: 'Planning Your Painting',
            description: 'Learn to sketch and plan before painting',
            order: 1,
            type: 'article',
            duration: '6 min read',
            content: `## Before You Paint

### Step 1: Choose a Simple Subject
- Single fruit or vegetable
- Simple flower
- Abstract shapes
- Basic landscape silhouette

### Step 2: Light Pencil Sketch
- Use HB pencil very lightly
- Just outlines, no shading
- Can erase if needed

### Step 3: Plan Your Values
- Identify lightest areas (leave white or very light wash)
- Identify darkest areas (apply last)
- Work light to dark

### Step 4: Plan Your Colors
- List 3-5 colors maximum
- Simple is better for beginners`,
            externalResources: []
          },
          {
            id: 'wc-m4-l2',
            title: 'Painting Tutorial: Simple Fruit',
            description: 'Watch a complete painting demonstration',
            order: 2,
            type: 'video',
            duration: '20 min',
            videoUrl: 'https://www.youtube.com/watch?v=3g5pC7HTQeU',
            content: 'Follow along with this beginner-friendly fruit painting tutorial.',
            externalResources: []
          },
          {
            id: 'wc-m4-l3',
            title: 'Complete Your First Painting',
            description: 'Create a finished watercolor piece',
            order: 3,
            type: 'challenge',
            duration: '1-2 hours',
            content: 'Time to create your first complete watercolor painting!',
            challengeGoal: 'Paint a simple fruit, flower, or landscape using all the techniques you\'ve learned. Focus on: proper washes, controlled wet-on-wet/dry, limited color palette, and working light to dark.',
            exerciseInstructions: [
              'Choose your subject (fruit recommended for beginners)',
              'Make a light pencil sketch',
              'Plan your colors (max 4)',
              'Start with a light background wash',
              'Add middle values while slightly damp',
              'Add darkest values and details last',
              'Let dry completely before adding any final touches',
              'Sign your work!'
            ],
            externalResources: []
          }
        ]
      }
    ]
  },

  'acrylic-painting': {
    id: 'lp-acrylic',
    hobbyId: 'acrylic-painting',
    title: 'Acrylic Painting Essentials',
    description: 'Learn to paint with acrylics from scratch. Master techniques from brush strokes to blending, and create vibrant artwork.',
    difficulty: 'beginner',
    estimatedDuration: '4-5 hours',
    totalLessons: 11,
    modules: [
      {
        id: 'ac-m1',
        title: 'Acrylic Basics',
        description: 'Understanding acrylic paints and tools',
        order: 1,
        icon: '🖌️',
        lessons: [
          {
            id: 'ac-m1-l1',
            title: 'Introduction to Acrylics',
            description: 'What makes acrylic paint special',
            order: 1,
            type: 'video',
            duration: '10 min',
            videoUrl: 'https://www.youtube.com/watch?v=oGPCDGwCpFg',
            content: 'Learn the unique properties of acrylic paint and why it\'s great for beginners.',
            externalResources: []
          },
          {
            id: 'ac-m1-l2',
            title: 'Essential Supplies Guide',
            description: 'What you need to start painting',
            order: 2,
            type: 'article',
            duration: '7 min read',
            content: `## Your Acrylic Toolkit

### Paints (Start with 6-8 colors)
- Titanium White (essential!)
- Mars Black
- Cadmium Yellow (or Hansa Yellow)
- Cadmium Red (or Naphthol Red)
- Ultramarine Blue
- Burnt Sienna
- Optional: Phthalo Green, Dioxazine Purple

### Brushes
- Flat brushes: 1/2", 1" for large areas
- Round brushes: #4, #8 for details
- Filbert: for blending

### Surfaces
- Canvas boards (cheapest for practice)
- Stretched canvas
- Canvas paper pads

### Other Essentials
- Palette (stay-wet palette recommended)
- Water container
- Paper towels
- Spray bottle`,
            externalResources: []
          },
          {
            id: 'ac-m1-l3',
            title: 'Set Up Your Painting Station',
            description: 'Prepare your workspace',
            order: 3,
            type: 'exercise',
            duration: '15 min',
            content: 'Organize your painting supplies for efficient workflow.',
            exerciseInstructions: [
              'Arrange your canvas at a comfortable angle',
              'Set up palette to your dominant hand side',
              'Place water container and paper towels nearby',
              'Squeeze colors onto palette in consistent order',
              'Spray palette lightly with water',
              'Test your brushes on scrap paper'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'ac-m2',
        title: 'Fundamental Techniques',
        description: 'Core acrylic painting skills',
        order: 2,
        icon: '🎯',
        lessons: [
          {
            id: 'ac-m2-l1',
            title: 'Brush Strokes and Control',
            description: 'Master different brush techniques',
            order: 1,
            type: 'video',
            duration: '12 min',
            videoUrl: 'https://www.youtube.com/watch?v=K-B39W3ZkGA',
            content: 'Learn essential brush strokes for acrylic painting.',
            externalResources: []
          },
          {
            id: 'ac-m2-l2',
            title: 'Working with Acrylic Drying Time',
            description: 'Techniques for fast-drying paint',
            order: 2,
            type: 'article',
            duration: '6 min read',
            content: `## Managing Acrylic Drying Time

### The Challenge
Acrylics dry in 10-20 minutes, which can make blending difficult.

### Solutions

**Slow it down:**
- Use a spray bottle to mist canvas
- Work in a humid room
- Add slow-dry medium to paint
- Use a stay-wet palette

**Work with it:**
- Work in sections
- Blend quickly after applying
- Use glazing (thin layers) instead
- Layer dry paint for texture

### Layering Advantage
Unlike oils, you can paint over mistakes within minutes!`,
            externalResources: []
          },
          {
            id: 'ac-m2-l3',
            title: 'Blending and Gradient Practice',
            description: 'Create smooth transitions',
            order: 3,
            type: 'exercise',
            duration: '25 min',
            content: 'Practice blending techniques.',
            exerciseInstructions: [
              'Paint a blue square, yellow square side by side',
              'While wet, blend the meeting edge with a clean damp brush',
              'Create a gradient from dark blue to white',
              'Try dry brushing: load brush, wipe off excess, drag lightly',
              'Practice wet-on-wet blending with two colors',
              'Compare results of different techniques'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'ac-m3',
        title: 'Color and Composition',
        description: 'Create harmonious paintings',
        order: 3,
        icon: '🎨',
        lessons: [
          {
            id: 'ac-m3-l1',
            title: 'Color Mixing Fundamentals',
            description: 'Mix any color you need',
            order: 1,
            type: 'video',
            duration: '14 min',
            videoUrl: 'https://www.youtube.com/watch?v=rCoQpuhWnto',
            content: 'Master color mixing with acrylics.',
            externalResources: []
          },
          {
            id: 'ac-m3-l2',
            title: 'Value Studies',
            description: 'Understanding light and dark',
            order: 2,
            type: 'exercise',
            duration: '30 min',
            content: 'Create a value scale and simple study.',
            exerciseInstructions: [
              'Mix 5 values from white to black',
              'Paint a value scale strip (white to black)',
              'Choose a simple object (apple, cup)',
              'Paint it using only your 5 gray values',
              'Focus on where light hits and shadows fall'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'ac-m4',
        title: 'Your First Acrylic Painting',
        description: 'Complete a full painting',
        order: 4,
        icon: '🖼️',
        lessons: [
          {
            id: 'ac-m4-l1',
            title: 'Simple Landscape Tutorial',
            description: 'Paint an easy landscape step by step',
            order: 1,
            type: 'video',
            duration: '25 min',
            videoUrl: 'https://www.youtube.com/watch?v=WT463Xryqck',
            content: 'Follow along to create your first landscape painting.',
            externalResources: []
          },
          {
            id: 'ac-m4-l2',
            title: 'Create Your Landscape',
            description: 'Paint your first complete piece',
            order: 2,
            type: 'challenge',
            duration: '1-2 hours',
            content: 'Create a complete acrylic landscape painting.',
            challengeGoal: 'Paint a simple landscape with sky, distant elements, and foreground. Use layering, blending, and your color mixing skills.',
            exerciseInstructions: [
              'Sketch basic composition lightly in pencil',
              'Block in sky first (work top to bottom)',
              'Add distant mountains/trees while sky is wet for soft edges',
              'Let dry before adding middle ground',
              'Add foreground details last',
              'Include at least 3 planes of depth',
              'Sign your finished painting!'
            ],
            externalResources: []
          }
        ]
      }
    ]
  },

  'pottery-ceramics': {
    id: 'lp-pottery',
    hobbyId: 'pottery-ceramics',
    title: 'Hand-Building Pottery',
    description: 'Learn pottery without a wheel! Master hand-building techniques to create beautiful ceramic pieces using pinch, coil, and slab methods.',
    difficulty: 'beginner',
    estimatedDuration: '5-6 hours',
    totalLessons: 12,
    modules: [
      {
        id: 'pt-m1',
        title: 'Clay Fundamentals',
        description: 'Understanding clay and basic preparation',
        order: 1,
        icon: '🏺',
        lessons: [
          {
            id: 'pt-m1-l1',
            title: 'Introduction to Hand-Building',
            description: 'What you can create without a wheel',
            order: 1,
            type: 'video',
            duration: '10 min',
            videoUrl: 'https://www.youtube.com/watch?v=MaH2s2Hf7tI',
            content: 'Discover the world of hand-built pottery and what you\'ll learn.',
            externalResources: []
          },
          {
            id: 'pt-m1-l2',
            title: 'Types of Clay for Beginners',
            description: 'Choosing the right clay',
            order: 2,
            type: 'article',
            duration: '6 min read',
            content: `## Choosing Your Clay

### Air-Dry Clay (Recommended for Beginners)
- **Pros**: No kiln needed, affordable, available everywhere
- **Cons**: Not waterproof, more fragile
- **Best for**: Decorative items, practicing techniques

### Polymer Clay
- **Pros**: Cures in home oven, many colors
- **Cons**: Smaller scale, different techniques
- **Best for**: Small sculptures, jewelry

### Earthenware/Stoneware
- **Pros**: Professional results, durable, food-safe when glazed
- **Cons**: Needs kiln access
- **Best for**: Functional pottery

### Starting Out
We recommend **air-dry clay** to learn techniques without needing special equipment.`,
            externalResources: []
          },
          {
            id: 'pt-m1-l3',
            title: 'Wedging and Preparing Clay',
            description: 'The essential first step',
            order: 3,
            type: 'exercise',
            duration: '15 min',
            content: 'Practice preparing clay for use.',
            exerciseInstructions: [
              'Take a fist-sized piece of clay',
              'Slam it on your work surface to remove large air bubbles',
              'Push the heel of your palm into the clay, fold over',
              'Rotate 90 degrees and repeat',
              'Continue for 20-30 pushes until smooth',
              'Roll into a ball - your clay is ready!'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'pt-m2',
        title: 'Pinch Pot Technique',
        description: 'The most fundamental building method',
        order: 2,
        icon: '👐',
        lessons: [
          {
            id: 'pt-m2-l1',
            title: 'Making a Pinch Pot',
            description: 'Your first pottery piece',
            order: 1,
            type: 'video',
            duration: '12 min',
            videoUrl: 'https://www.youtube.com/watch?v=qAYKB0dMSao',
            content: 'Learn the classic pinch pot technique step by step.',
            externalResources: []
          },
          {
            id: 'pt-m2-l2',
            title: 'Create Your Pinch Pot',
            description: 'Make a small bowl or cup',
            order: 2,
            type: 'exercise',
            duration: '30 min',
            content: 'Create your first pinch pot.',
            exerciseInstructions: [
              'Roll clay into a smooth ball (tennis ball size)',
              'Push your thumb into the center (not through!)',
              'Pinch between thumb and fingers while rotating',
              'Work from bottom to top, keeping walls even',
              'Aim for pencil-width thickness',
              'Smooth inside and outside with damp fingers',
              'Create a flat bottom by pressing on surface',
              'Let dry slowly (cover loosely with plastic)'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'pt-m3',
        title: 'Coil Building',
        description: 'Build taller forms with coils',
        order: 3,
        icon: '🌀',
        lessons: [
          {
            id: 'pt-m3-l1',
            title: 'Coil Building Basics',
            description: 'Creating and joining coils',
            order: 1,
            type: 'video',
            duration: '15 min',
            videoUrl: 'https://www.youtube.com/watch?v=UNMdC0ToVYQ',
            content: 'Master the coil building technique for larger pieces.',
            externalResources: []
          },
          {
            id: 'pt-m3-l2',
            title: 'Score and Slip Method',
            description: 'The secret to strong joints',
            order: 2,
            type: 'article',
            duration: '5 min read',
            content: `## Score and Slip: The Potter's Glue

### What is It?
- **Score**: Scratching crosshatch marks on clay surfaces
- **Slip**: Liquid clay (clay mixed with water to paste consistency)

### Why It Matters
Clay pieces won't stick together without this method. They'll crack apart as they dry.

### How To Do It
1. Scratch crosshatch lines on BOTH surfaces
2. Apply slip (wet clay paste) to both surfaces
3. Press firmly together
4. Smooth the joint inside and out
5. Support the joint until it sets

### Remember
"If it's not scored and slipped, it's going to slip!"`,
            externalResources: []
          },
          {
            id: 'pt-m3-l3',
            title: 'Build a Coil Pot',
            description: 'Create a taller vessel',
            order: 3,
            type: 'exercise',
            duration: '45 min',
            content: 'Build a pot using the coil method.',
            exerciseInstructions: [
              'Make a flat circular base (palm-sized)',
              'Roll coils (finger thickness, arm length)',
              'Score top edge of base, add slip',
              'Place first coil around edge, press gently',
              'Score top of coil, add slip',
              'Add next coil, slightly overlapping inward or outward to shape',
              'Every 2-3 coils, smooth inside with finger or tool',
              'Continue until desired height',
              'Smooth outside for clean look or leave coils visible'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'pt-m4',
        title: 'Slab Building',
        description: 'Create flat-sided forms',
        order: 4,
        icon: '📦',
        lessons: [
          {
            id: 'pt-m4-l1',
            title: 'Slab Technique Basics',
            description: 'Rolling and using clay slabs',
            order: 1,
            type: 'video',
            duration: '12 min',
            videoUrl: 'https://www.youtube.com/watch?v=rW0J_7mYPpM',
            content: 'Learn to create even slabs and join them into forms.',
            externalResources: []
          },
          {
            id: 'pt-m4-l2',
            title: 'Create a Slab Box',
            description: 'Make a small container',
            order: 2,
            type: 'exercise',
            duration: '45 min',
            content: 'Build a simple box using slabs.',
            exerciseInstructions: [
              'Roll out slab to even thickness (use guides)',
              'Cut a square base',
              'Cut 4 rectangular sides',
              'Let pieces firm up slightly (leather hard)',
              'Score and slip all joining edges',
              'Attach sides to base one at a time',
              'Smooth all interior corners',
              'Smooth or decorate exterior',
              'Optional: Create a lid'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'pt-m5',
        title: 'Finishing Project',
        description: 'Complete a decorative piece',
        order: 5,
        icon: '✨',
        lessons: [
          {
            id: 'pt-m5-l1',
            title: 'Surface Decoration',
            description: 'Textures and patterns',
            order: 1,
            type: 'article',
            duration: '7 min read',
            content: `## Decorating Your Pottery

### Texture Techniques
- **Stamping**: Press objects into clay (buttons, leaves, lace)
- **Carving**: Cut designs with tools or toothpick
- **Adding**: Attach small clay pieces (score and slip!)
- **Slip trailing**: Drizzle liquid clay for raised lines

### Painting (Air-Dry Clay)
- Let clay dry completely (1-2 days)
- Use acrylic paints
- Seal with clear acrylic spray or varnish

### Tips
- Add texture when clay is soft
- Carve when leather-hard
- Paint when bone-dry`,
            externalResources: []
          },
          {
            id: 'pt-m5-l2',
            title: 'Create Your Signature Piece',
            description: 'Combine techniques in a final project',
            order: 2,
            type: 'challenge',
            duration: '1-2 hours',
            content: 'Create a decorated pottery piece using multiple techniques.',
            challengeGoal: 'Create a functional or decorative piece that combines at least 2 hand-building techniques (pinch + coil, or slab + coil, etc.) with surface decoration.',
            exerciseInstructions: [
              'Plan your piece (bowl, vase, container, sculpture)',
              'Sketch your design including decorations',
              'Use at least 2 building techniques',
              'Add texture or carved decoration',
              'Smooth and refine your piece',
              'Let dry slowly under loose plastic',
              'Paint or seal once fully dry',
              'Optional: Add a maker\'s mark to the bottom'
            ],
            externalResources: []
          }
        ]
      }
    ]
  },

  'calligraphy': {
    id: 'lp-calligraphy',
    hobbyId: 'calligraphy',
    title: 'Modern Brush Calligraphy',
    description: 'Learn beautiful brush lettering from scratch. Master basic strokes, letters, and create your first hand-lettered pieces.',
    difficulty: 'beginner',
    estimatedDuration: '3-4 hours',
    totalLessons: 10,
    modules: [
      {
        id: 'cg-m1',
        title: 'Getting Started',
        description: 'Tools and foundational concepts',
        order: 1,
        icon: '✒️',
        lessons: [
          {
            id: 'cg-m1-l1',
            title: 'Introduction to Brush Calligraphy',
            description: 'What is brush lettering and what you\'ll learn',
            order: 1,
            type: 'video',
            duration: '8 min',
            videoUrl: 'https://www.youtube.com/watch?v=sBoVGqiSzr4',
            content: 'An introduction to modern brush calligraphy and the journey ahead.',
            externalResources: []
          },
          {
            id: 'cg-m1-l2',
            title: 'Choosing Your Brush Pen',
            description: 'Finding the right tools',
            order: 2,
            type: 'article',
            duration: '5 min read',
            content: `## Brush Pen Guide for Beginners

### Best for Beginners
- **Tombow Fudenosuke (Hard Tip)** - Easiest to control
- **Pentel Touch Sign Pen** - Good middle ground
- **Tombow Dual Brush** - Large, soft tip

### What to Look For
- Small/firm tip for learning control
- Consistent ink flow
- Comfortable grip

### Paper Matters!
Regular paper will fray brush tips. Use:
- Marker paper
- Rhodia pads
- HP Premium32 (printer paper)
- Canson marker paper

### Pro Tip
Start with the Fudenosuke hard tip - it's the most forgiving for beginners.`,
            externalResources: []
          },
          {
            id: 'cg-m1-l3',
            title: 'Grip and Posture',
            description: 'Set yourself up for success',
            order: 3,
            type: 'exercise',
            duration: '10 min',
            content: 'Practice proper pen grip and positioning.',
            exerciseInstructions: [
              'Hold pen at 45-degree angle to paper',
              'Grip loosely - death grip = shaky lines',
              'Rest hand on pinky side, not wrist',
              'Sit straight, paper at comfortable angle',
              'Move from shoulder/elbow for large strokes',
              'Move from fingers for small details',
              'Draw 10 straight vertical lines focusing on posture'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'cg-m2',
        title: 'Basic Strokes',
        description: 'The building blocks of every letter',
        order: 2,
        icon: '📝',
        lessons: [
          {
            id: 'cg-m2-l1',
            title: 'The 8 Basic Strokes',
            description: 'Master these and you can write any letter',
            order: 1,
            type: 'video',
            duration: '15 min',
            videoUrl: 'https://www.youtube.com/watch?v=O6bqqxAsF_4',
            content: 'Learn the fundamental strokes that form all calligraphy letters.',
            externalResources: []
          },
          {
            id: 'cg-m2-l2',
            title: 'Pressure Control',
            description: 'The secret to thick and thin',
            order: 2,
            type: 'article',
            duration: '4 min read',
            content: `## Mastering Pressure

### The Golden Rule
- **Downstrokes** = Heavy pressure = THICK lines
- **Upstrokes** = Light pressure = thin lines

### Practice Exercise
1. Draw a line pressing hard - notice thickness
2. Draw a line pressing light - notice thinness
3. Start heavy, gradually lighten
4. Start light, gradually press harder

### Common Mistakes
- Pressing too hard on upstrokes
- Inconsistent pressure
- Moving too fast

### Slow Down!
Speed is the enemy of beginners. Practice SLOW.`,
            externalResources: []
          },
          {
            id: 'cg-m2-l3',
            title: 'Stroke Drills',
            description: 'Practice the basics',
            order: 3,
            type: 'exercise',
            duration: '30 min',
            content: 'Fill a page with basic stroke practice.',
            exerciseInstructions: [
              'Full pressure downstrokes (1 row)',
              'Light pressure upstrokes (1 row)',
              'Underturn (down thick, up thin) - 1 row',
              'Overturn (up thin, down thick) - 1 row',
              'Compound curve (underturn + overturn) - 1 row',
              'Ovals (counter-clockwise) - 1 row',
              'Ascending loops - 1 row',
              'Descending loops - 1 row',
              'Take your time - quality over quantity!'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'cg-m3',
        title: 'Lowercase Letters',
        description: 'From strokes to letters',
        order: 3,
        icon: '🔤',
        lessons: [
          {
            id: 'cg-m3-l1',
            title: 'Lowercase Letter Formation',
            description: 'Learn all 26 letters',
            order: 1,
            type: 'video',
            duration: '20 min',
            videoUrl: 'https://www.youtube.com/watch?v=HSnFhD9DMIQ',
            content: 'Step-by-step guide to forming each lowercase letter.',
            externalResources: []
          },
          {
            id: 'cg-m3-l2',
            title: 'Practice Lowercase Letters',
            description: 'Work through the alphabet',
            order: 2,
            type: 'exercise',
            duration: '45 min',
            content: 'Practice writing the lowercase alphabet.',
            exerciseInstructions: [
              'Group 1: a, c, d, g, o, q (oval-based)',
              'Group 2: n, m, h, r, b, p (underturn-based)',
              'Group 3: i, j, l, t (simple strokes)',
              'Group 4: u, y, w, v (underturn variations)',
              'Group 5: e, s, f, k, x, z (unique shapes)',
              'Write each letter 5 times before moving on',
              'Circle your best version of each'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'cg-m4',
        title: 'Words and Projects',
        description: 'Put it all together',
        order: 4,
        icon: '💝',
        lessons: [
          {
            id: 'cg-m4-l1',
            title: 'Connecting Letters',
            description: 'Making words flow',
            order: 1,
            type: 'article',
            duration: '6 min read',
            content: `## Connecting Letters into Words

### Connection Points
Most letters connect at:
- The baseline (bottom)
- Just above baseline

### Tricky Connections
- After: o, r, v, w - lift pen, start next letter at top
- Before: b, o, v, w - end previous letter slightly higher

### Spacing Tips
- Letters should almost touch
- Keep spacing consistent
- Space between words = width of "o"

### Practice Words
Start with: hello, love, dream, hope, smile`,
            externalResources: []
          },
          {
            id: 'cg-m4-l2',
            title: 'Create a Quote',
            description: 'Your first calligraphy project',
            order: 2,
            type: 'challenge',
            duration: '30-45 min',
            content: 'Create a hand-lettered quote.',
            challengeGoal: 'Letter a short inspirational quote (3-6 words) using your brush pen. Focus on consistent letter size, even spacing, and smooth stroke transitions.',
            exerciseInstructions: [
              'Choose a short quote you love',
              'Practice each word separately first',
              'Plan layout on scratch paper',
              'Write final version slowly and deliberately',
              'Try 3 versions, pick your best',
              'Optional: Add simple decorations (flourishes, hearts)',
              'Sign and date your work!'
            ],
            externalResources: [
              { title: 'Quote Ideas for Calligraphy', url: 'https://www.pinterest.com/search/pins/?q=short%20quotes%20for%20calligraphy', type: 'article' }
            ]
          }
        ]
      }
    ]
  },

  'hand-lettering': {
    id: 'lp-handlettering',
    hobbyId: 'hand-lettering',
    title: 'Hand Lettering Fundamentals',
    description: 'Learn to draw beautiful letters with your own unique style. No fancy pens required - just pencils, markers, and creativity!',
    difficulty: 'beginner',
    estimatedDuration: '3-4 hours',
    totalLessons: 10,
    modules: [
      {
        id: 'hl-m1',
        title: 'Lettering Basics',
        description: 'Understanding letters as art',
        order: 1,
        icon: '✏️',
        lessons: [
          {
            id: 'hl-m1-l1',
            title: 'What is Hand Lettering?',
            description: 'The difference between lettering and calligraphy',
            order: 1,
            type: 'video',
            duration: '8 min',
            videoUrl: 'https://www.youtube.com/watch?v=gGQcdIRSjMU',
            content: 'Understanding hand lettering and what makes it unique.',
            externalResources: []
          },
          {
            id: 'hl-m1-l2',
            title: 'Essential Tools',
            description: 'What you need to start',
            order: 2,
            type: 'article',
            duration: '5 min read',
            content: `## Your Lettering Toolkit

### Must-Haves
- **Pencil** (any kind, HB or 2B ideal)
- **Eraser** (kneaded eraser is great)
- **Fine-tip black marker** (Micron 05 or similar)
- **Sketch paper pad**

### Nice to Have
- Brush markers (Tombow Dual Brush)
- Colored markers (Crayola works!)
- Grid paper
- Lightbox or bright window
- Ruler

### The Best Part
You can start with supplies you already own!`,
            externalResources: []
          },
          {
            id: 'hl-m1-l3',
            title: 'Letter Anatomy',
            description: 'Understanding letter structure',
            order: 3,
            type: 'article',
            duration: '6 min read',
            content: `## Anatomy of Letters

### Key Terms
- **Baseline**: Line letters sit on
- **X-height**: Height of lowercase letters (like "x")
- **Cap height**: Top of capital letters
- **Ascender**: Parts that go up (like "l", "h")
- **Descender**: Parts that go down (like "g", "y")

### Why It Matters
Understanding structure helps you:
- Keep letters consistent
- Create pleasing proportions
- Develop your own style

### Practice
Draw guidelines before lettering. Even pros do this!`,
            externalResources: []
          }
        ]
      },
      {
        id: 'hl-m2',
        title: 'Basic Lettering Styles',
        description: 'Learn three foundational styles',
        order: 2,
        icon: '🔡',
        lessons: [
          {
            id: 'hl-m2-l1',
            title: 'Sans Serif Letters',
            description: 'Clean, modern letterforms',
            order: 1,
            type: 'video',
            duration: '12 min',
            videoUrl: 'https://www.youtube.com/watch?v=DCp2k-fqZ1M',
            content: 'Learn to draw clean sans serif letters.',
            externalResources: []
          },
          {
            id: 'hl-m2-l2',
            title: 'Practice Sans Serif',
            description: 'Draw a simple alphabet',
            order: 2,
            type: 'exercise',
            duration: '25 min',
            content: 'Practice drawing sans serif letters.',
            exerciseInstructions: [
              'Draw light guidelines (baseline, x-height, cap height)',
              'Sketch each uppercase letter with pencil',
              'Keep strokes same thickness throughout',
              'Make letters same width (except I, M, W)',
              'Trace over with fine marker',
              'Erase pencil lines when ink is dry'
            ],
            externalResources: []
          },
          {
            id: 'hl-m2-l3',
            title: 'Serif & Script Styles',
            description: 'Adding personality to letters',
            order: 3,
            type: 'video',
            duration: '15 min',
            videoUrl: 'https://www.youtube.com/watch?v=o5cHVx38TpA',
            content: 'Learn serif and script lettering styles.',
            externalResources: []
          }
        ]
      },
      {
        id: 'hl-m3',
        title: 'Adding Style',
        description: 'Make your letters unique',
        order: 3,
        icon: '✨',
        lessons: [
          {
            id: 'hl-m3-l1',
            title: 'Faux Calligraphy',
            description: 'Get the brush pen look with any pen',
            order: 1,
            type: 'article',
            duration: '5 min read',
            content: `## Faux Calligraphy Technique

### What Is It?
A way to create thick/thin letter variation with ANY pen!

### How To Do It
1. Write your word normally
2. Find all the downstrokes
3. Draw a second line next to each downstroke
4. Fill in the space between

### Tips
- Keep added lines on same side (inside of letter)
- Fill solid black or leave white for different looks
- Works with pencil, marker, even ballpoint!

### Practice Words
Try: hello, love, dream`,
            externalResources: []
          },
          {
            id: 'hl-m3-l2',
            title: 'Embellishments',
            description: 'Decorating your letters',
            order: 2,
            type: 'exercise',
            duration: '20 min',
            content: 'Practice adding decorative elements.',
            exerciseInstructions: [
              'Write "HELLO" in block letters',
              'Version 1: Add drop shadow (offset to bottom-right)',
              'Version 2: Add inline (white line inside letters)',
              'Version 3: Add banner behind the word',
              'Version 4: Add flourishes on H and O',
              'Version 5: Add small illustrations around word'
            ],
            externalResources: []
          }
        ]
      },
      {
        id: 'hl-m4',
        title: 'Create Your Art',
        description: 'Complete lettering projects',
        order: 4,
        icon: '🎨',
        lessons: [
          {
            id: 'hl-m4-l1',
            title: 'Layout and Composition',
            description: 'Arranging words beautifully',
            order: 1,
            type: 'video',
            duration: '10 min',
            videoUrl: 'https://www.youtube.com/watch?v=TN0bS0BZmKU',
            content: 'Learn to compose multi-word lettering pieces.',
            externalResources: []
          },
          {
            id: 'hl-m4-l2',
            title: 'Design a Quote Poster',
            description: 'Your final lettering project',
            order: 2,
            type: 'challenge',
            duration: '45-60 min',
            content: 'Create a complete hand-lettered poster.',
            challengeGoal: 'Design a hand-lettered quote using at least 2 different lettering styles. Include at least one embellishment (shadow, banner, flourish, or illustration).',
            exerciseInstructions: [
              'Choose a quote (4-8 words)',
              'Thumbnail sketch 3 different layouts',
              'Pick your favorite and enlarge',
              'Decide which words get which style',
              'Draw guidelines lightly in pencil',
              'Sketch all letters in pencil first',
              'Ink your final design',
              'Add embellishments and decorations',
              'Erase guidelines, add color if desired',
              'Sign your work!'
            ],
            externalResources: []
          }
        ]
      }
    ]
  }
};

/**
 * Get learning path by hobby ID
 */
export function getLearningPath(hobbyId: string): LearningPath | null {
  return (LEARNING_PATHS as Record<string, LearningPath>)[hobbyId] ?? null;
}

/**
 * Get all available learning paths
 */
export function getAllLearningPaths(): LearningPath[] {
  return Object.values(LEARNING_PATHS as Record<string, LearningPath>);
}

/**
 * Get a specific lesson from a learning path
 */
export function getLesson(hobbyId: string, lessonId: string) {
  const path = (LEARNING_PATHS as Record<string, LearningPath>)[hobbyId];
  if (!path) return null;

  for (const module of path.modules) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      return {
        ...lesson,
        moduleName: module.title,
        moduleId: module.id
      };
    }
  }
  return null;
}

/**
 * Get next lesson in sequence
 */
export function getNextLesson(hobbyId: string, currentLessonId: string) {
  const path = (LEARNING_PATHS as Record<string, LearningPath>)[hobbyId];
  if (!path) return null;
  
  let foundCurrent = false;
  for (const module of path.modules) {
    for (const lesson of module.lessons) {
      if (foundCurrent) {
        return { ...lesson, moduleId: module.id, moduleName: module.title };
      }
      if (lesson.id === currentLessonId) {
        foundCurrent = true;
      }
    }
  }
  return null; // No next lesson (course complete)
}

