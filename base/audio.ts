// @ts-ignore
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

const enum ENote {
  C,
  CSharp,
  D,
  DSharp,
  E,
  F,
  FSharp,
  G,
  GSharp,
  A,
  ASharp,
  B
}

type TFrequency = number;
type TOctave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const equalTempermentFactor = Math.pow(2, 1 / 12);

const getEqualTempermentFrequencies = (): Record<ENote, number[]> => {
  const octaveFactors = Array(9).map((_, index) => Math.pow(equalTempermentFactor, 12 * (index - 4)));

  const create = (distanceFromA: number): number[] => {
    const noteOffsetFactor = Math.pow(equalTempermentFactor, distanceFromA);
    return octaveFactors.map((octave) => octave * noteOffsetFactor * 440);
  };

  return {
    [ENote.C]: create(-9),
    [ENote.CSharp]: create(-8),
    [ENote.D]: create(-7),
    [ENote.DSharp]: create(-6),
    [ENote.E]: create(-5),
    [ENote.F]: create(-4),
    [ENote.FSharp]: create(-3),
    [ENote.G]: create(-2),
    [ENote.GSharp]: create(-1),
    [ENote.A]: create(0),
    [ENote.ASharp]: create(1),
    [ENote.B]: create(2),
  }
}
