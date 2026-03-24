
class AudioManager {
  constructor() {
    this.bgMusic = null;
    this.petalSound = null;
    this.cloudSound = null;
    this.bgmEnabled = true;
    this.sfxEnabled = true;
    this.bgmVolume = 0.45;
    this.sfxVolume = 0.8;
  }

  preload() {
    if (typeof loadSound !== "undefined") {
      try {
        this.bgMusic = loadSound("assets/bg-music.mp3");
        this.petalSound = loadSound("assets/petal-click.mp3");
        this.cloudSound = loadSound("assets/cloud-transition.mp3");
      } catch (e) {
        console.warn("Audio files not found:", e);
      }
    }
  }

  playBackgroundMusic() {
    if (!this.bgMusic || !this.bgmEnabled) return;
    this.bgMusic.setVolume(this.bgmVolume);
    if (!this.bgMusic.isPlaying()) {
      this.bgMusic.loop();
    }
  }

  stopBackgroundMusic() {
    if (this.bgMusic && this.bgMusic.isPlaying()) {
      this.bgMusic.stop();
    }
  }

  playSound(soundName) {
    if (!this.sfxEnabled) return;

    switch (soundName) {
      case "petal":
        if (this.petalSound) {
          this.petalSound.setVolume(this.sfxVolume);
          this.petalSound.play();
        }
        break;
      case "cloud": 
        if (this.cloudSound) {
          this.cloudSound.setVolume(this.sfxVolume);
          this.cloudSound.play();
        }
        break;
    }
  }

  toggleAudio() {
    const next = !(this.bgmEnabled && this.sfxEnabled);
    this.setBgmEnabled(next);
    this.setSfxEnabled(next);
  }

  setBgmEnabled(enabled) {
    this.bgmEnabled = !!enabled;
    if (!this.bgmEnabled) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = !!enabled;
  }

  setBgmVolume(volume) {
    this.bgmVolume = constrain(volume, 0, 1);
    if (this.bgMusic) {
      this.bgMusic.setVolume(this.bgmVolume);
    }
  }

  setSfxVolume(volume) {
    this.sfxVolume = constrain(volume, 0, 1);
  }

  getSettings() {
    return {
      bgmEnabled: this.bgmEnabled,
      sfxEnabled: this.sfxEnabled,
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume,
    };
  }
}

let audioManager = new AudioManager();
