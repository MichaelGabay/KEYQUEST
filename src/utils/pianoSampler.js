import * as Tone from 'tone';

// Salamander Piano samples URL - using Tone.js official CDN
const SALAMANDER_BASE_URL = 'https://tonejs.github.io/audio/salamander/';

// Generate note mapping for Salamander Piano sampler
// The samples use 's' instead of '#' for sharp notes (e.g., Ds1.mp3 instead of D#1.mp3)
// Available samples: A0-A7, C1-C8, Ds1-Ds7, Fs1-Fs7
// Tone.Sampler will automatically repitch missing notes using the closest available samples
function generatePianoSamples() {
  const samples = {};
  
  // Available samples from tonejs.github.io/audio/salamander/
  // A notes: A0-A7
  for (let octave = 0; octave <= 7; octave++) {
    samples[`A${octave}`] = `A${octave}.mp3`;
  }
  
  // C notes: C1-C8
  for (let octave = 1; octave <= 8; octave++) {
    samples[`C${octave}`] = `C${octave}.mp3`;
  }
  
  // D# notes (Ds): Ds1-Ds7
  for (let octave = 1; octave <= 7; octave++) {
    samples[`D#${octave}`] = `Ds${octave}.mp3`;
  }
  
  // F# notes (Fs): Fs1-Fs7
  for (let octave = 1; octave <= 7; octave++) {
    samples[`F#${octave}`] = `Fs${octave}.mp3`;
  }
  
  return samples;
}

// Create and return a piano sampler instance
let samplerInstance = null;
let polySamplerInstance = null;
let samplerLoadingPromise = null;
let polySamplerLoadingPromise = null;

/** Reset sampler so next create runs with a running context (fixes "buffer not loaded" after refresh). */
export function resetPianoSampler() {
  samplerInstance = null;
  samplerLoadingPromise = null;
}

/** Reset poly sampler so next create runs with a running context. */
export function resetPolyPianoSampler() {
  polySamplerInstance = null;
  polySamplerLoadingPromise = null;
}

export async function createPianoSampler() {
  if (!samplerInstance) {
    const samples = generatePianoSamples();
    
    samplerInstance = new Tone.Sampler({
      urls: samples,
      release: 1,
      baseUrl: SALAMANDER_BASE_URL,
    }).toDestination();
    
    samplerLoadingPromise = Tone.loaded();
    await samplerLoadingPromise;
  }
  
  return samplerInstance;
}

// Create a polyphonic piano sampler for chords
// Tone.Sampler already supports polyphony, so we can use it directly
export async function createPolyPianoSampler() {
  if (!polySamplerInstance) {
    const samples = generatePianoSamples();
    
    // Tone.Sampler supports polyphony natively - can play multiple notes simultaneously
    polySamplerInstance = new Tone.Sampler({
      urls: samples,
      release: 1,
      baseUrl: SALAMANDER_BASE_URL,
    }).toDestination();
    
    polySamplerLoadingPromise = Tone.loaded();
    await polySamplerLoadingPromise;
  }
  
  return polySamplerInstance;
}
