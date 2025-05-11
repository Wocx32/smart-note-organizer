import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';
import {
  Search,
  Clear,
  NoteAlt,
  Tag,
  FilterList,
  Description,
  PictureAsPdf,
  School,
  History,
  CleaningServices,
  Tune,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { getNotes } from '../utils/storage';

const MAX_RECENT_SEARCHES = 5;

const SearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    notes: true,
    flashcards: true,
    tags: [],
    dateRange: 'all', // 'all', 'today', 'week', 'month', 'year'
  });

  // Load data from localStorage and location state on component mount
  useEffect(() => {
    // Load recent searches
    const savedSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(savedSearches);

    // Load notes
    const savedNotes = getNotes();
    setNotes(savedNotes);

    // Load flashcards
    const savedFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    setFlashcards(savedFlashcards);

    // Only restore search state if explicitly coming back from a result view
    if (location.state?.fromSearch) {
      setSearchQuery(location.state.searchQuery || '');
      setActiveTab(location.state.activeTab || 0);
      setSelectedTags(location.state.selectedTags || []);
    }
  }, [location.state]);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedTags]);

  const updateRecentSearches = (query) => {
    if (!query.trim()) return;
    
    const updatedSearches = [
      query,
      ...recentSearches.filter(search => search !== query)
    ].slice(0, MAX_RECENT_SEARCHES);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  // Get all unique tags from notes and flashcards
  const allTags = [...new Set([
    ...notes.flatMap(note => note.tags || []),
    ...flashcards.flatMap(card => card.tags || [])
  ])];

  const handleFilterClick = () => {
    setFilterDialogOpen(true);
  };

  const handleFilterClose = () => {
    setFilterDialogOpen(false);
  };

  const handleFilterApply = () => {
    setFilterDialogOpen(false);
    performSearch();
  };

  const handleTagFilterChange = (tag) => {
    setFilterOptions(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleDateRangeChange = (range) => {
    setFilterOptions(prev => ({
      ...prev,
      dateRange: range
    }));
  };

  const performSearch = () => {
    const query = searchQuery.toLowerCase();
    
    // Search in notes
    const noteResults = notes
      .filter(note => {
        if (!filterOptions.notes) return false;

        const matchesQuery = 
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)));

        const matchesTags = filterOptions.tags.length === 0 ||
          (note.tags && filterOptions.tags.every(tag => note.tags.includes(tag)));

        const matchesDate = filterOptions.dateRange === 'all' || (() => {
          const noteDate = new Date(note.date);
          const now = new Date();
          switch (filterOptions.dateRange) {
            case 'today':
              return noteDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date(now.setDate(now.getDate() - 7));
              return noteDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
              return noteDate >= monthAgo;
            case 'year':
              const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
              return noteDate >= yearAgo;
            default:
              return true;
          }
        })();

        return matchesQuery && matchesTags && matchesDate;
      })
      .map(note => ({
        ...note,
        type: 'note'
      }));

    // Search in flashcards
    const flashcardResults = flashcards
      .filter(card => {
        if (!filterOptions.flashcards) return false;

        const matchesQuery = 
          card.front.toLowerCase().includes(query) ||
          card.back.toLowerCase().includes(query) ||
          (card.tags && card.tags.some(tag => tag.toLowerCase().includes(query)));

        const matchesTags = filterOptions.tags.length === 0 ||
          (card.tags && filterOptions.tags.every(tag => card.tags.includes(tag)));

        const matchesDate = filterOptions.dateRange === 'all' || (() => {
          const cardDate = new Date(card.date);
          const now = new Date();
          switch (filterOptions.dateRange) {
            case 'today':
              return cardDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date(now.setDate(now.getDate() - 7));
              return cardDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
              return cardDate >= monthAgo;
            case 'year':
              const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
              return cardDate >= yearAgo;
            default:
              return true;
          }
        })();

        return matchesQuery && matchesTags && matchesDate;
      })
      .map(card => ({
        ...card,
        type: 'flashcard',
        title: card.front,
        summary: card.back
      }));

    // Combine and filter results based on active tab
    let results = [...noteResults, ...flashcardResults];
    
    if (activeTab === 1) {
      results = noteResults;
    } else if (activeTab === 2) {
      results = flashcardResults;
    }

    setSearchResults(results);
  };

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSearchResults([]);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (searchQuery.trim()) {
      performSearch();
    }
  };

  const handleResultClick = (result) => {
    if (searchQuery.trim()) {
      updateRecentSearches(searchQuery);
    }
    if (result.type === 'note') {
      navigate(`/notes/${result.id}`, { 
        state: { 
          fromSearch: true,
          searchQuery: searchQuery,
          activeTab: activeTab,
          selectedTags: selectedTags
        } 
      });
    } else if (result.type === 'flashcard') {
      navigate(`/flashcards/${result.id}`, { 
        state: { 
          fromSearch: true,
          searchQuery: searchQuery,
          activeTab: activeTab,
          selectedTags: selectedTags
        } 
      });
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      performSearch();
      updateRecentSearches(searchQuery);
    }
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2.5rem' }, 
            mb: { xs: 2, sm: 3 },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Search
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 }, 
          mb: { xs: 2, sm: 3 } 
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search across notes, flashcards, and tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchSubmit}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: { xs: 20, sm: 24 } }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} edge="end">
                    <Clear sx={{ fontSize: { xs: 20, sm: 24 } }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '50px',
                height: { xs: '40px', sm: '48px' },
                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                backgroundColor: 'background.paper',
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Button
              variant="outlined"
              startIcon={<Tune sx={{ fontSize: { xs: 20, sm: 24 } }} />}
              onClick={handleFilterClick}
              sx={{
                borderRadius: '50px',
                height: { xs: '40px', sm: '48px' },
                px: { xs: 2, sm: 3 },
                borderColor: 'divider',
                color: 'text.primary',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                flex: { xs: 1, sm: 'none' },
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              Filters
            </Button>
            <Button
              variant="contained"
              startIcon={<Search sx={{ fontSize: { xs: 20, sm: 24 } }} />}
              onClick={() => handleSearchSubmit({ key: 'Enter' })}
              sx={{
                borderRadius: '50px',
                height: { xs: '40px', sm: '48px' },
                px: { xs: 2, sm: 3 },
                backgroundColor: 'primary.main',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                flex: { xs: 1, sm: 'none' },
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Search
            </Button>
          </Box>
        </Box>

        {!searchQuery && recentSearches.length > 0 && (
          <Box sx={{ mb: { xs: 3, sm: 4 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              mb: 2,
              gap: { xs: 1, sm: 0 }
            }}>
              <Typography 
                variant="h6" 
                fontWeight="medium" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                <History sx={{ fontSize: { xs: 20, sm: 24 } }} />
                Recent Searches
              </Typography>
              <Button
                size="small"
                onClick={handleClearHistory}
                startIcon={<CleaningServices sx={{ fontSize: { xs: 18, sm: '1.2rem' } }} />}
                sx={{
                  color: 'error.main',
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  py: 0.5,
                  '&:hover': {
                    backgroundColor: 'error.lighter',
                  }
                }}
              >
                Clear History
              </Button>
            </Box>
            <List>
              {recentSearches.map((search, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => setSearchQuery(search)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    py: { xs: 1, sm: 1.5 },
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Search sx={{ color: 'text.secondary', fontSize: { xs: 20, sm: 24 } }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={search}
                    primaryTypographyProps={{
                      fontSize: { xs: '0.9rem', sm: '1.1rem' },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {searchQuery && (
          <Box>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider', 
                mb: { xs: 2, sm: 3 },
                '& .MuiTab-root': {
                  fontSize: { xs: '0.9rem', sm: '1.1rem' },
                  textTransform: 'none',
                  minWidth: { xs: 100, sm: 120 },
                  px: { xs: 1, sm: 2 }
                }
              }}
            >
              <Tab label="All Results" />
              <Tab label="Notes" />
              <Tab label="Flashcards" />
            </Tabs>

            {searchResults.length > 0 ? (
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {searchResults.map((result) => (
                  <Grid item xs={12} key={result.id}>
                    <Card
                      elevation={0}
                      sx={{
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        },
                      }}
                      onClick={() => handleResultClick(result)}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                          <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                            {result.type === 'note' ? 
                              <NoteAlt sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} /> : 
                              <School sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} />
                            }
                          </ListItemIcon>
                          <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                              fontSize: { xs: '1.1rem', sm: '1.3rem' },
                              wordBreak: 'break-word'
                            }}
                          >
                            {result.title}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ 
                            mb: { xs: 1.5, sm: 2 }, 
                            fontSize: { xs: '0.9rem', sm: '1.1rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {result.summary}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {result.tags && result.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                height: { xs: 20, sm: 24 },
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                backgroundColor: 'rgba(0,0,0,0.06)',
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: { xs: 4, sm: 6 },
                  color: 'text.secondary',
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                    mb: { xs: 1, sm: 2 }
                  }}
                >
                  No results found
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1.1rem' }
                  }}
                >
                  Try adjusting your search or filters
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Dialog
        open={filterDialogOpen}
        onClose={handleFilterClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            m: { xs: 2, sm: 3 }
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Filter Results
        </DialogTitle>
        <DialogContent>
          <Stack spacing={{ xs: 2, sm: 3 }}>
            <Box>
              <Typography 
                variant="subtitle1" 
                fontWeight="medium" 
                gutterBottom
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                Content Type
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.notes}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, notes: e.target.checked }))}
                      size="small"
                    />
                  }
                  label="Notes"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: { xs: '0.9rem', sm: '1rem' } } }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.flashcards}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, flashcards: e.target.checked }))}
                      size="small"
                    />
                  }
                  label="Flashcards"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: { xs: '0.9rem', sm: '1rem' } } }}
                />
              </FormGroup>
            </Box>

            <Box>
              <Typography 
                variant="subtitle1" 
                fontWeight="medium" 
                gutterBottom
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                Date Range
              </Typography>
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  flexWrap: 'wrap',
                  gap: { xs: 0.5, sm: 1 }
                }}
              >
                {['all', 'today', 'week', 'month', 'year'].map((range) => (
                  <Chip
                    key={range}
                    label={range.charAt(0).toUpperCase() + range.slice(1)}
                    onClick={() => handleDateRangeChange(range)}
                    color={filterOptions.dateRange === range ? 'primary' : 'default'}
                    sx={{ 
                      textTransform: 'capitalize',
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      height: { xs: 24, sm: 32 }
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography 
                variant="subtitle1" 
                fontWeight="medium" 
                gutterBottom
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                Tags
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: { xs: 0.5, sm: 1 } 
              }}>
                {allTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleTagFilterChange(tag)}
                    color={filterOptions.tags.includes(tag) ? 'primary' : 'default'}
                    sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      height: { xs: 24, sm: 32 }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Button 
            onClick={handleFilterClose}
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleFilterApply} 
            variant="contained"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SearchPage; 