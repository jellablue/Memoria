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

    // Cloud transition state
    this.cloudTransition   = null;
    this._transitioning    = false;
  }

  // Screens that should trigger a cloud transition when navigated TO
  _shouldTransitionTo(targetScreen) {
    return (
      targetScreen === GAME_STATES.MENU   ||
      targetScreen === GAME_STATES.GAME_A ||
      targetScreen === GAME_STATES.GAME_B ||
      targetScreen === GAME_STATES.GAME_C
    );
  }

  // Start a cloud transition that swaps to `targetScreen` once clouds cover the canvas
  startTransition(targetScreen) {
    if (this._transitioning) return;
    this._transitioning = true;

    this.cloudTransition = new CloudTransition(() => {
      // Clouds have fully covered the screen – now switch
      gameState.setScreen(targetScreen);
      this._syncCurrentScreen(targetScreen);
      this._transitioning = false;
    });
  }

  draw() {

    this.updateCurrentScreen();
    // Draw background and particles for non-game screens
    if (this.currentScreenType !== GAME_STATES.GAME_A &&
        this.currentScreenType !== GAME_STATES.GAME_B &&
        this.currentScreenType !== GAME_STATES.GAME_C) {
      this.particleSystem.update();
      this.particleSystem.draw();
    }

    // Draw the current screen
    this.currentScreen.draw();

    // Draw cloud transition on top (if active)
    if (this.cloudTransition) {
      this.cloudTransition.draw();
      if (!this.cloudTransition.isActive()) {
        this.cloudTransition = null;
      }
    }
  }

  handleClick() {
    // Block all clicks while a transition is animating
    if (this._transitioning || (this.cloudTransition && this.cloudTransition.isActive())) {
      return;
    }

    // Update current screen based on gameState (for non-transition navigations)
    this.updateCurrentScreen();

    // Handle click on current screen
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
    // Rebuild transition clouds to match new canvas size
    if (this.cloudTransition) {
      this.cloudTransition._buildClouds();
    }
  }

  // Called by AgeSelectionScreen / MenuScreen (via intercepted gameState.setScreen)
  // to request a transition instead of an instant swap.
  requestTransition(targetScreen) {
    if (this._shouldTransitionTo(targetScreen)) {
      // Don't let gameState.setScreen take effect yet; we'll do it inside startTransition callback
      this.startTransition(targetScreen);
    } else {
      gameState.setScreen(targetScreen);
      this.updateCurrentScreen();
    }
  }

  // Internal: sync this.currentScreen to a given screen key without triggering transition
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
      this.screens.profile.resetAnim();   // re-play draw-on animation
      this.currentScreen = this.screens.profile;
    }
    this.currentScreenType = screen;
  }

  updateCurrentScreen() {
    const screen = gameState.getScreen();
    // Avoid rebuilding screens every frame; preserve transient UI state like SummaryCard.
    if (screen === this.currentScreenType) return;
    this._syncCurrentScreen(screen);
  }

  resetIdleScreen() {
    // Could add idle screen logic here if needed
  }

  handleScroll(delta) {
    // Block scrolling if a transition is happening
    if (this._transitioning || (this.cloudTransition && this.cloudTransition.isActive())) {
      return;
    }

    // Route the scroll event to the current screen if it supports it
    if (this.currentScreen && this.currentScreen.handleScroll) {
      this.currentScreen.handleScroll(delta);
    }
  }
}

// Note: Global instance created in setup() to avoid p5.js function call timing issues
let uiManager;
