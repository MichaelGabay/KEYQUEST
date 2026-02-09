import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import PianoKeyboard from '../components/PianoKeyboard';
import ChordsKeyboard from '../components/ChordsKeyboard';

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const getFullscreenElement = () =>
      document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
    const onFullscreenChange = () => setIsFullscreen(!!getFullscreenElement());
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggle = useCallback(async () => {
    try {
      const isInFullscreen =
        !!document.fullscreenElement || !!document.webkitFullscreenElement;
      if (isInFullscreen) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      } else {
        const doc = document.documentElement;
        if (doc.requestFullscreen) await doc.requestFullscreen();
        else if (doc.webkitRequestFullscreen) await doc.webkitRequestFullscreen();
        else if (doc.msRequestFullscreen) await doc.msRequestFullscreen();
      }
    } catch (e) {
      // Fullscreen not supported or denied
    }
  }, []);

  return { isFullscreen, toggle };
}

const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const CHORDS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Mapping from notes to solfege (Hebrew)
const NOTE_TO_SOLFEGE = {
  'C': 'דו',
  'D': 'רה',
  'E': 'מי',
  'F': 'פה',
  'G': 'סול',
  'A': 'לה',
  'B': 'סי'
};

function Piano() {
  const { mode: modeParam } = useParams();
  const mode = modeParam === 'chords' ? 'chords' : 'melody'; // default melody for unknown paths
  const [currentNote, setCurrentNote] = useState(null);
  const [currentChord, setCurrentChord] = useState(null);
  const [scores, setScores] = useState({
    melody: { correct: 0, total: 0 },
    chords: { correct: 0, total: 0 }
  });
  const [disabled, setDisabled] = useState(false);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  useEffect(() => {
    if (mode === 'melody') {
      generateNewNote();
    } else if (mode === 'chords') {
      generateNewChord();
    }
  }, [mode]);

  const generateNewNote = () => {
    let randomNote;
    do {
      randomNote = NOTES[Math.floor(Math.random() * NOTES.length)];
    } while (randomNote === currentNote && NOTES.length > 1);
    setCurrentNote(randomNote);
    setDisabled(false);
  };

  const generateNewChord = () => {
    let randomChord;
    do {
      randomChord = CHORDS[Math.floor(Math.random() * CHORDS.length)];
    } while (randomChord === currentChord && CHORDS.length > 1);
    setCurrentChord(randomChord);
    setDisabled(false);
  };

  const handleNotePlayed = (playedNote, isCorrect) => {
    setDisabled(true);
    setScores(prev => ({
      ...prev,
      melody: {
        ...prev.melody,
        total: prev.melody.total + 1
      }
    }));

    if (isCorrect) {
      setScores(prev => ({
        ...prev,
        melody: {
          ...prev.melody,
          correct: prev.melody.correct + 1
        }
      }));
      setTimeout(() => generateNewNote(), 200);
    } else {
      setTimeout(() => generateNewNote(), 300);
    }
  };

  const handleChordPlayed = (playedNote, isCorrect) => {
    setDisabled(true);
    setScores(prev => ({
      ...prev,
      chords: {
        ...prev.chords,
        total: prev.chords.total + 1
      }
    }));

    if (isCorrect) {
      setScores(prev => ({
        ...prev,
        chords: {
          ...prev.chords,
          correct: prev.chords.correct + 1
        }
      }));
      setTimeout(() => generateNewChord(), 200);
    } else {
      setTimeout(() => generateNewChord(), 300);
    }
  };

  return (
    <div className="h-full py-8">
      {/* Fullscreen button - mobile only */}
      <button
        type="button"
        onClick={toggleFullscreen}
        className="md:hidden fixed bottom-6 left-6 z-50 p-3 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-700 active:bg-gray-600 transition-colors"
        aria-label={isFullscreen ? 'יציאה ממסך מלא' : 'מסך מלא'}
      >
        {isFullscreen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </button>

      <div className="container mx-auto px-4">
        {/* Mode Switcher - uses routes */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-white shadow-md p-1">
            <Link
              to="/notes-and-chords-practice/melody"
              className={`px-6 py-2 rounded-md font-medium transition-all ${mode === 'melody'
                ? 'bg-gray-800 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              מלודיה
            </Link>
            <Link
              to="/notes-and-chords-practice/chords"
              className={`px-6 py-2 rounded-md font-medium transition-all ${mode === 'chords'
                ? 'bg-gray-800 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              אקורדים
            </Link>
          </div>
        </div>

        {/* Score */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white rounded-lg shadow-md px-6 py-3">
            <span className="text-gray-700 font-semibold">
              ניקוד: {scores[mode].total} / {scores[mode].correct}
            </span>
          </div>
        </div>

        {/* Melody Mode */}
        {mode === 'melody' && (
          <div className="text-center">
            {currentNote && (
              <>
                <div className="mb-6">
                  <div className="inline-block bg-white rounded-lg shadow-lg px-6 py-4">
                    <div className="text-5xl font-bold text-gray-800">
                      {NOTE_TO_SOLFEGE[currentNote]}
                    </div>
                  </div>
                </div>

                <PianoKeyboard
                  targetNote={currentNote}
                  onNotePlayed={handleNotePlayed}
                  disabled={disabled}
                />
              </>
            )}
          </div>
        )}

        {/* Chords Mode */}
        {mode === 'chords' && (
          <div className="text-center">
            {currentChord && (
              <>
                <div className="mb-6">
                  <div className="inline-block bg-white rounded-lg shadow-lg px-6 py-4">
                    <div className="text-5xl font-bold text-gray-800">
                      {currentChord}
                    </div>
                  </div>
                </div>

                <ChordsKeyboard
                  targetChord={currentChord}
                  onChordPlayed={handleChordPlayed}
                  disabled={disabled}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Piano;
