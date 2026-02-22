// ============================================
// AUDIO MANAGER
// ============================================

class AudioManager {
  constructor() {
    this.bgMusic = null;
    this.petalSound = null;
    this.enabled = true;
  }

  preload() {
    if (typeof loadSound !== "undefined") {
      try {
        this.bgMusic = loadSound("assets/bg-music.mp3");
        this.petalSound = loadSound("assets/petal-click.mp3");
      } catch (e) {
        console.warn("Audio files not found:", e);
      }
    }
  }

  playBackgroundMusic() {
    if (this.bgMusic && this.enabled) {
      this.bgMusic.loop();
    }
  }

  stopBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.stop();
    }
  }

  playSound(soundName) {
    if (!this.enabled) return;

    switch (soundName) {
      case "petal":
        if (this.petalSound) this.petalSound.play();
        break;
      // Add more sounds as needed
    }
  }

  toggleAudio() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
  }
}

// Global instance
let audioManager = new AudioManager();
