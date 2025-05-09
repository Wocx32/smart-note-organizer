import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea, 
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
  Select
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

const NotesPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [newNoteDialogOpen, setNewNoteDialogOpen] = useState(false);
  const [notes, setNotes] = useState([
    { 
      id: 1, 
      title: 'Quantum Mechanics: Wave Functions', 
      summary: 'Wave functions describe the quantum state of a particle. The square of the absolute value of the wave function represents the probability density.', 
      date: 'May 15, 2024', 
      tags: ['Physics', 'Advanced'],
      recent: true
    },
    { 
      id: 2, 
      title: 'Organic Chemistry: Functional Groups', 
      summary: 'Functional groups are specific groupings of atoms that give a compound certain chemical properties. Common functional groups include alcohols, aldehydes, and ketones.', 
      date: 'May 14, 2024', 
      tags: ['Chemistry'],
      recent: true
    },
    { 
      id: 3, 
      title: 'Linear Algebra: Eigenvalues', 
      summary: 'Eigenvalues are special scalars associated with linear systems of equations. An eigenvector of a matrix is a non-zero vector that changes only by a scalar factor when the matrix is multiplied by it.', 
      date: 'May 10, 2024', 
      tags: ['Math', 'Important'],
      recent: false
    },
    { 
      id: 4, 
      title: 'Neural Networks: Backpropagation', 
      summary: 'Backpropagation is a method used to calculate gradients in neural networks. It\'s based on the chain rule from calculus and is key to training deep learning models efficiently.', 
      date: 'May 8, 2024', 
      tags: ['CS', 'AI'],
      recent: false
    },
    { 
      id: 5, 
      title: 'Cell Biology: Mitochondria Function', 
      summary: 'Mitochondria are the powerhouses of the cell, generating most of the cell\'s supply of ATP. They have their own DNA and can replicate independently of the cell.', 
      date: 'May 5, 2024', 
      tags: ['Biology', 'Cellular'],
      recent: false
    },
    { 
      id: 6, 
      title: 'Statistical Mechanics: Entropy', 
      summary: 'Entropy is a measure of disorder or randomness in a system. The second law of thermodynamics states that entropy always increases in an isolated system.', 
      date: 'May 3, 2024', 
      tags: ['Physics', 'Thermodynamics'],
      recent: false
    },
  ]);
  
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

  const filterNotes = () => {
    let filtered = [...notes];
    
    // Filter by tab
    if (activeTab === 1) {
      filtered = filtered.filter(note => note.recent);
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
    const noteWithId = {
      ...newNote,
      id: notes.length + 1,
      summary: newNote.content.substring(0, 150) + '...'
    };
    setNotes([noteWithId, ...notes]);
  };

  const handleImportFiles = (processedFiles) => {
    const newNotes = processedFiles.map((file, index) => ({
      id: notes.length + index + 1,
      title: file.name,
      summary: file.content.substring(0, 150) + '...',
      date: new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      tags: [file.type.toUpperCase()],
      recent: true
    }));
    
    setNotes([...newNotes, ...notes]);
  };

  return (
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
          onChange={handleTabChange}
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
            <Grid item xs={12} sm={6} md={4} key={note.id}>
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
                <CardActionArea sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', p: 0 }}>
                  <CardContent sx={{ p: 3, pb: 2, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {note.title}
                      </Typography>
                      <IconButton size="small">
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                      <Typography variant="caption">{note.date}</Typography>
                    </Box>
                  </Box>
                </CardActionArea>
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
                    <Typography variant="h6" fontWeight={500}>
                      {note.title}
                    </Typography>
                    <IconButton size="small">
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
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
                      <Typography variant="caption">{note.date}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Paper>
      )}

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
  );
};

export default NotesPage; 