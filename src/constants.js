// ============================================
// GAME CONSTANTS & CONFIGURATION
// ============================================

const PALETTE = {
  pink: "#FFD1DC",
  green: "#C1E1C1",
  purple: "#B39EB5",
  yellow: "#FDFD96",
  blue: "#AEC6CF",
  text: "#5D5D5D",
};

const GAME_INSTRUCTIONS = {
  GAME_A: {
    title: "How to Play: Kaleido-Pop",
    steps: [
      "1. MEMORIZE the colors of the flower petals.",
      "2. The flower will SPIN to distract you!",
      "3. PAINT the petals back to their original colors.",
      "4. TIP: Focus on the color pattern, not the rotation.",
    ],
    science: "Trains: Visual Binding & Mental Rotation",
  },
  GAME_B: {
    title: "How to Play: Jelly Jams",
    steps: [
      "1. LISTEN and WATCH the Jellies light up.",
      "2. REPEAT the sequence by clicking the Jellies.",
      "3. If Blu turns PURPLE (Dizzy), enter the sequence BACKWARDS!",
      "4. TIP: Say the colors out loud to help remember.",
    ],
    science: "Trains: Auditory Loop & Central Executive",
  },
  GAME_C: {
    title: "How to Play: Tiptoe Trails",
    steps: [
      "1. WATCH the safe path light up on the grid.",
      "2. MEMORIZE the route from Start to Finish.",
      "3. RETRACE the steps by clicking the tiles.",
      "4. TIP: Create a mental map or shape of the path.",
    ],
    science: "Trains: Visuospatial Sketchpad",
  },
};

const DIFFICULTY_CONFIG = {
  JUNIOR: {
    age: 10,
    jellySpeed: 60,
    jellyStartLength: 1,
    jellyTwistChance: 0.2,
    petalSpeed: 0.002,
    minPetals: 5,
    maxPetals: 7,
    tiptoeGrid: 3,
    tiptoeSpeed: 60,
  },
  ADULT: {
    age: 30,
    jellySpeed: 40,
    jellyStartLength: 3,
    jellyTwistChance: 0.4,
    petalSpeed: 0.01,
    minPetals: 5,
    maxPetals: 9,
    tiptoeGrid: 4,
    tiptoeSpeed: 40,
  },
  SENIOR: {
    age: 70,
    jellySpeed: 25,
    jellyStartLength: 4,
    jellyTwistChance: 0.6,
    petalSpeed: 0.02,
    minPetals: 6,
    maxPetals: 11,
    tiptoeGrid: 5,
    tiptoeSpeed: 25,
  },
};

const GAME_STATES = {
  WELCOME: "WELCOME",
  AGE_SELECT: "AGE_SELECT",
  MENU: "MENU",
  GAME_A: "GAME_A",
  GAME_B: "GAME_B",
  GAME_C: "GAME_C",
  RESULTS: "RESULTS",
};

const IDLE_TIME_LIMIT = 30000; // 30 seconds
