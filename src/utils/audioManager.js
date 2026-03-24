class AudioManager {
  constructor() {
    this.bgmTracks = {}; 
    this.currentTrackName = "menu"; 
    this.currentBgm = null;         
    
    this.petalSound = null;
    this.cloudSound = null;
    
    this.enabled = true;
    this.bgmEnabled = true;
    this.sfxEnabled = true;
    
    this.bgmVolume = 0.45;
    this.sfxVolume = 0.80;

    this.bgmMix = {
      menu: 1.0,
      kaleido: 0.5,
      jelly: 0.0,
      tiptoe: 0.5,
    };
  }

  preload() {
    if (typeof loadSound !== "undefined") {
      try {
        this.bgmTracks["menu"] = loadSound("assets/bg-music.mp3");
        this.bgmTracks["kaleido"] = loadSound("assets/kaleido-music.mp3");
        this.bgmTracks["jelly"] = loadSound("assets/jellyjams-music.mp3");
        this.bgmTracks["tiptoe"] = loadSound("assets/tiptoe-music.mp3");
        this.petalSound = loadSound("assets/petal-click.mp3");
        this.cloudSound = loadSound("assets/cloud-transition.mp3"); 
      } catch (e) {
        console.warn("Audio files not found:", e);
      }
    }
  }

  
  playBackgroundMusic(trackName = this.currentTrackName) {
    if (!this.bgmEnabled) return;

    if (this.currentTrackName !== trackName) {
      this.stopBackgroundMusic(); 
      this.currentTrackName = trackName;
    }

    this.currentBgm = this.bgmTracks[this.currentTrackName];

    const mix = this.bgmMix[this.currentTrackName] ?? 1.0;
    if (mix <= 0) {
      this.stopBackgroundMusic();
      this.currentBgm = null;
      return;
    }

    if (this.currentBgm && !this.currentBgm.isPlaying()) {
      this.currentBgm.setVolume(this.bgmVolume * mix);
      this.currentBgm.loop();
    } else if (this.currentBgm && this.currentBgm.isPlaying()) {
      this.currentBgm.setVolume(this.bgmVolume * mix);
    }
  }

  stopBackgroundMusic() {
    if (this.currentBgm && this.currentBgm.isPlaying()) {
      this.currentBgm.stop();
    }
  }

  playSound(soundName) {
    if (!this.sfxEnabled) return;
    
    let sfx = null;
    if (soundName === "petal") sfx = this.petalSound;
    if (soundName === "cloud") sfx = this.cloudSound;

    if (sfx) {
      sfx.setVolume(this.sfxVolume);
      sfx.play();
    }
  }

  setBgmEnabled(state) {
    this.bgmEnabled = !!state;
    if (this.bgmEnabled) this.playBackgroundMusic();
    else this.stopBackgroundMusic();
  }

  setSfxEnabled(state) {
    this.sfxEnabled = !!state;
  }

  setBgmVolume(v) {
    this.bgmVolume = v;
    if (this.currentBgm) {
      const mix = this.bgmMix[this.currentTrackName] ?? 1.0;
      this.currentBgm.setVolume(this.bgmVolume * mix);
    }
  }

  setSfxVolume(v) {
    this.sfxVolume = v;
  }

  getSettings() {
    return {
      bgmEnabled: this.bgmEnabled,
      bgmVolume: this.bgmVolume,
      sfxEnabled: this.sfxEnabled,
      sfxVolume: this.sfxVolume
    };
  }
}

let audioManager = new AudioManager();