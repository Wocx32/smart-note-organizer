import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  DialogActions,
  Snackbar,
  Alert
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [currentFilter, setCurrentFilter] = useState('all');
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    // Check for ?study=1 in the URL or studyMode in localStorage
    const params = new URLSearchParams(location.search);
    const studyParam = params.get('study');
    const studyModeFlag = localStorage.getItem('studyMode');
    if (studyParam === '1' || studyModeFlag === 'true') {
      setStudyMode(true);
      setCurrentCardIndex(0);
      setShowAnswer(false);
      localStorage.removeItem('studyMode');
    }

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
  }, [location.search]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterSelect = (filter) => {
    setCurrentFilter(filter);
    handleFilterClose();
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
    setCurrentCardIndex(0);
    setShowAnswer(false);
    localStorage.removeItem('studyMode');
    localStorage.removeItem('currentStudySession');
    // Reload flashcards from localStorage
    const savedFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    setFlashcards(savedFlashcards);
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

  const getFilteredFlashcards = () => {
    let filtered = flashcards;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(card => 
        card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.deck.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply deck filter
    if (selectedDeck !== 'all') {
      filtered = filtered.filter(card => card.deck === selectedDeck);
    }

    // Apply additional filters
    switch (currentFilter) {
      case 'recent':
        filtered = [...filtered].sort((a, b) => b.id - a.id);
        break;
      case 'alphabetical':
        filtered = [...filtered].sort((a, b) => a.front.localeCompare(b.front));
        break;
      case 'byDeck':
        filtered = [...filtered].sort((a, b) => a.deck.localeCompare(b.deck));
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredFlashcards = currentStudySession 
    ? currentStudySession.flashcards 
    : getFilteredFlashcards();

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

  const handleDeleteClick = (card) => {
    setCardToDelete(card);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (cardToDelete) {
      // Remove the card from localStorage
      const existingFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
      const updatedFlashcards = existingFlashcards.filter(card =>
        !(card.front === cardToDelete.front && card.back === cardToDelete.back)
      );
      localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards));

      // Update state
      setFlashcards(prev => prev.filter(card =>
        !(card.front === cardToDelete.front && card.back === cardToDelete.back)
      ));

      // Update decks
      setDecks(prev => prev.map(deck => {
        if (deck.id === 'all') {
          return {
            ...deck,
            count: deck.count - 1,
            cards: deck.cards.filter(card =>
              !(card.front === cardToDelete.front && card.back === cardToDelete.back)
            )
          };
        }
        if (deck.id === cardToDelete.deck) {
          return {
            ...deck,
            count: deck.count - 1,
            cards: deck.cards.filter(card =>
              !(card.front === cardToDelete.front && card.back === cardToDelete.back)
            )
          };
        }
        return deck;
      }));

      setDeleteDialogOpen(false);
      setCardToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCardToDelete(null);
  };

  const handleEditClick = (card) => {
    setEditingCard(card);
    setNewCard({
      front: card.front,
      back: card.back,
      deck: card.deck,
      tags: [...card.tags]
    });
    setEditDialogOpen(true);
  };

  const handleCopyClick = (card) => {
    const textToCopy = `Front: ${card.front}\nBack: ${card.back}\nDeck: ${card.deck}\nTags: ${card.tags.join(', ')}`;
    navigator.clipboard.writeText(textToCopy);
    setSnackbar({
      open: true,
      message: 'Flashcard copied to clipboard!',
      severity: 'success'
    });
  };

  const handleEditSave = () => {
    if (!editingCard || !newCard.front || !newCard.back || !newCard.deck) return;

    // Update localStorage
    const existingFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    const updatedFlashcards = existingFlashcards.map(card =>
      card.id === editingCard.id ? { ...card, ...newCard } : card
    );
    localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards));

    // Update state
    setFlashcards(prev => prev.map(card =>
      card.id === editingCard.id ? { ...card, ...newCard } : card
    ));

    // Update decks
    setDecks(prev => prev.map(deck => {
      if (deck.id === 'all') {
        return {
          ...deck,
          cards: deck.cards.map(card =>
            card.id === editingCard.id ? { ...card, ...newCard } : card
          )
        };
      }
      if (deck.id === editingCard.deck || deck.id === newCard.deck) {
        return {
          ...deck,
          cards: deck.cards.filter(card => card.id !== editingCard.id)
        };
      }
      return deck;
    }));

    // Reset form and close dialog
    setEditingCard(null);
    setNewCard({ front: '', back: '', deck: '', tags: [] });
    setEditDialogOpen(false);
    setSnackbar({
      open: true,
      message: 'Flashcard updated successfully!',
      severity: 'success'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleMenuOpen = (event, card) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedCard(card);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedCard(null);
  };

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

  // Add a shuffle function
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  return (
    <Box>
      {!studyMode ? (
        <>
          <Box sx={{ 
            mb: { xs: 2, sm: 4 }, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'center', sm: 'center' }, 
            gap: { xs: 2, sm: 0 } 
          }}>
            <Typography variant="h4" fontWeight="bold" sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem' },
              textAlign: { xs: 'center', sm: 'left' },
              width: { xs: '100%', sm: 'auto' }
            }}>Flashcards</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="outlined"
                startIcon={<School sx={{ fontSize: { xs: 20, sm: 24 } }} />}
                onClick={startStudyMode}
                disabled={flashcards.length === 0}
                sx={{
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 2, sm: 2.5 },
                  borderRadius: '50px',
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Study Mode
              </Button>
              <Button
                variant="contained"
                startIcon={<Add sx={{ fontSize: { xs: 20, sm: 24 } }} />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  backgroundColor: '#3182ce',
                  boxShadow: 'none',
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  py: { xs: 1, sm: 1.5 },
                  px: { xs: 2, sm: 2.5 },
                  borderRadius: '50px',
                  width: { xs: '100%', sm: 'auto' },
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
              mb: { xs: 2, sm: 4 },
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
                px: { xs: 1, sm: 2 },
                '& .MuiTab-root': {
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  minWidth: { xs: 'auto', sm: '160px' },
                  px: { xs: 1, sm: 2 }
                }
              }}
            >
              <Tab label="All Flashcards" />
              <Tab label="My Decks" />
              <Tab label="Recent" />
            </Tabs>

            <Box sx={{ p: { xs: 1, sm: 2 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'stretch', justifyContent: 'space-between', gap: 2 }}>
              <TextField
                placeholder="Search flashcards and decks..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                  width: { xs: '100%', sm: '500px' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px',
                    height: { xs: '40px', sm: '48px' }
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList sx={{ fontSize: { xs: 20, sm: 24 } }} />}
                  onClick={handleFilterClick}
                  sx={{
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                    color: 'text.primary',
                    textTransform: 'none',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 2, sm: 2.5 },
                    borderRadius: '50px',
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Filter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Download sx={{ fontSize: { xs: 20, sm: 24 } }} />}
                  onClick={exportToAnki}
                  disabled={filteredFlashcards.length === 0}
                  sx={{
                    borderColor: 'rgba(0, 0, 0, 0.23)',
                    color: 'text.primary',
                    textTransform: 'none',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    py: { xs: 1, sm: 1.5 },
                    px: { xs: 2, sm: 2.5 },
                    borderRadius: '50px',
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Export
                </Button>
              </Box>
            </Box>
          </Paper>

          {activeTab === 0 && (
            <>
              {filteredFlashcards.length === 0 && selectedDeck === 'all' && (
                <Typography sx={{ textAlign: 'center', p: { xs: 2, sm: 3 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  No flashcards yet. Click "Create Flashcard" to get started!
                </Typography>
              )}
              {filteredFlashcards.length === 0 && selectedDeck !== 'all' && (
                <Typography sx={{ textAlign: 'center', p: { xs: 2, sm: 3 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                  No flashcards in this deck.
                </Typography>
              )}
              <Grid container spacing={{ xs: 2, sm: 3 }}>
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
                      <CardContent sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 }, flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              p: 0.5,
                              px: 1,
                              borderRadius: 1,
                              backgroundColor: '#3182ce',
                              color: 'white',
                              fontSize: { xs: '0.8rem', sm: '0.9rem' },
                              fontWeight: 200,
                              display: 'inline-block',
                              mb: 1
                            }}
                          >
                            {card.deck}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, card)}
                            sx={{ p: { xs: 0.5, sm: 1 } }}
                          >
                            <MoreVert sx={{ fontSize: { xs: 20, sm: 24 } }} />
                          </IconButton>
                        </Box>

                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ mb: { xs: 1, sm: 2 }, wordBreak: 'break-word', fontSize: { xs: '1rem', sm: '1.1rem' } }}
                        >
                          {card.front}
                        </Typography>

                        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

                        <Typography variant="body1" color="text.secondary" sx={{ wordBreak: 'break-word', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                          {card.back}
                        </Typography>
                      </CardContent>

                      <Box sx={{
                        p: { xs: 1.5, sm: 2 },
                        pt: 0,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        mt: 'auto'
                      }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {card.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              sx={{
                                height: { xs: 24, sm: 28 },
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                backgroundColor: 'rgba(0,0,0,0.06)'
                              }}
                            />
                          ))}
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
                <Grid item xs={12} sm={6} md={4} key={deck.id}>
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
                    <Box sx={{ mt: 'auto', p: 2, pt: 0, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewDeck(deck.id)}
                        sx={{
                          minWidth: '80px',
                          borderColor: 'rgba(0, 0, 0, 0.23)',
                          color: 'text.primary',
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          py: 1,
                          px: 1.5
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
                          minWidth: '80px',
                          backgroundColor: '#3182ce',
                          boxShadow: 'none',
                          textTransform: 'none',
                          fontSize: '0.9rem',
                          py: 1,
                          px: 1.5,
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
          <Box sx={{ 
            mb: { xs: 2, sm: 4 }, 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: { xs: 'space-between', sm: 'center' }, 
            alignItems: { xs: 'center', sm: 'center' }, 
            gap: { xs: 2, sm: 0 },
            position: 'relative'
          }}>
            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '1.2rem', sm: '2rem' }, 
                textAlign: { xs: 'center', sm: 'center' }, 
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              {currentStudySession ? `Study Mode - ${currentStudySession.noteTitle}` : 'Study Mode'}
            </Typography>
            <Button
              variant="outlined"
              onClick={endStudyMode}
              sx={{
                borderColor: 'rgba(0, 0, 0, 0.23)',
                color: 'text.primary',
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' },
                mt: { xs: 1, sm: 0 },
                position: { sm: 'absolute' },
                right: { sm: 0 }
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
            py: { xs: 2, sm: 4 },
            px: { xs: 1, sm: 0 }
          }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.1rem' }, textAlign: 'center' }}>
              Card {currentCardIndex + 1} of {filteredFlashcards.length}
            </Typography>

            <Card
              elevation={0}
              onClick={toggleAnswer}
              sx={{
                width: '100%',
                maxWidth: 600,
                minHeight: { xs: 180, sm: 300 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                p: { xs: 2, sm: 4 },
                mb: { xs: 2, sm: 3 },
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Typography
                variant={showAnswer ? 'h5' : 'h4'}
                fontWeight={showAnswer ? 'normal' : 'bold'}
                align="center"
                sx={{ wordBreak: 'break-word', fontSize: showAnswer ? { xs: '1.1rem', sm: '1.5rem' } : { xs: '1.3rem', sm: '1.75rem' } }}
              >
                {showAnswer ? currentCard.back : currentCard.front}
              </Typography>

              {!showAnswer && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 3, fontStyle: 'italic', fontSize: { xs: '0.95rem', sm: '1rem' } }}
                >
                  Tap to reveal answer
                </Typography>
              )}
            </Card>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              justifyContent: 'center', 
              gap: 2, 
              mb: { xs: 2, sm: 4 }, 
              width: { xs: '100%', sm: 'auto' } 
            }}>
              <Button
                variant="contained"
                endIcon={<ArrowForward sx={{ fontSize: 24 }} />}
                onClick={handleNextCard}
                disabled={filteredFlashcards.length <= 1}
                sx={{
                  backgroundColor: '#3182ce',
                  boxShadow: 'none',
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 1.5,
                  px: 2.5,
                  width: { xs: '100%', sm: 'auto' },
                  order: { xs: 1, sm: 3 },
                  '&:hover': {
                    backgroundColor: '#2b6cb0',
                    boxShadow: 'none',
                  }
                }}
              >
                Next
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBack sx={{ fontSize: 24 }} />}
                onClick={handlePrevCard}
                disabled={filteredFlashcards.length <= 1}
                sx={{
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 1.5,
                  px: 2.5,
                  width: { xs: '100%', sm: 'auto' },
                  order: { xs: 2, sm: 1 }
                }}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                startIcon={<Refresh sx={{ fontSize: 24 }} />}
                onClick={() => setShowAnswer(false)}
                sx={{
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 1.5,
                  px: 2.5,
                  width: { xs: '100%', sm: 'auto' },
                  order: { xs: 3, sm: 2 }
                }}
              >
                Reset
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' }, mb: { xs: 1, sm: 0 } }}>
                Studying from deck:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 80, m: 0, width: { xs: '100%', sm: 'auto' } }}>
                <Select
                  value={selectedDeck}
                  onChange={e => {
                    setSelectedDeck(e.target.value);
                    setCurrentCardIndex(0);
                    setShowAnswer(false);
                    setCurrentStudySession(null);
                    if (e.target.value === 'all') {
                      setFlashcards(shuffle(
                        decks.find(deck => deck.id === 'all')?.cards || []
                      ));
                    } else {
                      setFlashcards(
                        decks.find(deck => deck.id === e.target.value)?.cards || []
                      );
                    }
                  }}
                  displayEmpty
                  sx={{ fontSize: '1rem', borderRadius: 2 }}
                  fullWidth={true}
                >
                  <MenuItem value="all">All</MenuItem>
                  {decks.filter(deck => deck.id !== 'all').map(deck => (
                    <MenuItem key={deck.id} value={deck.id}>{deck.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>
      )}

      {/* Add Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Flashcard</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this flashcard? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Flashcard Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingCard(null);
          setNewCard({ front: '', back: '', deck: '', tags: [] });
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Flashcard</DialogTitle>
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
            <TextField
              label="Deck"
              value={newCard.deck}
              onChange={(e) => setNewCard(prev => ({ ...prev, deck: e.target.value }))}
              placeholder="Enter deck name"
            />
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
                    size="medium"
                    sx={{
                      height: 28,
                      fontSize: '0.9rem',
                      backgroundColor: 'rgba(0,0,0,0.06)'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialogOpen(false);
            setEditingCard(null);
            setNewCard({ front: '', back: '', deck: '', tags: [] });
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disabled={!newCard.front || !newCard.back || !newCard.deck}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Flashcard Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setNewCard({ front: '', back: '', deck: '', tags: [] });
          setCurrentTag('');
        }}
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
            <TextField
              label="Deck"
              value={newCard.deck}
              onChange={(e) => setNewCard(prev => ({ ...prev, deck: e.target.value }))}
              placeholder="Enter deck name"
            />
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
                    size="medium"
                    sx={{
                      height: 28,
                      fontSize: '0.9rem',
                      backgroundColor: 'rgba(0,0,0,0.06)'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCreateDialogOpen(false);
            setNewCard({ front: '', back: '', deck: '', tags: [] });
            setCurrentTag('');
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateFlashcard}
            disabled={!newCard.front || !newCard.back || !newCard.deck}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

      {/* Card Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 2,
          sx: {
            minWidth: 150,
            '& .MuiMenuItem-root': {
              fontSize: '0.9rem',
              py: 1.5
            }
          }
        }}
      >
        <MenuItem onClick={() => {
          handleEditClick(selectedCard);
          handleMenuClose();
        }}>
          <Edit sx={{ fontSize: 20, mr: 1.5 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleCopyClick(selectedCard);
          handleMenuClose();
        }}>
          <ContentCopy sx={{ fontSize: 20, mr: 1.5 }} />
          Copy
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleDeleteClick(selectedCard);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ fontSize: 20, mr: 1.5 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: { xs: '280px', sm: '220px' },
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            position: 'fixed',
            top: { xs: '50%', sm: 'auto' },
            left: { xs: '50%', sm: 'auto' },
            transform: { xs: 'translate(-50%, -50%)', sm: 'none' }
          }
        }}
      >
        <MenuItem 
          onClick={() => {
            setCurrentFilter('all');
            handleFilterClose();
          }}
          selected={currentFilter === 'all'}
          sx={{ 
            fontSize: { xs: '1rem', sm: '1rem' },
            py: { xs: 1.5, sm: 1.5 },
            justifyContent: 'center'
          }}
        >
          All Flashcards
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setCurrentFilter('recent');
            handleFilterClose();
          }}
          selected={currentFilter === 'recent'}
          sx={{ 
            fontSize: { xs: '1rem', sm: '1rem' },
            py: { xs: 1.5, sm: 1.5 },
            justifyContent: 'center'
          }}
        >
          Most Recent
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setCurrentFilter('alphabetical');
            handleFilterClose();
          }}
          selected={currentFilter === 'alphabetical'}
          sx={{ 
            fontSize: { xs: '1rem', sm: '1rem' },
            py: { xs: 1.5, sm: 1.5 },
            justifyContent: 'center'
          }}
        >
          Alphabetical
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setCurrentFilter('byDeck');
            handleFilterClose();
          }}
          selected={currentFilter === 'byDeck'}
          sx={{ 
            fontSize: { xs: '1rem', sm: '1rem' },
            py: { xs: 1.5, sm: 1.5 },
            justifyContent: 'center'
          }}
        >
          By Deck
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default FlashcardsPage;