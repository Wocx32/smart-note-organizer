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
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ fontSize: '2.5rem', mb: 3 }}>
          Search
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} edge="end">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '50px',
                height: '48px',
                fontSize: '1.1rem',
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
          <Button
            variant="outlined"
            startIcon={<Tune />}
            onClick={handleFilterClick}
            sx={{
              borderRadius: '50px',
              height: '48px',
              px: 3,
              borderColor: 'divider',
              color: 'text.primary',
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
            startIcon={<Search />}
            onClick={() => handleSearchSubmit({ key: 'Enter' })}
            sx={{
              borderRadius: '50px',
              height: '48px',
              px: 3,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            Search
          </Button>
        </Box>

        {!searchQuery && recentSearches.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <History fontSize="small" />
                Recent Searches
              </Typography>
              <Button
                size="small"
                onClick={handleClearHistory}
                startIcon={<CleaningServices sx={{ fontSize: '1.2rem' }} />}
                sx={{
                  color: 'error.main',
                  textTransform: 'none',
                  fontSize: '1rem',
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
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Search sx={{ color: 'text.secondary' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={search}
                    primaryTypographyProps={{
                      fontSize: '1.1rem',
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
                mb: 3,
                '& .MuiTab-root': {
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  minWidth: 120,
                }
              }}
            >
              <Tab label="All Results" />
              <Tab label="Notes" />
              <Tab label="Flashcards" />
            </Tabs>

            {searchResults.length > 0 ? (
              <Grid container spacing={3}>
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
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {result.type === 'note' ? <NoteAlt sx={{ fontSize: '2rem' }} /> : <School sx={{ fontSize: '2rem' }} />}
                          </ListItemIcon>
                          <Typography variant="h6" component="div" sx={{ fontSize: '1.3rem' }}>
                            {result.title}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ mb: 2, fontSize: '1.1rem' }}
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
                                height: 24,
                                fontSize: '0.9rem',
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
                  py: 6,
                  color: 'text.secondary',
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontSize: '1.3rem' }}>
                  No results found
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
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
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Filter Results</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Content Type
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.notes}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, notes: e.target.checked }))}
                    />
                  }
                  label="Notes"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterOptions.flashcards}
                      onChange={(e) => setFilterOptions(prev => ({ ...prev, flashcards: e.target.checked }))}
                    />
                  }
                  label="Flashcards"
                />
              </FormGroup>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Date Range
              </Typography>
              <Stack direction="row" spacing={1}>
                {['all', 'today', 'week', 'month', 'year'].map((range) => (
                  <Chip
                    key={range}
                    label={range.charAt(0).toUpperCase() + range.slice(1)}
                    onClick={() => handleDateRangeChange(range)}
                    color={filterOptions.dateRange === range ? 'primary' : 'default'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {allTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleTagFilterChange(tag)}
                    color={filterOptions.tags.includes(tag) ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleFilterClose}>Cancel</Button>
          <Button onClick={handleFilterApply} variant="contained">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SearchPage; 