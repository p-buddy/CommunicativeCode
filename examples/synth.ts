import ask from "../ask"
import { after, when } from "../events";

const synth = {
  audio: new Audio(),
  volume: 1,
  play: (note: number) => {
  },
  setVolume: function (volume: number) {
    this.audio.volume = volume;
  }
}

const kick = {
  play: (note: number) => {

  }
}

// Chord maker
when(synth, "play").also((note) => {
  ask(synth).to("play", note + 7);
});

// Endless melody writer
after(synth, "play").finally((_, note) => {
  ask(synth).to("play", note + 2);
});

// Sidechaining
when(kick, "play").also(() => {
  ask(synth).to("setVolume", ask(synth).whatIsIts("volume"));
});

ask(synth).to("play", 2);




