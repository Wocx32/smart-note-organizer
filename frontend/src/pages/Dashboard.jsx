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
  Tooltip
} from '@mui/material';
import { 
  Description, 
  School, 
  Tag,
  NoteAlt,
  PlayArrow,
  MenuBook,
  Upload
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
      navigate('/flashcards');
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
            borderRadius: 1.5,
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
            borderRadius: 1.5,
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
            borderRadius: 2,
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

      {/* Recent Notes Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          border: '1px solid rgba(0, 0, 0, 0.08)'
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
              borderRadius: 1.5,
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
              sx={{ 
                px: 2, 
                borderRadius: 1,
                mb: 1,
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
    </Container>
  );
};

export default Dashboard;