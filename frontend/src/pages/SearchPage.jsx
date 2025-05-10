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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([
    'quantum mechanics',
    'organic chemistry',
    'linear algebra',
  ]);

  // Mock data for demonstration
  const allTags = [
    'Physics', 'Chemistry', 'Mathematics', 'Computer Science',
    'Biology', 'Important', 'Review', 'Equations', 'Concepts'
  ];

  const mockNotes = [
    {
      id: 1,
      title: 'Quantum Mechanics: Wave Functions',
      summary: 'Wave functions describe the quantum state of a particle. The square of the absolute value of the wave function represents the probability density.',
      tags: ['Physics', 'Advanced'],
      type: 'note',
      date: 'May 15, 2024'
    },
    {
      id: 2,
      title: 'Organic Chemistry: Functional Groups',
      summary: 'Functional groups are specific groupings of atoms that give a compound certain chemical properties.',
      tags: ['Chemistry'],
      type: 'note',
      date: 'May 14, 2024'
    },
    {
      id: 3,
      title: 'Linear Algebra: Eigenvalues',
      summary: 'Eigenvalues are special scalars associated with linear systems of equations.',
      tags: ['Math', 'Important'],
      type: 'flashcard',
      date: 'May 10, 2024'
    },
  ];

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedTags]);

  const performSearch = () => {
    const query = searchQuery.toLowerCase();
    const results = mockNotes.filter(note => {
      const matchesQuery = 
        note.title.toLowerCase().includes(query) ||
        note.summary.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query));

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => note.tags.includes(tag));

      return matchesQuery && matchesTags;
    });

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
  };

  const handleResultClick = (result) => {
    if (result.type === 'note') {
      navigate(`/notes/${result.id}`);
    } else if (result.type === 'flashcard') {
      navigate(`/flashcards/${result.id}`);
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

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {allTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => handleTagClick(tag)}
              color={selectedTags.includes(tag) ? 'primary' : 'default'}
              sx={{
                backgroundColor: selectedTags.includes(tag) ? 'primary.main' : 'rgba(0, 0, 0, 0.08)',
                color: selectedTags.includes(tag) ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: selectedTags.includes(tag) ? 'primary.dark' : 'rgba(0, 0, 0, 0.12)',
                },
              }}
            />
          ))}
        </Box>

        {!searchQuery && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
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
                          {result.tags.map((tag) => (
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