import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import NotesPage from './pages/NotesPage';
import NoteViewPage from './pages/NoteViewPage';
import FlashcardsPage from './pages/FlashcardsPage';
import SearchPage from './pages/SearchPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="notes/:noteId" element={<NoteViewPage />} />
            <Route path="flashcards" element={<FlashcardsPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
