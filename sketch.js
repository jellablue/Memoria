function preload() {
  audioManager.preload();
}

function setup() {
  console.log("Memoria Setup Started");
  createCanvas(windowWidth, windowHeight);
  textFont("Fredoka");
  textAlign(CENTER, CENTER);
  uiManager = new UIManager();
  
  gameState.recordActivity();
  console.log("Setup Complete");
}

function draw() {
  // Check for idle state
  gameState.checkIdle();
  if (gameState.isIdle) {
    drawIdleScreen();
    return;
  }

  // Update UI manager with current screen and draw
  uiManager.updateCurrentScreen();
  uiManager.draw();
}

function mouseClicked() {
  gameState.recordActivity();
  uiManager.handleClick();
  return false;
}

function keyPressed() {
  gameState.recordActivity();
  
  if (keyCode === ENTER) {
    uiManager.handleKeyPress(keyCode);
  }
  
  return false;
}

function mouseMoved() {
  gameState.recordActivity();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  uiManager.handleWindowResize();
}

function drawIdleScreen() {
  background(0, 100);
  fill(255);
  textSize(48);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("Are you there?", width / 2, height / 2 - 60);
  
  textSize(24);
  textStyle(NORMAL);
  text("Click anywhere to continue", width / 2, height / 2 + 60);
}
