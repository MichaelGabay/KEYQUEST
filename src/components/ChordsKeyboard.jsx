import { useState, useEffect } from 'react';
import * as Tone from 'tone';
import { createPolyPianoSampler, resetPolyPianoSampler } from '../utils/pianoSampler';

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = ['C#', 'D#', 'F#', 'G#', 'A#'];

// Chord definitions (major chords)
const CHORDS = {
  'C': ['C', 'E', 'G'],
  'D': ['D', 'F#', 'A'],
  'E': ['E', 'G#', 'B'],
  'F': ['F', 'A', 'C'],
  'G': ['G', 'B', 'D'],
  'A': ['A', 'C#', 'E'],
  'B': ['B', 'D#', 'F#'],
};

function ChordsKeyboard({ targetChord, onChordPlayed, disabled }) {
  const [pressedKey, setPressedKey] = useState(null);
  const [pressedKeyResult, setPressedKeyResult] = useState(null); // 'correct' or 'wrong'
  const [piano, setPiano] = useState(null);

  useEffect(() => {
    // Initialize Tone.js and load piano sampler
    const initAudio = async () => {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }
      // Load piano sampler
      const pianoInstance = await createPolyPianoSampler();
      setPiano(pianoInstance);
    };
    initAudio();
  }, []);

  useEffect(() => {
    // Reset pressed key when target chord changes
    setPressedKey(null);
    setPressedKeyResult(null);
  }, [targetChord]);

  const playNote = async (note, event) => {
    if (disabled) return;

    if (event) {
      event.preventDefault();
      event.target.blur();
    }

    // Resume audio context on first user interaction (required after refresh)
    let instrument = piano;
    if (Tone.context.state !== 'running') {
      await Tone.start();
      // Sampler created while suspended has no loaded buffers - reset and create fresh
      resetPolyPianoSampler();
      instrument = null;
    }
    if (!instrument) {
      instrument = await createPolyPianoSampler();
      setPiano(instrument);
    }

    // Check if this note is part of the target chord
    const requiredNotes = targetChord && CHORDS[targetChord] ? new Set(CHORDS[targetChord]) : new Set();
    const isCorrect = requiredNotes.has(note);

    setPressedKey(note);
    setPressedKeyResult(isCorrect ? 'correct' : 'wrong');

    // Play the note with Salamander Piano sampler (faster duration)
    instrument.triggerAttackRelease(`${note}4`, '16n');

    // Notify parent (same as melody mode)
    onChordPlayed(note, isCorrect);

    // Reset pressed key after animation (faster reset)
    setTimeout(() => {
      setPressedKey(null);
      setPressedKeyResult(null);
    }, 400);
  };

  const getKeyClass = (note, isBlack) => {
    // Check if this is the pressed key (same as melody mode)
    const isPressed = pressedKey === note;

    // Use the stored result instead of comparing with current targetChord
    // This prevents the issue where targetChord changes before pressedKey resets
    const isCorrect = isPressed && pressedKeyResult === 'correct';
    const isWrong = isPressed && pressedKeyResult === 'wrong';

    let colorClass = '';
    if (isCorrect) {
      // Green background for correct answer (same as melody mode)
      colorClass = isBlack ? 'bg-green-600' : 'bg-green-400';
    } else if (isWrong) {
      // Red background for wrong answer (same as melody mode)
      colorClass = isBlack ? 'bg-red-600' : 'bg-red-400';
    } else {
      // Default colors
      colorClass = isBlack
        ? 'bg-gray-900 hover:bg-gray-700'
        : 'bg-white hover:bg-gray-100';
    }

    // Add border only for white keys when not pressed
    const borderClass = !isBlack && !isPressed ? 'border border-gray-300' : '';

    return `${colorClass} ${borderClass} transition-all duration-200`;
  };

  return (
    <div className="flex justify-center items-center mt-8">
      <div className="relative inline-flex">
        {/* White keys */}
        {WHITE_KEYS.map((note) => (
          <button
            key={note}
            onClick={(e) => playNote(note, e)}
            onMouseDown={(e) => e.preventDefault()}
            tabIndex={-1}
            disabled={disabled}
            className={`${getKeyClass(note, false)} border-0 w-14 h-56 rounded-b-md shadow-md relative z-0 cursor-pointer`}
          >
          </button>
        ))}

        {/* Black keys */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {/* C# - between C and D */}
          <button
            onClick={(e) => playNote('C#', e)}
            onMouseDown={(e) => e.preventDefault()}
            tabIndex={-1}
            disabled={disabled}
            className={`${getKeyClass('C#', true)} absolute w-12 h-40 rounded-b-md shadow-lg z-10 pointer-events-auto cursor-pointer border-0`}
            style={{ left: '32px' }}
          >
          </button>

          {/* D# - between D and E */}
          <button
            onClick={(e) => playNote('D#', e)}
            onMouseDown={(e) => e.preventDefault()}
            tabIndex={-1}
            disabled={disabled}
            className={`${getKeyClass('D#', true)} absolute w-12 h-40 rounded-b-md shadow-lg z-10 pointer-events-auto cursor-pointer`}
            style={{ left: '88px' }}
          >
          </button>

          {/* F# - between F and G */}
          <button
            onClick={(e) => playNote('F#', e)}
            onMouseDown={(e) => e.preventDefault()}
            tabIndex={-1}
            disabled={disabled}
            className={`${getKeyClass('F#', true)} absolute w-12 h-40 rounded-b-md shadow-lg z-10 pointer-events-auto cursor-pointer`}
            style={{ left: '200px' }}
          >
          </button>

          {/* G# - between G and A */}
          <button
            onClick={(e) => playNote('G#', e)}
            onMouseDown={(e) => e.preventDefault()}
            tabIndex={-1}
            disabled={disabled}
            className={`${getKeyClass('G#', true)} absolute w-12 h-40 rounded-b-md shadow-lg z-10 pointer-events-auto cursor-pointer`}
            style={{ left: '256px' }}
          >
          </button>

          {/* A# - between A and B */}
          <button
            onClick={(e) => playNote('A#', e)}
            onMouseDown={(e) => e.preventDefault()}
            tabIndex={-1}
            disabled={disabled}
            className={`${getKeyClass('A#', true)} absolute w-12 h-40 rounded-b-md shadow-lg z-10 pointer-events-auto cursor-pointer`}
            style={{ left: '312px' }}
          >
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChordsKeyboard;
