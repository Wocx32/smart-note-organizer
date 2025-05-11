import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Paper,
  Chip,
  Container,
  Tooltip,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CardContent
} from '@mui/material';
import { 
  Description, 
  School, 
  Tag,
  NoteAlt,
  PlayArrow,
  MenuBook,
  Upload,
  AutoAwesome,
  Save,
  Summarize,
  Quiz
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotes, addNote } from '../utils/storage';
import NewNoteDialog from '../components/NewNoteDialog';
import FileImportDialog from '../components/FileImportDialog';

const Dashboard = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [tags, setTags] = useState([]);
  const [newNoteDialogOpen, setNewNoteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [generatedFlashcards, setGeneratedFlashcards] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [generateOptions, setGenerateOptions] = useState({
    summary: true,
    flashcards: false
  });
  const [decks, setDecks] = useState([]);

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = getNotes();
    setNotes(savedNotes);

    // Load flashcards from localStorage and count unique ones
    const savedFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    // Create a Set to track unique flashcards by their content
    const uniqueFlashcards = new Set();
    savedFlashcards.forEach(card => {
      // Create a unique key based on front and back content
      const contentKey = `${card.front}-${card.back}`;
      uniqueFlashcards.add(contentKey);
    });
    setFlashcards(Array.from(uniqueFlashcards));

    // Extract unique tags from notes
    const uniqueTags = new Set();
    savedNotes.forEach(note => {
      note.tags?.forEach(tag => uniqueTags.add(tag));
    });
    setTags(Array.from(uniqueTags));

    // Initialize decks from flashcards
    const deckMap = {};
    
    // Process flashcards to organize by deck
    savedFlashcards.forEach(card => {
      if (!deckMap[card.deck]) {
        deckMap[card.deck] = [];
      }
      deckMap[card.deck].push(card);
    });

    // Convert deck map to array format
    const allDecks = [
      { 
        id: 'all', 
        name: 'All Decks', 
        count: savedFlashcards.length,
        cards: savedFlashcards
      },
      ...Object.keys(deckMap).map(deck => ({ 
        id: deck, 
        name: deck, 
        count: deckMap[deck].length,
        cards: deckMap[deck]
      })).sort((a, b) => a.name.localeCompare(b.name))
    ];

    setDecks(allDecks);
  }, []);

  const handleCreateNote = (noteData) => {
    const newNote = {
      ...noteData,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      recent: true,
      favorite: false,
      tags: noteData.tags || [],
      summary: noteData.summary || noteData.content.substring(0, 150) + (noteData.content.length > 150 ? '...' : ''),
    };

    // Add the note using the utility function
    addNote(newNote);
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setNewNoteDialogOpen(false);
    navigate('/notes');
  };

  const handleStartStudy = () => {
    // Get all flashcards from localStorage
    const savedFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    
    if (savedFlashcards.length > 0) {
      // Store the flashcards in localStorage for the study session
      localStorage.setItem('currentStudySession', JSON.stringify({
        flashcards: savedFlashcards,
        source: 'all',
        deckName: 'All Flashcards'
      }));
      // Set studyMode to true in localStorage
      localStorage.setItem('studyMode', 'true');
      navigate('/flashcards?study=1');
    } else {
      // Handle case when no flashcards exist
      alert('No flashcards available for study. Create some flashcards first!');
    }
  };

  const handleStatClick = (type) => {
    switch(type) {
      case 'notes':
        navigate('/notes');
        break;
      case 'tags':
        navigate('/notes', { state: { showTags: true } });
        break;
      case 'flashcards':
        navigate('/flashcards');
        break;
      default:
        break;
    }
  };

  const handleImportFiles = (processedFiles) => {
    const newNotes = processedFiles.map(noteData => ({
      ...noteData,
    }));

    const savedNotes = newNotes.map(note => addNote(note));
    setNotes(prevNotes => [...savedNotes, ...prevNotes]);
  };

  const handleOptionChange = (event) => {
    setGenerateOptions({
      ...generateOptions,
      [event.target.name]: event.target.checked
    });
  };

  const handleProcessContent = async () => {
    if (!content.trim()) return;
    setIsProcessing(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: content,
          options: generateOptions
        }),
      });
      const data = await response.json();
      if (generateOptions.summary) {
        setGeneratedSummary(data.summary || '');
      }
      if (generateOptions.flashcards) {
        setGeneratedFlashcards(data.flashcards || []);
      }
      setSnackbar({
        open: true,
        message: 'Content processed successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error processing content:', error);
      setSnackbar({
        open: true,
        message: 'Failed to process content. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveProcessedContent = () => {
    const newNote = {
      id: Date.now().toString(),
      title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      content: content,
      summary: generatedSummary,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      recent: true,
      favorite: false,
      tags: ['PROCESSED'],
      flashcards: generatedFlashcards
    };

    addNote(newNote);
    setNotes(prevNotes => [newNote, ...prevNotes]);
    
    // Store flashcards in localStorage
    if (generatedFlashcards.length > 0) {
      const existingFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
      const newFlashcards = generatedFlashcards.map(card => ({
        id: Date.now() + Math.random(),
        front: card.front,
        back: card.back,
        deck: 'PROCESSED',
        tags: ['PROCESSED']
      }));
      localStorage.setItem('flashcards', JSON.stringify([...existingFlashcards, ...newFlashcards]));
    }

    setSnackbar({
      open: true,
      message: 'Content saved successfully!',
      severity: 'success'
    });

    // Reset the form
    setContent('');
    setGeneratedSummary('');
    setGeneratedFlashcards([]);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Calculate stats
  const stats = [
    { 
      title: 'Total Notes', 
      value: notes.length, 
      icon: <Description />, 
      color: '#4299E1',
      type: 'notes',
      tooltip: 'View all your notes'
    },
    { 
      title: 'Tags', 
      value: tags.length, 
      icon: <Tag />, 
      color: '#48BB78',
      type: 'tags',
      tooltip: 'View all tags'
    },
    { 
      title: 'Flashcards', 
      value: flashcards.length, 
      icon: <School />, 
      color: '#ED8936',
      type: 'flashcards',
      tooltip: 'View all flashcards'
    },
  ];

  // Get recent notes (last 4)
  const recentNotes = notes.slice(0, 4).map(note => ({
    id: note.id,
    title: note.title,
    date: note.date,
    tags: note.tags || []
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 6,
          py: 4
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 2,
          mb: 2
        }}>
          <MenuBook sx={{ 
            fontSize: 80,
            color: '#3182ce',
            filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))'
          }} />
          <Typography 
            variant="h2" 
            fontWeight="bold" 
            sx={{ 
              background: 'linear-gradient(45deg, #3182ce 30%, #4299E1 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Smart Note Organizer
          </Typography>
        </Box>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ 
            maxWidth: '600px', 
            mx: 'auto',
            lineHeight: 1.6
          }}
        >
          Your intelligent companion for organizing notes, creating flashcards, and mastering your study materials with ease.
        </Typography>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={3} key={stat.title}>
            <Tooltip title={stat.tooltip} arrow>
              <Card
                elevation={0}
                onClick={() => handleStatClick(stat.type)}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    borderColor: stat.color,
                  }
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    backgroundColor: stat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<NoteAlt />}
          onClick={() => setNewNoteDialogOpen(true)}
          sx={{
            backgroundColor: '#3182ce',
            boxShadow: 'none',
            borderRadius: '50px',
            px: 3,
            py: 1.5,
            '&:hover': {
              backgroundColor: '#2b6cb0',
              boxShadow: 'none',
            }
          }}
        >
          Create New Note
        </Button>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={handleStartStudy}
          sx={{
            backgroundColor: '#48BB78',
            boxShadow: 'none',
            borderRadius: '50px',
            px: 3,
            py: 1.5,
            '&:hover': {
              backgroundColor: '#38A169',
              boxShadow: 'none',
            }
          }}
        >
          Start Study Mode
        </Button>
      </Box>

      {/* Import Section */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<Upload />}
          onClick={() => setImportDialogOpen(true)}
          sx={{
            borderColor: 'rgba(0, 0, 0, 0.23)',
            color: 'text.primary',
            borderRadius: '50px',
            px: 4,
            py: 2,
            fontSize: '1.1rem',
            minWidth: '200px',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          Import Files
        </Button>
      </Box>

      {/* Content Processing Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          mb: 4
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Summarize
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={6}
          placeholder="Enter your text here or import files to process..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box sx={{ mb: 3 }}>
          <FormGroup row sx={{ gap: 3 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={generateOptions.summary}
                  onChange={handleOptionChange}
                  name="summary"
                />
              }
              label="Generate Summary"
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={generateOptions.flashcards}
                  onChange={handleOptionChange}
                  name="flashcards"
                />
              }
              label="Generate Flashcards"
            />
          </FormGroup>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setImportDialogOpen(true)}
            sx={{
              borderColor: 'rgba(0, 0, 0, 0.23)',
              color: 'text.primary',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            Import Files
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={handleProcessContent}
            disabled={!content.trim() || isProcessing || (!generateOptions.summary && !generateOptions.flashcards)}
            sx={{
              backgroundColor: '#3182ce',
              '&:hover': {
                backgroundColor: '#2b6cb0',
              }
            }}
          >
            {isProcessing ? 'Processing...' : 'Generate'}
          </Button>
        </Box>

        {isProcessing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {generatedSummary && generateOptions.summary && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Generated Summary</Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'background.default',
                borderRadius: 1
              }}
            >
              <Typography variant="body1">
                {generatedSummary}
              </Typography>
            </Paper>
          </Box>
        )}

        {generatedFlashcards.length > 0 && generateOptions.flashcards && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Generated Flashcards</Typography>
            <Grid container spacing={2}>
              {generatedFlashcards.map((card, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'background.default',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Question:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {card.front}
                    </Typography>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Answer:
                    </Typography>
                    <Typography variant="body1">
                      {card.back}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {((generatedSummary && generateOptions.summary) || (generatedFlashcards.length > 0 && generateOptions.flashcards)) && (
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveProcessedContent}
            sx={{
              backgroundColor: '#48BB78',
              '&:hover': {
                backgroundColor: '#38A169',
              }
            }}
          >
            Save Content
          </Button>
        )}
      </Paper>

      {/* Recent Notes Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">Recent Notes</Typography>
          <Button 
            variant="contained"
            size="small" 
            color="primary"
            onClick={() => navigate('/notes')}
            sx={{
              backgroundColor: '#3182ce',
              borderRadius: '50px',
              textTransform: 'none',
              px: 2,
              '&:hover': {
                backgroundColor: '#2b6cb0',
              }
            }}
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <List>
          {recentNotes.map((note) => (
            <ListItem 
              key={note.id}
              alignItems="flex-start"
              onClick={() => navigate(`/notes/${note.id}`)}
              sx={{ 
                px: 2, 
                borderRadius: 1,
                mb: 1,
                cursor: 'pointer',
                '&:hover': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                }
              }}
            >
              <ListItemText
                primary={note.title}
                secondary={
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {note.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(0,0,0,0.06)',
                        }}
                      />
                    ))}
                  </Box>
                }
              />
              <Typography variant="caption" color="text.secondary">
                {note.date}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Favorite Notes Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">Favorite Notes</Typography>
          <Button 
            variant="contained"
            size="small" 
            color="primary"
            onClick={() => navigate('/notes', { state: { showFavorites: true } })}
            sx={{
              backgroundColor: '#3182ce',
              borderRadius: '50px',
              textTransform: 'none',
              px: 2,
              '&:hover': {
                backgroundColor: '#2b6cb0',
              }
            }}
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <List>
          {notes.filter(note => note.favorite).slice(0, 4).map((note) => (
            <ListItem 
              key={note.id}
              alignItems="flex-start"
              onClick={() => navigate(`/notes/${note.id}`)}
              sx={{ 
                px: 2, 
                borderRadius: 1,
                mb: 1,
                cursor: 'pointer',
                '&:hover': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                }
              }}
            >
              <ListItemText
                primary={note.title}
                secondary={
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {note.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(0,0,0,0.06)',
                        }}
                      />
                    ))}
                  </Box>
                }
              />
              <Typography variant="caption" color="text.secondary">
                {note.date}
              </Typography>
            </ListItem>
          ))}
          {notes.filter(note => note.favorite).length === 0 && (
            <ListItem>
              <ListItemText
                primary="No favorite notes yet"
                sx={{ textAlign: 'center', color: 'text.secondary' }}
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* Explore Decks Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">Explore Decks</Typography>
          <Button 
            variant="contained"
            size="small" 
            color="primary"
            onClick={() => navigate('/flashcards')}
            sx={{
              backgroundColor: '#3182ce',
              borderRadius: '50px',
              textTransform: 'none',
              px: 2,
              '&:hover': {
                backgroundColor: '#2b6cb0',
              }
            }}
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {decks
            .filter(deck => deck.id !== 'all' && deck.id !== 'PROCESSED')
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((deck) => (
              <Grid item xs={12} sm={6} md={3} key={deck.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{wordBreak: 'break-word'}}>
                        {deck.name}
                      </Typography>
                      <School sx={{ color: 'primary.main' }} />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {deck.count} flashcard{deck.count === 1 ? '' : 's'}
                    </Typography>
                  </CardContent>
                  <Box sx={{ mt: 'auto', p: 2, pt: 0, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/flashcards', { state: { selectedDeck: deck.id } })}
                      sx={{
                        flex: 1,
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                        color: 'text.primary',
                        textTransform: 'none'
                      }}
                    >
                      View
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        localStorage.setItem('currentStudySession', JSON.stringify({
                          flashcards: deck.cards,
                          source: 'deck',
                          deckName: deck.name
                        }));
                        localStorage.setItem('studyMode', 'true');
                        navigate('/flashcards');
                      }}
                      disabled={deck.count === 0}
                      sx={{
                        flex: 1,
                        backgroundColor: '#3182ce',
                        boxShadow: 'none',
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: '#2b6cb0',
                          boxShadow: 'none',
                        }
                      }}
                    >
                      Study
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          {decks.filter(deck => deck.id !== 'all' && deck.id !== 'PROCESSED').length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No decks available yet. Create some flashcards to get started!
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      <NewNoteDialog
        open={newNoteDialogOpen}
        onClose={() => setNewNoteDialogOpen(false)}
        onSave={handleCreateNote}
      />

      <FileImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImportFiles}
      />

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
    </Container>
  );
};

export default Dashboard;