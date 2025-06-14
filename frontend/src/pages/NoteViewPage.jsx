import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Bookmark,
  BookmarkBorder,
  School
} from '@mui/icons-material';
import { getNotes, updateNote, deleteNote } from '../utils/storage';
import NewNoteDialog from '../components/NewNoteDialog';

const NoteViewPage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [note, setNote] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const notes = getNotes();
    const foundNote = notes.find(n => n.id === noteId);
    if (foundNote) {
      setNote(foundNote);
    } else {
      navigate('/notes');
    }
  }, [noteId, navigate]);

  const handleBack = () => {
    if (location.state?.fromSearch) {
      navigate('/search', { 
        state: {
          searchQuery: location.state.searchQuery,
          activeTab: location.state.activeTab,
          selectedTags: location.state.selectedTags
        }
      });
    } else {
      navigate('/notes');
    }
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (note) {
      // Delete associated flashcards if they exist
      if (note.flashcards?.length > 0) {
        const existingFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
        const updatedFlashcards = existingFlashcards.filter(card =>
          !note.flashcards.some(noteCard =>
            noteCard.front === card.front && noteCard.back === card.back
          )
        );
        localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards));
      }

      deleteNote(note.id);
      setDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Note deleted successfully',
        severity: 'success'
      });
      navigate('/notes');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleFavoriteToggle = () => {
    if (note) {
      const updatedNote = {
        ...note,
        favorite: !note.favorite
      };
      updateNote(updatedNote);
      setNote(updatedNote);
      setSnackbar({
        open: true,
        message: updatedNote.favorite ? 'Added to favorites!' : 'Removed from favorites.',
        severity: 'info'
      });
    }
  };

  const handleSaveEdit = (updatedNote) => {
    updateNote(updatedNote);
    setNote(updatedNote);
    setEditDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Note updated successfully!',
      severity: 'success'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleStartStudy = () => {
    if (note?.flashcards?.length > 0) {
      // Store the current note's flashcards in localStorage for the study session
      localStorage.setItem('currentStudySession', JSON.stringify({
        flashcards: note.flashcards,
        source: 'note',
        noteId: note.id,
        noteTitle: note.title
      }));
      navigate('/flashcards?studyMode=true');
    } else {
      setSnackbar({
        open: true,
        message: 'No flashcards available for this note.',
        severity: 'warning'
      });
    }
  };

  if (!note) {
    return null;
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      maxWidth: '800px', 
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <Box sx={{ 
        mb: { xs: 2, sm: 3 }, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        gap: { xs: 1, sm: 2 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: { xs: '100%', sm: 'auto' },
          mb: { xs: 1, sm: 0 }
        }}>
          <IconButton onClick={handleBack} size="small">
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              flexGrow: 1,
              fontSize: { xs: '1.5rem', sm: '2rem' },
              ml: 1
            }}
          >
            {note.title}
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 1,
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            width: '100%'
          }}>
            <Button
              variant="outlined"
              startIcon={<School />}
              onClick={handleStartStudy}
              size="small"
              disabled={!note?.flashcards?.length}
              sx={{
                borderColor: 'rgba(0, 0, 0, 0.23)',
                color: 'text.primary',
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                flex: 1
              }}
            >
              Study Flashcards
            </Button>
            <IconButton onClick={handleFavoriteToggle} size="small">
              {note.favorite ? (
                <Bookmark sx={{ color: 'primary.main' }} />
              ) : (
                <BookmarkBorder />
              )}
            </IconButton>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            width: '100%'
          }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEdit}
              size="small"
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                flex: 1
              }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDelete}
              size="small"
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                flex: 1
              }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          mb: 3
        }}
      >
        <Typography
          variant="body1"
          component="div"
          sx={{
            whiteSpace: 'pre-wrap',
            mb: 3,
            lineHeight: 1.6,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
        >
          {note.content}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {note.tags && note.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                backgroundColor: 'rgba(0,0,0,0.06)',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                height: { xs: 24, sm: 28 }
              }}
            />
          ))}
        </Box>

        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ 
            fontSize: { xs: '0.7rem', sm: '0.75rem' }
          }}
        >
          Last updated: {note.date}
        </Typography>
      </Paper>

      <NewNoteDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleSaveEdit}
        initialNote={note}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: '300px'
          }
        }}
      >
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{note.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NoteViewPage; 