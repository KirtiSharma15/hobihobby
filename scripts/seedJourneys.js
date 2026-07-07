const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const templates = [
  {
    id: 'photography',
    data: {
      hobbyId: 'photography',
      hobbyName: 'Photography',
      totalDays: 365,
      days: [
        {
          day: 1,
          title: 'Your first shot',
          description: 'Take 10 photos of things around your home. Focus on finding interesting angles.',
          duration: '15 min',
          type: 'practice',
          tip: "Don't worry about quality — just shoot freely",
        },
        {
          day: 2,
          title: 'Understanding light',
          description: 'Take the same photo at 3 different times of day. Compare the results.',
          duration: '20 min',
          type: 'watch + practice',
          tip: 'Golden hour gives the best natural light',
        },
        {
          day: 3,
          title: 'The rule of thirds',
          description: 'Enable the grid on your camera. Take 5 photos placing your subject on a grid line.',
          duration: '20 min',
          type: 'practice',
          tip: 'Subjects on grid intersections look more balanced than centred subjects',
        },
        {
          day: 4,
          title: 'Shoot in manual mode',
          description: 'Switch to manual mode. Experiment with ISO, aperture, and shutter speed.',
          duration: '30 min',
          type: 'practice',
          tip: 'Start with ISO 100, f/8, 1/125s as a baseline',
        },
        {
          day: 5,
          title: 'Your first edit',
          description: 'Pick your best photo from this week. Edit it using Lightroom Mobile (free).',
          duration: '20 min',
          type: 'practice',
          tip: 'Adjust exposure first, then contrast, then colour temperature',
        },
        {
          day: 6,
          title: 'Street photography',
          description: 'Go outside and take 20 candid shots of your neighbourhood.',
          duration: '45 min',
          type: 'outdoor practice',
          tip: 'Use burst mode to capture movement',
        },
        {
          day: 7,
          title: 'Week 1 review',
          description: 'Pick your 3 favourite shots from this week. Write one sentence about what you like about each.',
          duration: '15 min',
          type: 'reflect',
          tip: 'Reflection is how you train your eye faster',
        },
      ],
    },
  },
  {
    id: 'painting',
    data: {
      hobbyId: 'painting',
      hobbyName: 'Painting',
      totalDays: 365,
      days: [
        {
          day: 1,
          title: 'Colour mixing basics',
          description: 'Mix primary colours to create secondary colours. Fill a page with colour swatches.',
          duration: '20 min',
          type: 'practice',
          tip: 'Always add dark to light, never light to dark',
        },
        {
          day: 2,
          title: 'Simple shapes',
          description: 'Paint 5 simple objects: apple, cup, book, ball, leaf. Focus on shape not detail.',
          duration: '30 min',
          type: 'practice',
          tip: 'Squint at your subject — this helps you see shapes instead of details',
        },
        {
          day: 3,
          title: 'Light and shadow',
          description: 'Paint a single object with a clear light source. Add a highlight and a shadow.',
          duration: '30 min',
          type: 'practice',
          tip: 'The shadow is never just black — add a complementary colour',
        },
        {
          day: 4,
          title: 'Colour harmony',
          description: 'Paint a small scene using only 3 colours + white.',
          duration: '25 min',
          type: 'practice',
          tip: 'Limiting colours forces you to mix creatively',
        },
        {
          day: 5,
          title: 'Texture experiment',
          description: 'Try 4 different brush techniques: stippling, cross-hatching, wet-on-wet, dry brush.',
          duration: '20 min',
          type: 'experiment',
          tip: 'Load less paint than you think you need',
        },
        {
          day: 6,
          title: 'Paint from a photo',
          description: 'Choose a simple landscape photo and paint it loosely. Aim for mood, not accuracy.',
          duration: '45 min',
          type: 'practice',
          tip: 'Simplify — paint 3 layers: background, midground, foreground',
        },
        {
          day: 7,
          title: 'Week 1 review',
          description: 'Line up all your paintings from this week. Pick one to photograph and save.',
          duration: '15 min',
          type: 'reflect',
          tip: 'Progress feels slow day to day but dramatic week to week',
        },
      ],
    },
  },
  {
    id: 'pottery',
    data: {
      hobbyId: 'pottery',
      hobbyName: 'Pottery',
      totalDays: 365,
      days: [
        {
          day: 1,
          title: 'Centre your first ball of clay',
          description: 'Wedge your clay to remove air bubbles. Try centring a small ball on the wheel.',
          duration: '30 min',
          type: 'watch + try',
          tip: 'Keep your elbows anchored to your body for more control',
        },
        {
          day: 2,
          title: 'Pinch pot fundamentals',
          description: 'Make 3 pinch pots. Focus on even wall thickness throughout.',
          duration: '30 min',
          type: 'practice',
          tip: 'Rotate the clay as you pinch — never stay in one spot',
        },
        {
          day: 3,
          title: 'Shape your first bowl',
          description: 'Using the wheel, open the clay and pull up the walls to form a bowl shape.',
          duration: '45 min',
          type: 'practice',
          tip: 'Wet hands reduce friction but too much water weakens the clay',
        },
        {
          day: 4,
          title: 'Trimming and finishing',
          description: "Trim the base of yesterday's bowl. Add a foot ring if clay is leather-hard.",
          duration: '30 min',
          type: 'practice',
          tip: 'Trim when clay is leather-hard — not too wet, not too dry',
        },
        {
          day: 5,
          title: 'Hand building a mug',
          description: 'Roll a slab, form a cylinder, attach a pulled handle. Your first mug!',
          duration: '45 min',
          type: 'project',
          tip: 'Score and slip all joints — this prevents cracking during drying',
        },
        {
          day: 6,
          title: 'Surface decoration',
          description: 'Try 3 surface techniques: stamping, carving, and slip trailing on test tiles.',
          duration: '30 min',
          type: 'experiment',
          tip: 'Decorate at leather-hard stage for best results',
        },
        {
          day: 7,
          title: 'Week 1 review',
          description: 'Photograph all your pieces from this week. Note what you want to improve.',
          duration: '15 min',
          type: 'reflect',
          tip: 'Even professional potters throw away most of their first pieces — normal',
        },
      ],
    },
  },
];

async function seed() {
  console.log('Seeding journey templates...');
  for (const template of templates) {
    await db
      .collection('journeyTemplates')
      .doc(template.id)
      .set(template.data);
    console.log(`✅ Seeded: ${template.id}`);
  }
  console.log('Done!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});