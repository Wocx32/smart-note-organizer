import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Button,
  IconButton,
  Collapse,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  NoteAlt, 
  Tag, 
  School, 
  Add,
  ExpandMore,
  ExpandLess,
  Search,
  History,
  Settings,
  Label
} from '@mui/icons-material';
import NewNoteDialog from './NewNoteDialog';
import { getTags, addNote } from '../utils/storage';

const drawerWidth = 240;

const Sidebar = ({ onTagSelect, onNewNote }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [newNoteDialogOpen, setNewNoteDialogOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [showAllTags, setShowAllTags] = useState(false);
  const MAX_VISIBLE_TAGS = 4;

  // Load tags from localStorage and set up event listeners
  useEffect(() => {
    const loadTags = () => {
      const savedTags = getTags();
      setTags(savedTags);
    };

    // Initial load
    loadTags();

    // Listen for both storage and custom events
    const handleStorageChange = () => loadTags();
    const handleNotesUpdate = () => loadTags();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('smart_notes_updated', handleNotesUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('smart_notes_updated', handleNotesUpdate);
    };
  }, []);
  const handleTagClick = (tag) => {
    onTagSelect(tag);
  };

  const filteredTags = tags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleTags = showAllTags ? filteredTags : filteredTags.slice(0, MAX_VISIBLE_TAGS);
  const hasMoreTags = filteredTags.length > MAX_VISIBLE_TAGS;

  const handleNewNote = (noteData) => {
    // Create new note with required fields
    const newNote = {
      ...noteData,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      recent: true,
      favorite: false,
      tags: noteData.tags || [],
      summary: noteData.summary || noteData.content.substring(0, 150) + (noteData.content.length > 150 ? '...' : ''),
    };

    // Add the note using the utility function
    addNote(newNote);

    // Navigate to the notes page
    navigate('/notes');
  };

  const menuItems = [
    { text: 'Notes', icon: <NoteAlt />, path: '/notes' },
    { text: 'Flashcards', icon: <School />, path: '/flashcards' },
    { text: 'Search', icon: <Search />, path: '/search' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: '#ffffff',
          height: 'calc(100vh - 64px - 80px)',
          position: 'fixed',
          top: '64px'
        },
        display: { xs: 'none', sm: 'block' },
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        pt: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          mb: 2,
          px: 2
        }}>
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<Add />}
            onClick={onNewNote}
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
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ px: 2, mb: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ px: 2 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => setExpanded(!expanded)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <ListItemIcon>
                  <Label />
                </ListItemIcon>
                <ListItemText primary="Tags" />
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                {visibleTags.map((tag) => (
                  <ListItemButton
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    sx={{ 
                      pl: 4,
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    <ListItemText 
                      primary={tag}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        color: 'text.secondary'
                      }}
                    />
                  </ListItemButton>
                ))}
                {hasMoreTags && !showAllTags && (
                  <ListItemButton
                    onClick={() => setShowAllTags(true)}
                    sx={{ 
                      pl: 4,
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    <ListItemText 
                      primary={`Show ${filteredTags.length - MAX_VISIBLE_TAGS} more tags`}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        color: 'primary.main'
                      }}
                    />
                  </ListItemButton>
                )}
                {showAllTags && hasMoreTags && (
                  <ListItemButton
                    onClick={() => setShowAllTags(false)}
                    sx={{ 
                      pl: 4,
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    <ListItemText 
                      primary="Show less"
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        color: 'primary.main'
                      }}
                    />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
          </List>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ px: 2 }}>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => navigate('/recent')}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
              }}
            >
              <ListItemIcon>
                <History />
              </ListItemIcon>
              <ListItemText primary="Recent" />
            </ListItemButton>
          </ListItem>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
      </Box>

      <NewNoteDialog
        open={newNoteDialogOpen}
        onClose={() => setNewNoteDialogOpen(false)}
        onSave={handleNewNote}
      />
    </Drawer>
  );
};

export default Sidebar; 