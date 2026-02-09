import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Piano from './pages/Piano';
import './App.css';

function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center text-gray-800">
        ברוכים הבאים ל-KeyQuest
      </h1>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navigation />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/notes-and-chords-practice" element={<Navigate to="/notes-and-chords-practice/melody" replace />} />
          <Route path="/notes-and-chords-practice/:mode" element={<Piano />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
