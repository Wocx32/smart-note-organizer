import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  Grid, 
  Card, 
  CardContent, 
  Divider,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Stack,
  Tabs,
  Tab,
  Paper,
  FormControl,
  Select,
  Avatar
} from '@mui/material';
import { 
  Search, 
  NoteAlt, 
  Sort, 
  FilterList, 
  Description, 
  MoreVert, 
  AccessTime, 
  Event,
  ViewList,
  ViewModule,
  Upload
} from '@mui/icons-material';
import FileImportDialog from '../components/FileImportDialog';
import NewNoteDialog from '../components/NewNoteDialog';
import { getNotes, addNote, updateNote, deleteNote } from '../utils/storage';
import Sidebar from '../components/Sidebar';

const NotesPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [newNoteDialogOpen, setNewNoteDialogOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = getNotes();
    setNotes(savedNotes);
  }, []);

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };
  
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };
  
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    handleSortClose();
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    setActiveTab(0);
  };

  const filterNotes = () => {
    let filtered = [...notes];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter(note => note.recent);
    }
    
    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }
    
    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    
    return filtered;
  };

  const filteredNotes = filterNotes();

  const handleCreateNote = (newNote) => {
    const savedNote = addNote(newNote);
    setNotes(prevNotes => [savedNote, ...prevNotes]);
    setNewNoteDialogOpen(false);
  };

  const handleImportFiles = (processedFiles) => {
    const newNotes = processedFiles.map(file => ({
      title: file.name,
      content: file.content,
      summary: file.summary || file.content.substring(0, 150) + '...',
      date: new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      tags: [file.type.toUpperCase()],
      recent: true
    }));
    
    newNotes.forEach(note => {
      addNote(note);
    });
    
    setNotes(prevNotes => [...newNotes, ...prevNotes]);
  };

  const handleDeleteNote = (noteId) => {
    deleteNote(noteId);
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar onTagSelect={handleTagSelect} />
      <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Box>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" fontWeight="bold">My Notes</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<Upload />}
                onClick={() => setImportDialogOpen(true)}
                sx={{ 
                  borderColor: 'rgba(0, 0, 0, 0.23)', 
                  color: 'text.primary',
                  textTransform: 'none' 
                }}
              >
                Import
              </Button>
              <Button 
                variant="contained" 
                startIcon={<NoteAlt />}
                onClick={() => setNewNoteDialogOpen(true)}
                sx={{ 
                  backgroundColor: '#3182ce',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#2b6cb0',
                    boxShadow: 'none',
                  }
                }}
              >
                New Note
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
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider', 
                px: 2 
              }}
            >
              <Tab label="All Notes" />
              <Tab label="Recent" />
              <Tab label="Favorites" />
            </Tabs>
            
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                placeholder="Search notes..."
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
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ display: 'flex', border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1 }}>
                  <IconButton 
                    size="small"
                    onClick={() => handleViewChange('list')}
                    sx={{ 
                      color: viewMode === 'list' ? 'primary.main' : 'text.secondary',
                      bgcolor: viewMode === 'list' ? 'primary.light' : 'transparent',
                      borderRadius: '4px 0 0 4px',
                      '&:hover': { bgcolor: viewMode === 'list' ? 'primary.light' : 'rgba(0, 0, 0, 0.04)' },
                    }}
                  >
                    <ViewList />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleViewChange('grid')}
                    sx={{ 
                      color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
                      bgcolor: viewMode === 'grid' ? 'primary.light' : 'transparent',
                      borderRadius: '0 4px 4px 0',
                      '&:hover': { bgcolor: viewMode === 'grid' ? 'primary.light' : 'rgba(0, 0, 0, 0.04)' },
                    }}
                  >
                    <ViewModule />
                  </IconButton>
                </Box>
              
                <Button 
                  variant="outlined" 
                  startIcon={<Sort />}
                  onClick={handleSortClick}
                  size="small"
                  sx={{ 
                    borderColor: 'rgba(0, 0, 0, 0.12)', 
                    color: 'text.primary',
                    textTransform: 'none' 
                  }}
                >
                  Sort
                </Button>
                <Menu
                  anchorEl={sortAnchorEl}
                  open={Boolean(sortAnchorEl)}
                  onClose={handleSortClose}
                >
                  <MenuItem onClick={() => handleSortChange('recent')}>Most Recent</MenuItem>
                  <MenuItem onClick={() => handleSortChange('title')}>Alphabetical</MenuItem>
                </Menu>
                
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
                  <MenuItem>Physics</MenuItem>
                  <MenuItem>Chemistry</MenuItem>
                  <MenuItem>Mathematics</MenuItem>
                  <MenuItem>Computer Science</MenuItem>
                  <MenuItem>Biology</MenuItem>
                </Menu>
              </Box>
            </Box>
          </Paper>
          
          {viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredNotes.map((note) => (
                <Grid key={note.id} columns={{ xs: 12, sm: 6, md: 4 }}>
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
                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', p: 0 }}>
                      <CardContent sx={{ p: 3, pb: 2, width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 600, mb: 1 }}>
                            {note.title}
                          </Typography>
                          <IconButton size="small" onClick={() => handleDeleteNote(note.id)}>
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" component="div" sx={{ mb: 2 }}>
                          {note.summary}
                        </Typography>
                      </CardContent>
                      
                      <Box sx={{ mt: 'auto', p: 2, pt: 0, width: '100%' }}>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {note.tags.map((tag) => (
                            <Chip 
                              key={tag}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <Event sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="caption" component="span">{note.date}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                overflow: 'hidden'
              }}
            >
              {filteredNotes.map((note, index) => (
                <Box key={note.id}>
                  {index > 0 && <Divider />}
                  <Box 
                    sx={{ 
                      p: 3, 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                      cursor: 'pointer'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                      <Avatar sx={{ bgcolor: '#E2E8F0', color: '#4A5568' }}>
                        <Description />
                      </Avatar>
                    </Box>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="div" fontWeight={500}>
                          {note.title}
                        </Typography>
                        <IconButton size="small" onClick={() => handleDeleteNote(note.id)}>
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" component="div" sx={{ mb: 2 }}>
                        {note.summary}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {note.tags.map((tag) => (
                            <Chip 
                              key={tag}
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
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                          <Event sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="caption" component="span">{note.date}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        <FileImportDialog
          open={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
          onImport={handleImportFiles}
        />

        <NewNoteDialog
          open={newNoteDialogOpen}
          onClose={() => setNewNoteDialogOpen(false)}
          onSave={handleCreateNote}
        />
      </Box>
    </Box>
  );
};

export default NotesPage; 