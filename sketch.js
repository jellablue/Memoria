const PALETTE = {
  pink: "#FFD1DC",
  green: "#C1E1C1",
  purple: "#B39EB5",
  yellow: "#FDFD96",
  blue: "#AEC6CF",
  text: "#5D5D5D",
};

let gameKaleidoPop;
let gameJellyJams;

let state = "MENU";
let menuButtons = [];

let userAge = 8;
let difficultyParams = {};

//let jellySound;
let bgMusic;
let petalSound;

function setup() {
  console.log("Setup started");

  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  updateDifficultyParams();

  gameKaleidoPop = new KaleidoPop();
  gameJellyJams = new JellyJams();

  let btnW = 220;
  let btnH = 60;
  let startY = height / 2;

  // if (state === "MENU") {
  //   bgMusic.loop()
  // }

  menuButtons.push(
    new MenuButton(
      width / 2,
      startY + 50,
      btnW,
      btnH,
      "Kaleido-Pop",
      PALETTE.pink,
      "GAME_A",
    ),
  );
  menuButtons.push(
    new MenuButton(
      width / 2,
      startY + 130,
      btnW,
      btnH,
      "Jelly Jams",
      PALETTE.blue,
      "GAME_B",
    ),
  );
  menuButtons.push(
    new MenuButton(
      width / 2,
      startY + 210,
      btnW,
      btnH,
      "Tiptoe Trails",
      PALETTE.green,
      "LOCKED",
    ),
  );

  console.log("Game and Menu created");
}

function draw() {
  if (state === "MENU") {
    drawMenu();
  } else if (state === "GAME_A") {
    background("#E6F0FF");
    gameKaleidoPop.draw(); // Explicitly draw Game A
    drawBackButton();
  } else if (state === "GAME_B") {
    background("#FFF5E6");
    gameJellyJams.draw(); // Explicitly draw Game B
    drawBackButton();
  }
}

function mouseClicked() {
  
  if (state === "MENU") {
    if (
      mouseX > width / 2 - 110 &&
      mouseX < width / 2 - 30 &&
      mouseY > height / 2 + 10 &&
      mouseY < height / 2 + 40
    ) {
      if (userAge > 5) userAge--;
      updateDifficultyParams();
    } else if (
      mouseX > width / 2 + 80 &&
      mouseX < width / 2 + 110 &&
      mouseY > height / 2 + 10 &&
      mouseY < height / 2 + 40
    ) {
      if (userAge < 90) userAge++;
      updateDifficultyParams(); // Recalculate difficulty!
    }
    for (let btn of menuButtons) {
      if (btn.isClicked()) {
        if (btn.action === "GAME_A") {
          state = "GAME_A";
        } else if (btn.action === "GAME_B") {
          state = "GAME_B";
          // Optional: gameJellyJams.reset(); // If you implement a reset function later
        } else if (btn.action === "LOCKED") {
          console.log("This game is coming soon!");
        }
      }
    }
  } else if (state === "GAME_A") {
    if (mouseX < 80 && mouseY < 40) {
      state = "MENU";
      return;
    }
    if (gameKaleidoPop.gameState === "INPUT") {
      let startX = width / 2 - 100;
      for (let i = 0; i < gameKaleidoPop.palette.length; i++) {
        let btnX = startX + i * 60;
        let btnY = height - 50;

        if (dist(mouseX, mouseY, btnX, btnY) < 20) {
          gameKaleidoPop.selectedBrushColor = gameKaleidoPop.palette[i];
          return;
        }
      }
    }
    gameKaleidoPop.checkClick();
    gameKaleidoPop.checkNextLevelButton();
  } else if (state === "GAME_B") {
    if (mouseX < 80 && mouseY < 40) {
      state = "MENU";
      return;
    }
    gameJellyJams.checkClick();
  }
}

function keyPressed() {
  if (
    keyCode === ENTER &&
    state === "GAME_A" &&
    gameKaleidoPop.gameState === "INPUT"
  ) {
    gameKaleidoPop.submitAnswer();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  let startY = height / 2;
  for (let i = 0; i < menuButtons.length; i++) {
    menuButtons[i].x = width / 2 - menuButtons[i].w / 2;
    menuButtons[i].y = startY + i * 80;
  }
}

function drawMenu() {
  background(255);

  fill(PALETTE.text);
  textSize(32);
  textStyle(BOLD);
  text("Memoria:", width / 2, height / 2 - 120);

  textSize(60);
  fill(PALETTE.purple);
  text("Blu's Wonderland", width / 2, height / 2 - 60);

  fill(PALETTE.text);
  textSize(18);
  text("Player Age: " + userAge, width / 2, height / 2 + 20);

  // Draw simple +/- buttons (Visuals only, logic in mousePressed)
  fill(200);
  rect(width / 2 - 110, height / 2 + 10, 30, 30, 5); // Minus
  rect(width / 2 + 80, height / 2 + 10, 30, 30, 5); // Plus
  fill(0);
  text("-", width / 2 - 95, height / 2 + 25);
  text("+", width / 2 + 95, height / 2 + 25);

  for (let btn of menuButtons) {
    btn.display();
  }
}

function drawBackButton() {
  push();
  fill(255);
  stroke(200);
  strokeWeight(1);
  rect(10, 10, 60, 30, 5);
  fill(100);
  noStroke();
  textSize(12);
  textStyle(NORMAL);
  text("MENU", 40, 25);
  pop();
}

function updateDifficultyParams() {
  if (userAge < 13) {
    difficultyParams = {
      jellySpeed: 60,
      jellyStartLength: 1,
      jellyTwistChance: 0.2,
      petalSpeed: 0.002,
      minPetals: 5,
      maxPetals: 7,
    };
  } else if (userAge < 60) {
    difficultyParams = {
      jellySpeed: 40,
      jellyStartLength: 3,
      jellyTwistChance: 0.4,
      petalSpeed: 0.01,
      minPetals: 5,
      maxPetals: 9,
    };
  } else {
    difficultyParams = {
      jellySpeed: 25,
      jellyStartLength: 4,
      jellyTwistChance: 0.6,
      petalSpeed: 0.02,
      minPetals: 6,
      maxPetals: 11,
    };
  }
  console.log("Difficulty Updated for Age " + userAge, difficultyParams);
}

function preload() {
  //jellySound = loadSound('assets/jelly-click.mp3');
  bgMusic = loadSound("assets/bg-music.mp3");
  petalSound = loadSound("assets/petal-click.mp3")
}

class MenuButton {
  constructor(x, y, w, h, label, col, action) {
    this.x = x - w / 2;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.col = col;
    this.action = action;
  }

  display() {
    fill(220);
    noStroke();
    rect(this.x + 4, this.y + 4, this.w, this.h, 15); // Shadow

    if (this.action === "LOCKED") fill(230);
    else if (this.isHovering())
      fill(lerpColor(color(this.col), color(255), 0.2));
    else fill(this.col);

    rect(this.x, this.y, this.w, this.h, 15); // Body

    fill(PALETTE.text);
    textSize(20);
    textStyle(BOLD);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2 + 2); // Text
  }

  isHovering() {
    return (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    );
  }

  isClicked() {
    return this.isHovering();
  }
}
