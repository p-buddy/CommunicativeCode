// @ts-ignore
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

type TFrequency = number;
type TOctave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type TNote = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "A" | "A#" | "G" | "G#" | "A" | "A#" | "B";

const noteOrder: TNote[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const equalTempermentFactor = Math.pow(2, 1 / 12);

const getEqualTempermentFrequencies = (): Record<TNote, number[]> => {
  const octaveFactors = Array(9).map((_, index) => Math.pow(equalTempermentFactor, 12 * (index - 4)));

  const create = (distanceFromA: number): number[] => {
    const noteOffsetFactor = Math.pow(equalTempermentFactor, distanceFromA);
    return octaveFactors.map((octave) => octave * noteOffsetFactor * 440);
  };

  return {
    "C": create(-9),
    "C#": create(-8),
    "D": create(-7),
    "D#": create(-6),
    "E": create(-5),
    "F": create(-4),
    "F#": create(-3),
    "G": create(-2),
    "G#": create(-1),
    "A": create(0),
    "A#": create(1),
    "B": create(2),
  }
}