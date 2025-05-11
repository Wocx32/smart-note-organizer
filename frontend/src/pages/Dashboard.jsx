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
  const fullHeading = 'Smart Note Organizer';
  const [typedHeading, setTypedHeading] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let timeout;
    if (typedHeading.length < fullHeading.length) {
      timeout = setTimeout(() => {
        setTypedHeading(fullHeading.slice(0, typedHeading.length + 1));
      }, 40);
    } else {
      // Blinking cursor effect
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 500);
      return () => clearInterval(cursorInterval);
    }
    return () => clearTimeout(timeout);
  }, [typedHeading, fullHeading]);

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
          mb: { xs: 4, sm: 6 },
          py: { xs: 2, sm: 4 }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: { xs: 1.5, sm: 2 },
          mb: { xs: 1, sm: 2 }
        }}>
          <MenuBook sx={{ 
            fontSize: { xs: 60, sm: 80 },
            color: '#3182ce',
            filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))',
            order: { xs: 0, sm: 0 }
          }} />
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            order: { xs: 1, sm: 1 }
          }}>
            <Typography 
              variant="h2" 
              fontWeight="bold" 
              sx={{ 
                background: 'linear-gradient(90deg, #3182ce 0%, #4299E1 50%, #00f3ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                fontFamily: 'monospace',
                letterSpacing: 1,
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                lineHeight: 1.2,
                whiteSpace: 'nowrap'
              }}
            >
              {typedHeading}
              <Box component="span" sx={{
                display: 'inline-block',
                width: '1ch',
                color: '#3182ce',
                opacity: showCursor && typedHeading.length === fullHeading.length ? 1 : 0,
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.5rem' },
                ml: 0.5,
                transition: 'opacity 0.2s'
              }}>
                |
              </Box>
            </Typography>
          </Box>
        </Box>
        <Typography 
          variant="h6" 
          color="text.secondary"
          sx={{ 
            maxWidth: '600px', 
            mx: 'auto',
            lineHeight: 1.6,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            px: { xs: 2, sm: 0 }
          }}
        >
          Your intelligent companion for organizing notes, creating flashcards, and mastering your study materials with ease.
        </Typography>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={{ xs: 2, sm: 4 }} justifyContent="center" sx={{ mb: { xs: 3, sm: 4 } }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={4} md={3} key={stat.title}>
            <Tooltip title={stat.tooltip} arrow>
              <Card
                elevation={0}
                onClick={() => handleStatClick(stat.type)}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: 1.5, sm: 2 },
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
                    width: { xs: 45, sm: 60 },
                    height: { xs: 45, sm: 60 },
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
                  <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    {stat.title}
                  </Typography>
                </Box>
              </Card>
            </Tooltip>
          </Grid>
        ))}
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'center', 
        gap: { xs: 1.5, sm: 2 }, 
        mb: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 0 }
      }}>
        <Button
          variant="contained"
          startIcon={<NoteAlt />}
          onClick={() => setNewNoteDialogOpen(true)}
          fullWidth={false}
          sx={{
            backgroundColor: '#3182ce',
            boxShadow: 'none',
            borderRadius: '50px',
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Create New Note
        </Button>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={handleStartStudy}
          fullWidth={false}
          sx={{
            backgroundColor: '#48BB78',
            boxShadow: 'none',
            borderRadius: '50px',
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: '0.9rem', sm: '1rem' },
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          Start Study Mode
        </Button>
      </Box>

      {/* Import Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 0 }
      }}>
        <Button
          variant="outlined"
          startIcon={<Upload />}
          onClick={() => setImportDialogOpen(true)}
          fullWidth={false}
          sx={{
            borderColor: 'rgba(0, 0, 0, 0.23)',
            color: 'text.primary',
            borderRadius: '50px',
            px: { xs: 2, sm: 4 },
            py: { xs: 1, sm: 2 },
            fontSize: { xs: '0.9rem', sm: '1.1rem' },
            minWidth: { xs: '100%', sm: '200px' }
          }}
        >
          Import Files
        </Button>
      </Box>

      {/* Content Processing Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          mb: { xs: 3, sm: 4 },
          mx: { xs: 2, sm: 0 }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'center', sm: 'center' }, 
          mb: 3,
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.3rem', sm: '1.7rem' } }}>Summarize</Typography>
        </Box>
        
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
          <FormGroup row sx={{ gap: { xs: 1, sm: 3 }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
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

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 }, 
          mb: 3 
        }}>
          <Button
            variant="outlined"
            startIcon={<Upload />}
            onClick={() => setImportDialogOpen(true)}
            fullWidth={false}
            sx={{
              borderColor: 'rgba(0, 0, 0, 0.23)',
              color: 'text.primary',
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Import Files
          </Button>
          <Button
            variant="contained"
            startIcon={<AutoAwesome />}
            onClick={handleProcessContent}
            disabled={!content.trim() || isProcessing || (!generateOptions.summary && !generateOptions.flashcards)}
            fullWidth={false}
            sx={{
              backgroundColor: '#3182ce',
              width: { xs: '100%', sm: 'auto' }
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
            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Generated Summary</Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'background.default',
                borderRadius: 1
              }}
            >
              <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                {generatedSummary}
              </Typography>
            </Paper>
          </Box>
        )}

        {generatedFlashcards.length > 0 && generateOptions.flashcards && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Generated Flashcards</Typography>
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
                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      Question:
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      {card.front}
                    </Typography>
                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      Answer:
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
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
            fullWidth={false}
            sx={{
              backgroundColor: '#48BB78',
              width: { xs: '100%', sm: 'auto' }
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
          p: { xs: 2, sm: 4 }, 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          mb: { xs: 3, sm: 4 },
          mx: { xs: 2, sm: 0 }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'center', sm: 'center' }, 
          mb: 3,
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.3rem', sm: '1.7rem' } }}>Recent Notes</Typography>
          <Button 
            variant="contained"
            size="medium" 
            color="primary"
            onClick={() => navigate('/notes')}
            sx={{
              backgroundColor: '#3182ce',
              borderRadius: '50px',
              textTransform: 'none',
              px: { xs: 2, sm: 2.5 },
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              width: { xs: '100%', sm: 'auto' }
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
                px: { xs: 1, sm: 2 }, 
                borderRadius: 1,
                mb: 1,
                cursor: 'pointer',
                '&:hover': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                }
              }}
            >
              <ListItemText
                primary={<Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, fontWeight: 600 }}>{note.title}</Typography>}
                secondary={
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {note.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          backgroundColor: 'rgba(0,0,0,0.06)',
                        }}
                      />
                    ))}
                  </Box>
                }
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
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
          p: { xs: 2, sm: 4 }, 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          mb: { xs: 3, sm: 4 },
          mx: { xs: 2, sm: 0 }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'center', sm: 'center' }, 
          mb: 3,
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.3rem', sm: '1.7rem' } }}>Favorite Notes</Typography>
          <Button 
            variant="contained"
            size="small" 
            color="primary"
            onClick={() => navigate('/notes', { state: { showFavorites: true } })}
            sx={{
              backgroundColor: '#3182ce',
              borderRadius: '50px',
              textTransform: 'none',
              px: { xs: 2, sm: 2.5 },
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              width: { xs: '100%', sm: 'auto' }
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
                px: { xs: 1, sm: 2 }, 
                borderRadius: 1,
                mb: 1,
                cursor: 'pointer',
                '&:hover': { 
                  backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                }
              }}
            >
              <ListItemText
                primary={<Typography sx={{ fontSize: { xs: '1rem', sm: '1.2rem' }, fontWeight: 600 }}>{note.title}</Typography>}
                secondary={
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {note.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          backgroundColor: 'rgba(0,0,0,0.06)',
                        }}
                      />
                    ))}
                  </Box>
                }
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
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
          p: { xs: 2, sm: 4 }, 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          mb: { xs: 3, sm: 4 },
          mx: { xs: 2, sm: 0 }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'center', sm: 'center' }, 
          mb: 3,
          gap: { xs: 1, sm: 0 }
        }}>
          <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.3rem', sm: '1.7rem' } }}>Explore Decks</Typography>
          <Button 
            variant="contained"
            size="small" 
            color="primary"
            onClick={() => navigate('/flashcards')}
            sx={{
              backgroundColor: '#3182ce',
              borderRadius: '50px',
              textTransform: 'none',
              px: { xs: 2, sm: 2.5 },
              fontSize: { xs: '0.9rem', sm: '1.1rem' },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            View All
          </Button>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={{ xs: 2, sm: 3 }}>
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
                  <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ 
                        wordBreak: 'break-word',
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}>
                        {deck.name}
                      </Typography>
                      <School sx={{ color: 'primary.main', fontSize: { xs: 28, sm: 36 } }} />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                      {deck.count} flashcard{deck.count === 1 ? '' : 's'}
                    </Typography>
                  
                    <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/flashcards', { state: { selectedDeck: deck.id } })}
                        fullWidth
                        sx={{
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                          color: 'text.primary',
                          textTransform: 'none',
                          fontSize: { xs: '0.8rem', sm: '0.9rem' }
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
                        fullWidth
                        sx={{
                          backgroundColor: '#3182ce',
                          boxShadow: 'none',
                          textTransform: 'none',
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                          '&:hover': {
                            backgroundColor: '#2b6cb0',
                            boxShadow: 'none',
                          }
                        }}
                      >
                        Study
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          {decks.filter(deck => deck.id !== 'all' && deck.id !== 'PROCESSED').length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
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