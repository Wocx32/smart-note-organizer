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
import { getTags } from '../utils/storage';

const drawerWidth = 240;

const Sidebar = ({ onTagSelect }) => {
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

  const handleNewNote = (note) => {
    // Here you would typically save the note to your backend
    console.log('New note created:', note);
    // Navigate to the notes page after creating
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
          backgroundColor: '#ffffff'
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
          mb: 2
        }}>
          <Button 
            variant="contained" 
            fullWidth
            startIcon={<Add />}
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
        
        <Divider sx={{ mb: 2 }} />
        
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setExpanded(!expanded)}>
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
        
        <Divider sx={{ my: 2 }} />
        
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/recent')}>
            <ListItemIcon>
              <History />
            </ListItemIcon>
            <ListItemText primary="Recent" />
          </ListItemButton>
        </ListItem>
        
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4299E1' }}>U</Avatar>
            <Box sx={{ ml: 1.5 }}>
              <Typography variant="subtitle2">User Name</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                user@example.com
              </Typography>
            </Box>
          </Box>
        </Box>
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