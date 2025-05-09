import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Divider, 
  IconButton, 
  Paper,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Chip
} from '@mui/material';
import { 
  School, 
  FilterList, 
  MoreVert, 
  ContentCopy, 
  Delete, 
  Edit,
  Search,
  ArrowBack,
  ArrowForward,
  Refresh,
  Download,
  Add
} from '@mui/icons-material';
import { getNotes } from '../utils/storage';

const FlashcardsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [decks, setDecks] = useState([]);
  const [flashcards, setFlashcards] = useState([]);

  useEffect(() => {
    // Fetch flashcards from localStorage
    const storedFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    
    // Create a map to track unique flashcards by their content
    const uniqueFlashcards = new Map();
    const deckMap = {};
    
    // Process flashcards to remove duplicates
    storedFlashcards.forEach(card => {
      // Create a unique key based on front and back content
      const contentKey = `${card.front}-${card.back}`;
      
      if (!uniqueFlashcards.has(contentKey)) {
        // If this is a new unique flashcard, add it to our maps
        uniqueFlashcards.set(contentKey, card);
        
        // Add to deck map
        if (!deckMap[card.deck]) {
          deckMap[card.deck] = [];
        }
        deckMap[card.deck].push(card);
      } else {
        // If this is a duplicate, merge the tags with the existing card
        const existingCard = uniqueFlashcards.get(contentKey);
        const mergedTags = [...new Set([...existingCard.tags, ...card.tags])];
        existingCard.tags = mergedTags;
      }
    });

    // Set decks and flashcards
    setDecks([
      { id: 'all', name: 'All Decks', count: uniqueFlashcards.size },
      ...Object.keys(deckMap).map(deck => ({ 
        id: deck, 
        name: deck, 
        count: deckMap[deck].length 
      })).sort((a, b) => a.name.localeCompare(b.name))
    ]);
    
    // Convert the unique flashcards map to an array
    setFlashcards(Array.from(uniqueFlashcards.values()));
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  const handleNextCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex((currentCardIndex + 1) % flashcards.length);
  };
  
  const handlePrevCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex((currentCardIndex - 1 + flashcards.length) % flashcards.length);
  };
  
  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };
  
  const startStudyMode = () => {
    setStudyMode(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };
  
  const endStudyMode = () => {
    setStudyMode(false);
  };

  const filteredFlashcards = selectedDeck === 'all' 
    ? flashcards 
    : flashcards.filter(card => card.deck === selectedDeck);
  
  // Current card in study mode
  const currentCard = flashcards[currentCardIndex];

  return (
    <Box>
      {!studyMode ? (
        <>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" fontWeight="bold">Flashcards</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<School />}
                onClick={startStudyMode}
                sx={{ 
                  borderColor: 'rgba(0, 0, 0, 0.23)', 
                  color: 'text.primary',
                  textTransform: 'none' 
                }}
              >
                Study Mode
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                sx={{ 
                  backgroundColor: '#3182ce',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#2b6cb0',
                    boxShadow: 'none',
                  }
                }}
              >
                Create Flashcard
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
              <Tab label="All Flashcards" />
              <Tab label="My Decks" />
              <Tab label="Recent" />
            </Tabs>
            
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                placeholder="Search flashcards..."
                variant="outlined"
                size="small"
                sx={{ width: { xs: '100%', sm: '300px' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Deck</InputLabel>
                  <Select
                    value={selectedDeck}
                    onChange={(e) => setSelectedDeck(e.target.value)}
                    label="Deck"
                  >
                    <MenuItem value="all">All Decks</MenuItem>
                    {decks.map((deck) => (
                      <MenuItem key={deck.id} value={deck.id}>{deck.name} ({deck.count})</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button 
                  variant="outlined" 
                  startIcon={<FilterList />}
                  onClick={handleFilterClick}
                  size="small"
                  sx={{ 
                    borderColor: 'rgba(0, 0, 0, 0.12)', 
                    color: 'text.primary',
                    textTransform: 'none' 
                  }}
                >
                  Filter
                </Button>
                <Menu
                  anchorEl={filterAnchorEl}
                  open={Boolean(filterAnchorEl)}
                  onClose={handleFilterClose}
                >
                  <MenuItem>Recently Added</MenuItem>
                  <MenuItem>Alphabetical</MenuItem>
                  <MenuItem>By Deck</MenuItem>
                </Menu>
                
                <Button 
                  variant="outlined" 
                  startIcon={<Download />}
                  size="small"
                  sx={{ 
                    borderColor: 'rgba(0, 0, 0, 0.12)', 
                    color: 'text.primary',
                    textTransform: 'none' 
                  }}
                >
                  Export to Anki
                </Button>
              </Box>
            </Box>
          </Paper>
          
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {filteredFlashcards.map((card) => (
                <Grid item xs={12} sm={6} md={4} key={card.id}>
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
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, pb: 2, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography 
                          variant="caption" 
                          color="primary" 
                          sx={{ 
                            p: 0.5, 
                            px: 1, 
                            borderRadius: 1, 
                            bgcolor: 'primary.light', 
                            display: 'inline-block', 
                            mb: 1 
                          }}
                        >
                          {card.deck}
                        </Typography>
                        <IconButton size="small">
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                        {card.front}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="body2" color="text.secondary">
                        {card.back}
                      </Typography>
                    </CardContent>
                    
                    <Box sx={{ 
                      p: 2, 
                      pt: 0, 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mt: 'auto'
                    }}>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {card.tags.map((tag, index) => (
                          <Chip 
                            key={index}
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
                      
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <ContentCopy fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          {activeTab === 1 && (
            <Grid container spacing={3}>
              {decks.map((deck) => (
                <Grid item xs={12} sm={6} md={3} key={deck.id}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      borderRadius: 2,
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          {deck.name}
                        </Typography>
                        <School sx={{ color: 'primary.main' }} />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {deck.count} flashcards
                      </Typography>
                      
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small"
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
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: 2,
                    border: '1px dashed rgba(0, 0, 0, 0.23)',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      cursor: 'pointer'
                    }
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <IconButton 
                      sx={{ 
                        mb: 1, 
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.light',
                        }
                      }}
                    >
                      <Add />
                    </IconButton>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Create New Deck
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      ) : (
        <Box>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" fontWeight="bold">Study Mode</Typography>
            <Button 
              variant="outlined" 
              onClick={endStudyMode}
              sx={{ 
                borderColor: 'rgba(0, 0, 0, 0.23)', 
                color: 'text.primary',
                textTransform: 'none' 
              }}
            >
              Exit Study Mode
            </Button>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 4
          }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              Card {currentCardIndex + 1} of {flashcards.length}
            </Typography>
            
            <Card 
              elevation={0} 
              onClick={toggleAnswer}
              sx={{ 
                width: '100%',
                maxWidth: 600,
                height: 300,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                p: 4,
                mb: 3,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Typography 
                variant={showAnswer ? 'body1' : 'h5'} 
                fontWeight={showAnswer ? 'normal' : 'bold'}
                align="center"
              >
                {showAnswer ? currentCard.back : currentCard.front}
              </Typography>
              
              {!showAnswer && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mt: 3, fontStyle: 'italic' }}
                >
                  Click to reveal answer
                </Typography>
              )}
            </Card>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
              <Button 
                variant="outlined" 
                startIcon={<ArrowBack />}
                onClick={handlePrevCard}
                sx={{ 
                  borderColor: 'rgba(0, 0, 0, 0.23)', 
                  color: 'text.primary',
                  textTransform: 'none' 
                }}
              >
                Previous
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<Refresh />}
                onClick={() => setShowAnswer(false)}
                sx={{ 
                  borderColor: 'rgba(0, 0, 0, 0.23)', 
                  color: 'text.primary',
                  textTransform: 'none' 
                }}
              >
                Reset
              </Button>
              <Button 
                variant="contained" 
                endIcon={<ArrowForward />}
                onClick={handleNextCard}
                sx={{ 
                  backgroundColor: '#3182ce',
                  boxShadow: 'none',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#2b6cb0',
                    boxShadow: 'none',
                  }
                }}
              >
                Next
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              Studying from deck: <strong>{currentCard.deck}</strong>
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default FlashcardsPage; 