class AudioManager {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        this.initSounds();
    }

    async initSounds() {
        // Create jump sound (short beep)
        const jumpOsc = this.audioContext.createOscillator();
        const jumpGain = this.audioContext.createGain();
        jumpOsc.connect(jumpGain);
        jumpGain.connect(this.audioContext.destination);
        
        this.sounds.jump = {
            play: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.frequency.value = 400;
                gain.gain.value = 0.1;
                
                osc.start();
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                osc.stop(this.audioContext.currentTime + 0.1);
            }
        };

        // Create score sound (higher pitched beep)
        this.sounds.score = {
            play: () => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.frequency.value = 600;
                gain.gain.value = 0.1;
                
                osc.start();
                gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
                osc.stop(this.audioContext.currentTime + 0.15);
            }
        };
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }
}
