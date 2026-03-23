
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

  setAgeGroup(ageCategory) {
    const config = DIFFICULTY_CONFIG[ageCategory];
    this.userAge = config.age;
    this.difficultyParams = { ...config };
    return this.difficultyParams;
  }

  setScreen(screenName) {
    this.currentScreen = screenName;
  }

  getScreen() {
    return this.currentScreen;
  }

  showGameInstructions(gameKey) {
    this.showInstructions = true;
    this.currentInstructionKey = gameKey;
  }

  hideGameInstructions() {
    this.showInstructions = false;
  }

  recordActivity() {
    this.lastActivityTime = millis();
    this.isIdle = false;
  }

  checkIdle() {
    if (millis() - this.lastActivityTime > IDLE_TIME_LIMIT) {
      this.isIdle = true;
    }
  }

  updateCognitiveScore(gameType, score) {
    if (gameType === "GAME_A") this.cognitiveProfile.visualScore += score;
    if (gameType === "GAME_B") this.cognitiveProfile.auditoryScore += score;
    if (gameType === "GAME_C") this.cognitiveProfile.spatialScore += score;
    this.cognitiveProfile.gamesPlayed++;
  }

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

let gameState = new GameState();
