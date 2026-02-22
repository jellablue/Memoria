// ============================================
// UI MANAGER (Screen Router & Coordinator)
// ============================================

class UIManager {
  constructor() {
    this.particleSystem = new ParticleSystem();
    this.screens = {
      welcome: new WelcomeScreen(),
      ageSelect: new AgeSelectionScreen(),
      menu: new MenuScreen(),
      gameA: null,
      gameB: null,
      gameC: null,
      profile: new ProfileScreen(),
    };

    this.currentScreen = this.screens.welcome;
    this.currentScreenType = GAME_STATES.WELCOME;
  }

  draw() {
    // Draw background and particles for non-game screens
    if (this.currentScreenType !== GAME_STATES.GAME_A &&
        this.currentScreenType !== GAME_STATES.GAME_B &&
        this.currentScreenType !== GAME_STATES.GAME_C) {
      this.particleSystem.update();
      this.particleSystem.draw();
    }

    // Draw current screen
    this.currentScreen.draw();
  }

  handleClick() {
    // Update current screen based on gameState
    this.updateCurrentScreen();

    // Handle click on current screen
    if (this.currentScreen && this.currentScreen.handleClick) {
      this.currentScreen.handleClick();
    }
  }

  handleKeyPress(keyCode) {
    if (
      this.currentScreen &&
      this.currentScreen.handleKeyPress
    ) {
      this.currentScreen.handleKeyPress(keyCode);
    }
  }

  handleWindowResize() {
    if (
      this.currentScreen &&
      this.currentScreen.windowResized
    ) {
      this.currentScreen.windowResized();
    }
    this.particleSystem = new ParticleSystem();
  }

  updateCurrentScreen() {
    const screen = gameState.getScreen();

    if (screen === GAME_STATES.WELCOME) {
      this.currentScreen = this.screens.welcome;
    } else if (screen === GAME_STATES.AGE_SELECT) {
      this.currentScreen = this.screens.ageSelect;
    } else if (screen === GAME_STATES.MENU) {
      this.currentScreen = this.screens.menu;
    } else if (screen === GAME_STATES.GAME_A) {
      if (!this.screens.gameA) {
        this.screens.gameA = new GameScreen(GAME_STATES.GAME_A);
      }
      this.currentScreen = this.screens.gameA;
    } else if (screen === GAME_STATES.GAME_B) {
      if (!this.screens.gameB) {
        this.screens.gameB = new GameScreen(GAME_STATES.GAME_B);
      }
      this.currentScreen = this.screens.gameB;
    } else if (screen === GAME_STATES.GAME_C) {
      if (!this.screens.gameC) {
        this.screens.gameC = new GameScreen(GAME_STATES.GAME_C);
      }
      this.currentScreen = this.screens.gameC;
    } else if (screen === GAME_STATES.RESULTS) {
      this.currentScreen = this.screens.profile;
    }

    this.currentScreenType = screen;
  }

  resetIdleScreen() {
    // Could add idle screen logic here if needed
  }
}

// Note: Global instance created in setup() to avoid p5.js function call timing issues
let uiManager;
