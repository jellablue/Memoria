class UIManager {
  constructor() {
    this.particleSystem = new ParticleSystem();
    this.screens = {
      welcome: new WelcomeScreen(),
      ageSelect: new AgeSelectionScreen(),
      menu: new MenuScreen(),
      gameA: new GameScreen(GAME_STATES.GAME_A),
      gameB: new GameScreen(GAME_STATES.GAME_B),
      gameC: new GameScreen(GAME_STATES.GAME_C),
      profile: new ProfileScreen(),
    };

    this.currentScreen     = this.screens.welcome;
    this.currentScreenType = GAME_STATES.WELCOME;

    this.cloudTransition   = null;
    this._transitioning    = false;
  }

  _shouldTransitionTo(targetScreen) {
    return (
      targetScreen === GAME_STATES.MENU   ||
      targetScreen === GAME_STATES.GAME_A ||
      targetScreen === GAME_STATES.GAME_B ||
      targetScreen === GAME_STATES.GAME_C
    );
  }

  startTransition(targetScreen) {
    if (this._transitioning) return;
    this._transitioning = true;

    this.cloudTransition = new CloudTransition(() => {
      gameState.setScreen(targetScreen);
      this._syncCurrentScreen(targetScreen);
      this._transitioning = false;
    });
  }

  draw() {

    this.updateCurrentScreen();
    if (this.currentScreenType !== GAME_STATES.GAME_A &&
        this.currentScreenType !== GAME_STATES.GAME_B &&
        this.currentScreenType !== GAME_STATES.GAME_C) {
      this.particleSystem.update();
      this.particleSystem.draw();
    }

    this.currentScreen.draw();

    if (this.cloudTransition) {
      this.cloudTransition.draw();
      if (!this.cloudTransition.isActive()) {
        this.cloudTransition = null;
      }
    }
  }

  handleClick() {
    if (this._transitioning || (this.cloudTransition && this.cloudTransition.isActive())) {
      return;
    }

    this.updateCurrentScreen();

    if (this.currentScreen && this.currentScreen.handleClick) {
      this.currentScreen.handleClick();
    }
  }

  handleKeyPress(keyCode) {
    if (this._transitioning) return;
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
    if (this.cloudTransition) {
      this.cloudTransition._buildClouds();
    }
  }

  requestTransition(targetScreen) {
    if (this._shouldTransitionTo(targetScreen)) {
      this.startTransition(targetScreen);
    } else {
      gameState.setScreen(targetScreen);
      this.updateCurrentScreen();
    }
  }

  _syncCurrentScreen(screen) {
    if (screen === GAME_STATES.WELCOME) {
      this.currentScreen = this.screens.welcome;
    } else if (screen === GAME_STATES.AGE_SELECT) {
      this.currentScreen = this.screens.ageSelect;
    } else if (screen === GAME_STATES.MENU) {
      this.currentScreen = this.screens.menu;
    } else if (screen === GAME_STATES.GAME_A) {
      if (this.screens.gameA.prepareForEntry) this.screens.gameA.prepareForEntry();
      this.currentScreen = this.screens.gameA;
    } else if (screen === GAME_STATES.GAME_B) {
      if (this.screens.gameB.prepareForEntry) this.screens.gameB.prepareForEntry();
      this.currentScreen = this.screens.gameB;
    } else if (screen === GAME_STATES.GAME_C) {
      if (this.screens.gameC.prepareForEntry) this.screens.gameC.prepareForEntry();
      this.currentScreen = this.screens.gameC;
    } else if (screen === GAME_STATES.RESULTS) {
      this.screens.profile.resetAnim();
      this.currentScreen = this.screens.profile;
    }
    this.currentScreenType = screen;
  }

  updateCurrentScreen() {
    const screen = gameState.getScreen();
    if (screen === this.currentScreenType) return;
    this._syncCurrentScreen(screen);
  }

  resetIdleScreen() {
  }

  handleScroll(delta) {
    if (this._transitioning || (this.cloudTransition && this.cloudTransition.isActive())) {
      return;
    }

    if (this.currentScreen && this.currentScreen.handleScroll) {
      this.currentScreen.handleScroll(delta);
    }
  }
}

let uiManager;
