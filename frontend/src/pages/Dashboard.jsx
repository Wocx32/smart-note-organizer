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
  Container
} from '@mui/material';
import { 
  Description, 
  School, 
  Tag
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotes } from '../utils/storage';

const Dashboard = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [tags, setTags] = useState([]);

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

  // Calculate stats
  const stats = [
    { title: 'Total Notes', value: notes.length, icon: <Description />, color: '#4299E1' },
    { title: 'Tags', value: tags.length, icon: <Tag />, color: '#48BB78' },
    { title: 'Flashcards', value: flashcards.length, icon: <School />, color: '#ED8936' },
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
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight="bold" align="center" sx={{ mb: 4 }}>
          Dashboard
        </Typography>

        {/* Stats Section */}
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={3} key={stat.title}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  height: '100%'
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
                    color: 'white'
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
            </Grid>
          ))}
        </Grid>

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
              size="small" 
              color="primary"
              onClick={() => navigate('/notes')}
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
      </Box>
    </Container>
  );
};

export default Dashboard;