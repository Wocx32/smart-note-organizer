import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  IconButton, 
  Button,
  Chip,
  Tabs,
  Tab,
  TextField,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Share, 
  Bookmark, 
  BookmarkBorder, 
  Tag,
  School,
  Description,
  History
} from '@mui/icons-material';

const NoteViewPage = () => {
  const [value, setValue] = useState(0);
  const [favorite, setFavorite] = useState(false);
  
  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };
  
  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  // Mock data
  const note = {
    id: 1,
    title: 'Quantum Mechanics: Wave Functions',
    content: `
# Wave Functions in Quantum Mechanics

A wave function in quantum mechanics is a description of the quantum state of a system. The wave function is a complex-valued probability amplitude, and the probabilities for the possible results of measurements made on the system can be derived from it.

## The Schrödinger Equation

The time evolution of quantum systems is governed by the Schrödinger equation:

$$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)$$

where:
- $\\Psi(\\mathbf{r},t)$ is the wave function
- $i$ is the imaginary unit
- $\\hbar$ is the reduced Planck constant
- $\\hat{H}$ is the Hamiltonian operator

### Properties of Wave Functions

1. **Normalization**: The probability of finding the particle somewhere in space must be 1:
   $$\\int_{-\\infty}^{\\infty} |\\Psi(x)|^2 dx = 1$$

2. **Superposition**: Wave functions can be superposed to form new valid wave functions.

3. **Collapse**: Upon measurement, the wave function collapses to a single eigenstate.

## Examples

### The Infinite Square Well

The solutions to the infinite square well problem are:

$$\\Psi_n(x) = \\sqrt{\\frac{2}{L}}\\sin\\left(\\frac{n\\pi x}{L}\\right)$$

where $L$ is the width of the well and $n$ is a positive integer.

### The Hydrogen Atom

The wave functions for the hydrogen atom are more complex and involve spherical harmonics.
    `,
    date: 'May 15, 2024',
    tags: ['Physics', 'Advanced', 'Quantum Mechanics'],
    aiSummary: 'Wave functions describe the quantum state of a particle in quantum mechanics. They are complex-valued functions whose squared magnitude represents probability density. The Schrödinger equation governs their time evolution, and they exhibit properties like normalization, superposition, and collapse upon measurement.',
    relatedNotes: [
      { id: 6, title: 'Statistical Mechanics: Entropy' },
      { id: 7, title: 'Quantum Tunneling Effects' },
      { id: 8, title: 'Heisenberg Uncertainty Principle' }
    ]
  };

  const flashcards = [
    { 
      id: 1, 
      front: 'What is a wave function in quantum mechanics?', 
      back: 'A description of the quantum state of a system. It is a complex-valued probability amplitude from which the probabilities for possible measurements can be derived.' 
    },
    { 
      id: 2, 
      front: 'What does the Schrödinger equation describe?', 
      back: 'The time evolution of quantum systems.' 
    },
    { 
      id: 3, 
      front: 'What are the three key properties of wave functions?', 
      back: 'Normalization, superposition, and collapse upon measurement.' 
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">{note.title}</Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={toggleFavorite} sx={{ color: favorite ? 'orange' : 'inherit' }}>
            {favorite ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>
          
          <Button 
            variant="outlined" 
            startIcon={<Edit />}
            sx={{ 
              borderColor: 'rgba(0, 0, 0, 0.23)', 
              color: 'text.primary',
              textTransform: 'none' 
            }}
          >
            Edit
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<Share />}
            sx={{ 
              borderColor: 'rgba(0, 0, 0, 0.23)', 
              color: 'text.primary',
              textTransform: 'none' 
            }}
          >
            Share
          </Button>
          
          <IconButton color="error">
            <Delete />
          </IconButton>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 0, 
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
              mb: 3
            }}
          >
            <Tabs 
              value={value} 
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Note" />
              <Tab label="AI Summary" />
              <Tab label="Flashcards" />
              <Tab label="History" />
            </Tabs>
            
            <Box sx={{ p: 4 }}>
              {value === 0 && (
                <Box sx={{ fontFamily: 'serif' }}>
                  <Typography variant="body1" dangerouslySetInnerHTML={{ __html: note.content.replace(/\n/g, '<br>') }} />
                </Box>
              )}
              
              {value === 1 && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>AI-Generated Summary</Typography>
                  <Typography variant="body1">{note.aiSummary}</Typography>
                  
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>Key Concepts</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label="Wave Function" />
                      <Chip label="Schrödinger Equation" />
                      <Chip label="Probability Amplitude" />
                      <Chip label="Superposition" />
                      <Chip label="Quantum State" />
                    </Box>
                  </Box>
                </Box>
              )}
              
              {value === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold">Flashcards</Typography>
                    <Button 
                      variant="contained" 
                      startIcon={<School />}
                      size="small"
                      sx={{ 
                        backgroundColor: '#3182ce',
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor: '#2b6cb0',
                          boxShadow: 'none',
                        }
                      }}
                    >
                      Export to Anki
                    </Button>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {flashcards.map((card) => (
                      <Grid item xs={12} key={card.id}>
                        <Card 
                          elevation={0} 
                          sx={{ 
                            borderRadius: 2,
                            border: '1px solid rgba(0, 0, 0, 0.08)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              {card.front}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                              {card.back}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                    
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 3, 
                        borderRadius: 2, 
                        border: '1px dashed rgba(0, 0, 0, 0.23)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Button 
                          variant="text" 
                          sx={{ 
                            color: 'primary.main',
                            textTransform: 'none' 
                          }}
                        >
                          + Add New Flashcard
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {value === 3 && (
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Note History</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        <History />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">Created</Typography>
                        <Typography variant="body2" color="text.secondary">May 15, 2024 • 10:32 AM</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        <Edit />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">Edited</Typography>
                        <Typography variant="body2" color="text.secondary">May 15, 2024 • 2:45 PM</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box 
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        <Description />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">AI Summary Generated</Typography>
                        <Typography variant="body2" color="text.secondary">May 15, 2024 • 2:50 PM</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {note.tags.map((tag) => (
                  <Chip 
                    key={tag}
                    label={tag}
                    icon={<Tag />}
                    variant="outlined"
                    sx={{ margin: '4px 0' }}
                  />
                ))}
                <Chip 
                  label="+ Add Tag"
                  variant="outlined"
                  sx={{ 
                    borderStyle: 'dashed',
                    margin: '4px 0'
                  }}
                />
              </Box>
            </Paper>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Related Notes
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {note.relatedNotes.map((related) => (
                  <Box 
                    key={related.id}
                    sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <Typography variant="subtitle2">{related.title}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NoteViewPage; 