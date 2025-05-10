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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
// Removed getNotes import as it's not used in the provided code.
// If it's used elsewhere or intended to be, you can add it back.
// import { getNotes } from '../utils/storage';

const FlashcardsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState('all');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [decks, setDecks] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [viewingDeck, setViewingDeck] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [currentStudySession, setCurrentStudySession] = useState(null);
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    deck: '',
    tags: []
  });
  const [currentTag, setCurrentTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Check if we're starting a study session from a note
    const storedStudySession = localStorage.getItem('currentStudySession');
    if (storedStudySession) {
      const session = JSON.parse(storedStudySession);
      if (session.source === 'note') {
        setCurrentStudySession(session);
        setStudyMode(true);
        setFlashcards(session.flashcards);
        // Clear the stored session
        localStorage.removeItem('currentStudySession');
        return; // Exit early to prevent loading all flashcards
      }
    }

    // Only load all flashcards if we're not in a note study session
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

    // Convert the unique flashcards map to an array
    const allFlashcards = Array.from(uniqueFlashcards.values());

    // Set decks and flashcards
    setDecks([
      { 
        id: 'all', 
        name: 'All Decks', 
        count: allFlashcards.length,
        cards: allFlashcards
      },
      ...Object.keys(deckMap).map(deck => ({ 
        id: deck, 
        name: deck, 
        count: deckMap[deck].length,
        cards: deckMap[deck]
      })).sort((a, b) => a.name.localeCompare(b.name))
    ]);
    
    // Set all flashcards
    setFlashcards(allFlashcards);
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
    setCurrentCardIndex((currentCardIndex + 1) % filteredFlashcards.length);
  };

  const handlePrevCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex((currentCardIndex - 1 + filteredFlashcards.length) % filteredFlashcards.length);
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
    setCurrentStudySession(null);
  };

  const handleViewDeck = (deckId) => {
    setSelectedDeck(deckId);
    setActiveTab(0); // Switch to All Flashcards tab
    setViewingDeck(deckId); // Note: viewingDeck state is set but not directly used for rendering logic afterwards.
  };

  const handleStudyDeck = (deckId) => {
    setSelectedDeck(deckId);
    setStudyMode(true);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setViewingDeck(deckId); // Note: viewingDeck state is set but not directly used for rendering logic afterwards.
  };

  const filteredFlashcards = currentStudySession 
    ? currentStudySession.flashcards 
    : selectedDeck === 'all' 
      ? flashcards.filter(card => 
          card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.deck.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : flashcards.filter(card => 
          card.deck === selectedDeck && (
            card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
            card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        );

  // Current card in study mode
  const currentCard = filteredFlashcards[currentCardIndex];

  const filteredDecks = decks.filter(deck => 
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToAnki = () => {
    // Filter flashcards based on selected deck
    const cardsToExport = selectedDeck === 'all'
      ? flashcards
      : flashcards.filter(card => card.deck === selectedDeck);

    // Convert to Anki format (tab-separated values)
    const ankiContent = cardsToExport.map(card => {
      // Anki format: Front\tBack\tTags
      return `${card.front}\t${card.back}\t${card.tags.join(' ')}`;
    }).join('\n');

    // Create blob and download
    const blob = new Blob([ankiContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anki_export_${selectedDeck === 'all' ? 'all_decks' : selectedDeck}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }; // <<< FIXED: Added missing closing brace

  const handleCreateFlashcard = () => {
    if (!newCard.front || !newCard.back || !newCard.deck) return;

    const card = {
      id: Date.now() + Math.random(), // Using Math.random for ID might not guarantee uniqueness in rapid creation
      ...newCard,
      tags: newCard.tags || []
    };

    // Update localStorage
    const existingFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    localStorage.setItem('flashcards', JSON.stringify([...existingFlashcards, card]));

    // Update state
    setFlashcards(prev => [...prev, card]);

    // Update decks if needed
    if (!decks.some(d => d.id === card.deck)) {
      setDecks(prev => [...prev, { id: card.deck, name: card.deck, count: 1 }]);
    } else {
      setDecks(prev => prev.map(d =>
        d.id === card.deck ? { ...d, count: d.count + 1 } : d
      ));
    }

    // Reset form and close dialog
    setNewCard({ front: '', back: '', deck: '', tags: [] });
    setCurrentTag('');
    setCreateDialogOpen(false);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !newCard.tags.includes(currentTag.trim())) {
      setNewCard(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewCard(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }; // <<< FIXED: Added missing closing brace

  // Add check for empty deck in study mode
  if (studyMode && (!filteredFlashcards.length || !currentCard)) {
    return (
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
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No flashcards available in this deck.
          </Typography>
          <Button
            variant="contained"
            onClick={endStudyMode}
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
            Return to Decks
          </Button>
        </Box>
      </Box>
    );
  }

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
                disabled={flashcards.length === 0} // Disable study mode if no flashcards at all
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
                onClick={() => setCreateDialogOpen(true)}
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

          {/* Create Flashcard Dialog */}
          <Dialog
            open={createDialogOpen}
            onClose={() => setCreateDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Create New Flashcard</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Front"
                  multiline
                  rows={3}
                  value={newCard.front}
                  onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
                  placeholder="Enter the question or term"
                />
                <TextField
                  label="Back"
                  multiline
                  rows={3}
                  value={newCard.back}
                  onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
                  placeholder="Enter the answer or definition"
                />
                <TextField // Changed to TextField for creating new decks on the fly
                  label="Deck"
                  value={newCard.deck}
                  onChange={(e) => setNewCard(prev => ({ ...prev, deck: e.target.value }))}
                  placeholder="Enter deck name (e.g., React Basics)"
                />
                {/* Original Select for existing decks - you might want a way to choose OR create a new deck
                <FormControl fullWidth>
                  <InputLabel>Deck</InputLabel>
                  <Select
                    value={newCard.deck}
                    onChange={(e) => setNewCard(prev => ({ ...prev, deck: e.target.value }))}
                    label="Deck"
                  >
                    {decks.filter(d => d.id !== 'all').map((deck) => (
                      <MenuItem key={deck.id} value={deck.id}>{deck.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                */}
                <Box>
                  <TextField
                    label="Add Tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Press Enter to add tags"
                    fullWidth
                  />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {newCard.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={handleCreateFlashcard}
                disabled={!newCard.front || !newCard.back || !newCard.deck}
              >
                Create
              </Button>
            </DialogActions>
          </Dialog>

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
                placeholder="Search flashcards and decks..."
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

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                  onClick={exportToAnki}
                  disabled={filteredFlashcards.length === 0}
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
            <>
              {filteredFlashcards.length === 0 && selectedDeck === 'all' && (
                <Typography sx={{ textAlign: 'center', p: 3 }}>
                  No flashcards yet. Click "Create Flashcard" to get started!
                </Typography>
              )}
              {filteredFlashcards.length === 0 && selectedDeck !== 'all' && (
                <Typography sx={{ textAlign: 'center', p: 3 }}>
                  No flashcards in this deck.
                </Typography>
              )}
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
                          <IconButton size="small"> {/* Add Menu for Edit/Delete here */}
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>

                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, wordBreak: 'break-word' }}>
                          {card.front}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body2" color="text.secondary" sx={{wordBreak: 'break-word'}}>
                          {card.back}
                        </Typography>
                      </CardContent>

                      <Box sx={{
                        p: 2,
                        pt: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center', // Align items for better layout
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
                          <IconButton size="small" title="Edit"> {/* Add onClick handlers */}
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" title="Copy"> {/* Add onClick handlers */}
                            <ContentCopy fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" title="Delete"> {/* Add onClick handlers */}
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              {filteredDecks.length === 0 && (
                <Typography sx={{ textAlign: 'center', p: 3, width: '100%' }}>
                  {searchQuery ? 'No decks found matching your search.' : 'No decks created yet. Flashcards will appear in decks once created.'}
                </Typography>
              )}
              {filteredDecks.map((deck) => (
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
                    <Box sx={{ mt: 'auto', p:2, pt:0, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDeck(deck.id)}
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
                        onClick={() => handleStudyDeck(deck.id)}
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
            </Grid>
          )}
          {activeTab === 2 && (
            <Box sx={{p: 3, textAlign: 'center'}}>
              <Typography variant="h6" color="text.secondary">"Recent" tab content goes here.</Typography>
              <Typography color="text.secondary">This feature is not yet implemented.</Typography>
            </Box>
          )}
        </>
      ) : (
        <Box>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" fontWeight="bold">
              {currentStudySession ? `Study Mode - ${currentStudySession.noteTitle}` : 'Study Mode'}
            </Typography>
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
              Card {currentCardIndex + 1} of {filteredFlashcards.length}
            </Typography>

            <Card
              elevation={0}
              onClick={toggleAnswer}
              sx={{
                width: '100%',
                maxWidth: 600,
                minHeight: 300, // Use minHeight to allow content to expand
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
                variant={showAnswer ? 'h6' : 'h5'} // Adjusted variant for potentially longer answers
                fontWeight={showAnswer ? 'normal' : 'bold'}
                align="center"
                sx={{wordBreak: 'break-word'}}
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
                disabled={filteredFlashcards.length <= 1}
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
                disabled={filteredFlashcards.length <= 1}
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