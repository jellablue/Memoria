let currentGame;
let state = "GAME_A";

function setup() {
  console.log("Setup started");
  createCanvas(windowWidth, windowHeight);
  currentGame = new KaleidoPop();
  console.log("Game created");
}

function draw() {
  background("#E6F0FF");
  if (state === "GAME_A") {
    currentGame.draw();
  }
}

function mousePressed () {
    if (state === "GAME_A") {
        if (currentGame.gameState === "INPUT") {
            let startX = width/2 - 100;
            for (let i=0; i<currentGame.palette.length; i++) {
                let btnX = startX + i*60;
                let btnY = height - 50;

                if (dist(mouseX, mouseY, btnX, btnY) < 20) {
                    currentGame.selectedBrushColor = currentGame.palette[i];
                    return;
                }
            }
        }

        currentGame.checkClick();
    }
}

function keyPressed() {
   if (keyCode === ENTER && currentGame.gameState === "INPUT") {
      currentGame.gameState = "RESULT";
   }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


