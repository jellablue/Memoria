// ============================================
// CENTRALIZED GAME STATE MANAGER
// ============================================

class GameState {
  constructor() {
    this.currentScreen = GAME_STATES.WELCOME;
    this.userAge = 8;
    this.difficultyParams = {};
    
    this.cognitiveProfile = {
      visualScore: 0,
      auditoryScore: 0,
      spatialScore: 0,
      gamesPlayed: 0,
    };

    this.games = {
      kaleido: null,
      jelly: null,
      tiptoe: null,
    };

    this.showInstructions = false;
    this.currentInstructionKey = "";
    this.lastActivityTime = 0;
    this.isIdle = false;
  }

  // Set age group and difficulty
  setAgeGroup(ageCategory) {
    const config = DIFFICULTY_CONFIG[ageCategory];
    this.userAge = config.age;
    this.difficultyParams = { ...config };
    return this.difficultyParams;
  }

  // Navigation
  setScreen(screenName) {
    this.currentScreen = screenName;
  }

  getScreen() {
    return this.currentScreen;
  }

  // Instruction overlay
  showGameInstructions(gameKey) {
    this.showInstructions = true;
    this.currentInstructionKey = gameKey;
  }

  hideGameInstructions() {
    this.showInstructions = false;
  }

  // Idle detection
  recordActivity() {
    this.lastActivityTime = millis();
    this.isIdle = false;
  }

  checkIdle() {
    if (millis() - this.lastActivityTime > IDLE_TIME_LIMIT) {
      this.isIdle = true;
    }
  }

  // Cognitive profile updates
  updateCognitiveScore(gameType, score) {
    if (gameType === "GAME_A") this.cognitiveProfile.visualScore += score;
    if (gameType === "GAME_B") this.cognitiveProfile.auditoryScore += score;
    if (gameType === "GAME_C") this.cognitiveProfile.spatialScore += score;
    this.cognitiveProfile.gamesPlayed++;
  }

  // Game instances
  setGameInstance(gameType, gameInstance) {
    if (gameType === "GAME_A") this.games.kaleido = gameInstance;
    if (gameType === "GAME_B") this.games.jelly = gameInstance;
    if (gameType === "GAME_C") this.games.tiptoe = gameInstance;
  }

  getGameInstance(gameType) {
    if (gameType === "GAME_A") return this.games.kaleido;
    if (gameType === "GAME_B") return this.games.jelly;
    if (gameType === "GAME_C") return this.games.tiptoe;
    return null;
  }

  // Reset all games
  initializeGames() {
    this.games.kaleido = new KaleidoPop(this.difficultyParams);
    this.games.jelly = new JellyJams(this.difficultyParams);
    this.games.tiptoe = new TiptoeTrails(this.difficultyParams);
  }

  reset() {
    this.currentScreen = GAME_STATES.WELCOME;
    this.showInstructions = false;
    this.currentInstructionKey = "";
  }
}

// Global instance
let gameState = new GameState();
