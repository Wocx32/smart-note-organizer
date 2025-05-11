import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Stack,
  Tabs,
  Tab,
  Paper,
  FormControl,
  Select,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Checkbox
} from '@mui/material';
import {
  Search,
  NoteAlt,
  Sort,
  FilterList,
  Description,
  MoreVert,
  AccessTime,
  Event,
  ViewList,
  ViewModule,
  Upload,
  Edit,
  Delete,
  Bookmark,
  BookmarkBorder
} from '@mui/icons-material';
import FileImportDialog from '../components/FileImportDialog';
import NewNoteDialog from '../components/NewNoteDialog';
import { getNotes, addNote, updateNote, deleteNote } from '../utils/storage';
import Sidebar from '../components/Sidebar';

const NotesPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [newNoteDialogOpen, setNewNoteDialogOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteToDeleteInDialog, setNoteToDeleteInDialog] = useState(null); // <-- ADDED STATE
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = getNotes();
    setNotes(savedNotes);

    // Add event listener for notes updates
    const handleNotesUpdate = () => {
      const updatedNotes = getNotes();
      setNotes(updatedNotes);
    };

    window.addEventListener('smart_notes_updated', handleNotesUpdate);

    return () => {
      window.removeEventListener('smart_notes_updated', handleNotesUpdate);
    };
  }, []);

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    handleSortClose();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    setActiveTab(0);
  };

  const filterNotes = () => {
    let filtered = [...notes];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query))) // Ensure note.tags exists
      );
    }

    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter(note => note.recent);
    } else if (activeTab === 2) {
      filtered = filtered.filter(note => note.favorite);
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(note => note.tags && note.tags.includes(selectedTag)); // Ensure note.tags exists
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredNotes = filterNotes();

  const handleCreateNote = (noteData) => {
    if (editingNote) {
      // Update existing note
      updateNote(noteData);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteData.id ? noteData : note
        )
      );
      setEditingNote(null);
      setSnackbar({ open: true, message: 'Note updated successfully!', severity: 'success' });
    } else {
      // Create new note
      const newNote = {
        ...noteData,
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        recent: true, // Assuming new notes are recent
        favorite: false, // Default favorite status
        tags: noteData.tags || [], // Ensure tags is an array
        summary: noteData.summary || noteData.content.substring(0, 150) + (noteData.content.length > 150 ? '...' : ''),
      };
      const savedNote = addNote(newNote);
      // setNotes(prevNotes => [savedNote, ...prevNotes]);
      setSnackbar({ open: true, message: 'Note created successfully!', severity: 'success' });
    }
  };

  const handleImportFiles = (processedFiles) => {
    const newNotes = processedFiles.map(noteData => ({
      ...noteData,
    }));

    const savedNotes = newNotes.map(note => addNote(note));
    // setNotes(prevNotes => [...savedNotes, ...prevNotes]);
    setSnackbar({ open: true, message: `${newNotes.length} note(s) imported successfully!`, severity: 'success' });
  };

  const handleDeleteNote = (noteId) => {
    const noteToDelete = notes.find(note => note.id === noteId);
    deleteNote(noteId);
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));

    if (noteToDelete?.flashcards?.length > 0) {
      const existingFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
      const updatedFlashcards = existingFlashcards.filter(card =>
        !noteToDelete.flashcards.some(noteCard =>
          noteCard.front === card.front && noteCard.back === card.back
        )
      );
      localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards));
    }

    setSnackbar({
      open: true,
      message: 'Note deleted successfully',
      severity: 'success'
    });
  };

  const handleBulkDelete = () => {
    const notesToDelete = notes.filter(note => selectedNotes.includes(note.id));
    selectedNotes.forEach(noteId => deleteNote(noteId));
    setNotes(prevNotes => prevNotes.filter(note => !selectedNotes.includes(note.id)));

    const existingFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    const updatedFlashcards = existingFlashcards.filter(card =>
      !notesToDelete.some(note =>
        note.flashcards?.some(noteCard =>
          noteCard.front === card.front && noteCard.back === card.back
        )
      )
    );
    localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards));

    setSelectedNotes([]);
    setSnackbar({
      open: true,
      message: `${selectedNotes.length} notes deleted successfully`,
      severity: 'success'
    });
  };

  const handleNoteSelect = (noteId) => {
    setSelectedNotes(prev =>
      prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleSelectAll = () => {
    setSelectedNotes(prev =>
      prev.length === filteredNotes.length
        ? []
        : filteredNotes.map(note => note.id)
    );
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleMenuClick = (event, note) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedNote(note);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedNote(null);
  };

  const handleDeleteClick = () => {
    setNoteToDeleteInDialog(selectedNote); // <-- CAPTURE THE NOTE HERE
    setDeleteDialogOpen(true);
    handleMenuClose(); // Now it's safe for handleMenuClose to nullify selectedNote
  };

  const handleDeleteConfirm = () => {
    if (noteToDeleteInDialog) { // <-- CHECK noteToDeleteInDialog
      handleDeleteNote(noteToDeleteInDialog.id); // <-- USE noteToDeleteInDialog.id
      setDeleteDialogOpen(false);
      setNoteToDeleteInDialog(null); // <-- CLEANUP noteToDeleteInDialog
    } else {
      console.warn("Delete confirmation attempted, but no note was targeted.");
      setDeleteDialogOpen(false);
      setNoteToDeleteInDialog(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setNoteToDeleteInDialog(null); // <-- CLEANUP noteToDeleteInDialog
  };

  const handleFavoriteToggle = () => {
    if (selectedNote) {
      const updatedNote = {
        ...selectedNote,
        favorite: !selectedNote.favorite
      };
      updateNote(updatedNote);
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === selectedNote.id ? updatedNote : note
        )
      );
      handleMenuClose();
      setSnackbar({
        open: true,
        message: updatedNote.favorite ? 'Added to favorites!' : 'Removed from favorites.',
        severity: 'info'
      });
    }
  };

  const handleEditClick = () => {
    setEditingNote(selectedNote);
    setNewNoteDialogOpen(true);
    handleMenuClose();
  };

  const handleNoteClick = (noteId, event) => {
    // Don't navigate if clicking on the menu button or its children
    if (event.target.closest('.MuiIconButton-root')) {
      return;
    }
    navigate(`/notes/${noteId}`);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar 
        onTagSelect={handleTagSelect} 
        onNewNote={() => {
          setEditingNote(null);
          setNewNoteDialogOpen(true);
        }}
      />
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Box>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" fontWeight="bold">My Notes</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {selectedNotes.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleBulkDelete}
                  sx={{
                    borderColor: 'error.main',
                    color: 'error.main',
                    textTransform: 'none'
                  }}
                >
                  Delete Selected ({selectedNotes.length})
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => setImportDialogOpen(true)}
                sx={{
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 1.5,
                  px: 2.5
                }}
              >
                Import
              </Button>
              <Button
                variant="contained"
                startIcon={<NoteAlt />}
                onClick={() => {
                  setEditingNote(null);
                  setNewNoteDialogOpen(true);
                }}
                sx={{
                  backgroundColor: '#3182ce',
                  boxShadow: 'none',
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 1.5,
                  px: 2.5,
                  '&:hover': {
                    backgroundColor: '#2b6cb0',
                    boxShadow: 'none',
                  }
                }}
              >
                New Note
              </Button>
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 0,
              mb: 4,
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 2
              }}
            >
              <Tab label="All Notes" />
              <Tab label="Recent" />
              <Tab label="Favorites" />
            </Tabs>

            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                placeholder="Search notes..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ width: { xs: '100%', sm: '300px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ display: 'flex', border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1 }}>
                  <IconButton
                    size="medium"
                    onClick={() => handleViewChange('list')}
                    sx={{
                      color: viewMode === 'list' ? 'primary.main' : 'text.secondary',
                      bgcolor: viewMode === 'list' ? 'primary.light' : 'transparent',
                      borderRadius: '4px 0 0 4px',
                      '&:hover': { bgcolor: viewMode === 'list' ? 'primary.light' : 'rgba(0, 0, 0, 0.04)' },
                    }}
                  >
                    <ViewList sx={{ fontSize: 24 }} />
                  </IconButton>
                  <IconButton
                    size="medium"
                    onClick={() => handleViewChange('grid')}
                    sx={{
                      color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
                      bgcolor: viewMode === 'grid' ? 'primary.light' : 'transparent',
                      borderRadius: '0 4px 4px 0',
                      '&:hover': { bgcolor: viewMode === 'grid' ? 'primary.light' : 'rgba(0, 0, 0, 0.04)' },
                    }}
                  >
                    <ViewModule sx={{ fontSize: 24 }} />
                  </IconButton>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<Sort sx={{ fontSize: 24 }} />}
                  onClick={handleSortClick}
                  size="medium"
                  sx={{
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                    color: 'text.primary',
                    textTransform: 'none',
                    fontSize: '1rem',
                    py: 1.5,
                    px: 2.5
                  }}
                >
                  Sort
                </Button>
                <Menu
                  anchorEl={sortAnchorEl}
                  open={Boolean(sortAnchorEl)}
                  onClose={handleSortClose}
                >
                  <MenuItem onClick={() => handleSortChange('recent')}>Most Recent</MenuItem>
                  <MenuItem onClick={() => handleSortChange('title')}>Alphabetical</MenuItem>
                </Menu>

                <Button
                  variant="outlined"
                  startIcon={<FilterList sx={{ fontSize: 24 }} />}
                  onClick={handleFilterClick}
                  size="medium"
                  sx={{
                    borderColor: 'rgba(0, 0, 0, 0.12)',
                    color: 'text.primary',
                    textTransform: 'none',
                    fontSize: '1rem',
                    py: 1.5,
                    px: 2.5
                  }}
                >
                  Filter
                </Button>
                <Menu
                  anchorEl={filterAnchorEl}
                  open={Boolean(filterAnchorEl)}
                  onClose={handleFilterClose}
                >
                  {/* Example filter items, replace with dynamic tags or categories */}
                  <MenuItem onClick={() => { handleTagSelect('Physics'); handleFilterClose(); }}>Physics</MenuItem>
                  <MenuItem onClick={() => { handleTagSelect('Chemistry'); handleFilterClose(); }}>Chemistry</MenuItem>
                  <MenuItem onClick={() => { handleTagSelect('Mathematics'); handleFilterClose(); }}>Mathematics</MenuItem>
                  <MenuItem onClick={() => { handleTagSelect('Computer Science'); handleFilterClose(); }}>Computer Science</MenuItem>
                  <MenuItem onClick={() => { handleTagSelect('Biology'); handleFilterClose(); }}>Biology</MenuItem>
                  <MenuItem onClick={() => { setSelectedTag(null); handleFilterClose();}}>Clear Filter</MenuItem>
                </Menu>
              </Box>
            </Box>
          </Paper>

          {filteredNotes.length === 0 && (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
              No notes found. Try adjusting your search or filters, or create a new note!
            </Typography>
          )}

          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredNotes.map((note) => (
                <Grid key={note.id} item xs={12} sm={6} md={4}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                      }
                    }}
                    onClick={(e) => handleNoteClick(note.id, e)}
                  >
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', p: 0 }}>
                      <CardContent sx={{ p: 3, pb: 2, width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox
                              checked={selectedNotes.includes(note.id)}
                              onChange={() => handleNoteSelect(note.id)}
                              onClick={(e) => e.stopPropagation()}
                              size="small"
                            />
                            <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                              {note.title}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {note.favorite && (
                              <Bookmark
                                sx={{
                                  fontSize: 20,
                                  color: 'primary.main',
                                  mr: 1
                                }}
                              />
                            )}
                            <IconButton size="medium" onClick={(e) => handleMenuClick(e, note)}>
                              <MoreVert sx={{ fontSize: 24 }} />
                            </IconButton>
                          </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" component="div" sx={{ mb: 2,  maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                          {note.summary}
                        </Typography>
                      </CardContent>

                      <Box sx={{ mt: 'auto', p: 2, pt: 0, width: '100%' }}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, minHeight: '20px' /* Ensure space even if no tags */ }}>
                          {note.tags && note.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="medium"
                              sx={{
                                height: 28,
                                fontSize: '0.9rem',
                                backgroundColor: 'rgba(0,0,0,0.06)'
                              }}
                            />
                          ))}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <Event sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="caption" component="span">{note.date}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
              }}
            >
              {filteredNotes.length > 0 && (
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                  <Checkbox
                    checked={selectedNotes.length === filteredNotes.length && filteredNotes.length > 0}
                    indeterminate={selectedNotes.length > 0 && selectedNotes.length < filteredNotes.length}
                    onChange={handleSelectAll}
                    size="small"
                  />
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    Select All
                  </Typography>
                </Box>
              )}
              {filteredNotes.map((note, index) => (
                <Box key={note.id}>
                  {index > 0 && <Divider />}
                  <Box
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'flex-start',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                      cursor: 'pointer'
                    }}
                    onClick={(e) => handleNoteClick(note.id, e)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <Checkbox
                        checked={selectedNotes.includes(note.id)}
                        onChange={() => handleNoteSelect(note.id)}
                        onClick={(e) => e.stopPropagation()}
                        size="small"
                      />
                      <Avatar sx={{ bgcolor: '#E2E8F0', color: '#4A5568' }}>
                        <Description />
                      </Avatar>
                    </Box>

                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="div" fontWeight={500}>
                          {note.title}
                        </Typography>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMenuClick(e, note); }}>
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Box>

                      <Typography variant="body2" color="text.secondary" component="div" sx={{ mb: 2, maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'  }}>
                        {note.summary}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', minHeight: '20px' /* Ensure space even if no tags */ }}>
                          {note.tags && note.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                backgroundColor: 'rgba(0,0,0,0.06)'
                              }}
                            />
                          ))}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <Event sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="caption" component="span">{note.date}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        <FileImportDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onImport={handleImportFiles}
        />

        <NewNoteDialog
          open={newNoteDialogOpen}
          onClose={() => {
            setNewNoteDialogOpen(false);
            setEditingNote(null);
          }}
          onSave={handleCreateNote}
          initialNote={editingNote}
        />

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleFavoriteToggle}>
            {selectedNote?.favorite ? (
              <>
                <Bookmark sx={{ mr: 1, fontSize: 20 }} />
                Remove from Favorites
              </>
            ) : (
              <>
                <BookmarkBorder sx={{ mr: 1, fontSize: 20 }} />
                Add to Favorites
              </>
            )}
          </MenuItem>
          <MenuItem onClick={handleEditClick}>
            <Edit sx={{ mr: 1, fontSize: 20 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1, fontSize: 20 }} />
            Delete
          </MenuItem>
        </Menu>

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
              Are you sure you want to delete "{noteToDeleteInDialog?.title}"? This action cannot be undone. {/* <--- USE noteToDeleteInDialog */}
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
    </Box>
  );
};

export default NotesPage;