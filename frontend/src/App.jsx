import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NotesPage from './pages/NotesPage';
import NoteViewPage from './pages/NoteViewPage';
import FlashcardsPage from './pages/FlashcardsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="notes/:id" element={<NoteViewPage />} />
          <Route path="flashcards" element={<FlashcardsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
