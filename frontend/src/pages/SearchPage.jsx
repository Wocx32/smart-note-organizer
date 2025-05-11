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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getNotes } from '../utils/storage';

const MAX_RECENT_SEARCHES = 5;

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);

  // Load data from localStorage on component mount
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
  }, []);

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

  const performSearch = () => {
    const query = searchQuery.toLowerCase();
    
    // Search in notes
    const noteResults = notes
      .filter(note => {
        const matchesQuery = 
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)));

        const matchesTags = selectedTags.length === 0 ||
          (note.tags && selectedTags.every(tag => note.tags.includes(tag)));

        return matchesQuery && matchesTags;
      })
      .map(note => ({
        ...note,
        type: 'note'
      }));

    // Search in flashcards
    const flashcardResults = flashcards
      .filter(card => {
        const matchesQuery = 
          card.front.toLowerCase().includes(query) ||
          card.back.toLowerCase().includes(query) ||
          (card.tags && card.tags.some(tag => tag.toLowerCase().includes(query)));

        const matchesTags = selectedTags.length === 0 ||
          (card.tags && selectedTags.every(tag => card.tags.includes(tag)));

        return matchesQuery && matchesTags;
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
    updateRecentSearches(searchQuery);
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
    if (result.type === 'note') {
      navigate(`/notes/${result.id}`);
    } else if (result.type === 'flashcard') {
      navigate(`/flashcards/${result.id}`);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      performSearch();
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Search
        </Typography>
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
          sx={{ mb: 2 }}
        />

        {!searchQuery && recentSearches.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <History fontSize="small" />
              Recent Searches
            </Typography>
            <List>
              {recentSearches.map((search, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => setSearchQuery(search)}
                  sx={{
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Search sx={{ color: 'text.secondary' }} />
                  </ListItemIcon>
                  <ListItemText primary={search} />
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
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="All Results" />
              <Tab label="Notes" />
              <Tab label="Flashcards" />
            </Tabs>

            {searchResults.length > 0 ? (
              <Grid container spacing={2}>
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
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {result.type === 'note' ? <NoteAlt /> : <School />}
                          </ListItemIcon>
                          <Typography variant="h6" component="div">
                            {result.title}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
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
                                height: 20,
                                fontSize: '0.7rem',
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
                  py: 4,
                  color: 'text.secondary',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  No results found
                </Typography>
                <Typography variant="body2">
                  Try adjusting your search or filters
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SearchPage; 