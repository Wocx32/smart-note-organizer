import { useState } from 'react';
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
  Chip,
  IconButton,
  Collapse
} from '@mui/material';
import { 
  Dashboard, 
  NoteAlt, 
  Folder, 
  Tag, 
  School, 
  Add,
  ExpandMore,
  ExpandLess,
  Search,
  Bookmark,
  History,
  Settings
} from '@mui/icons-material';
import NewNoteDialog from './NewNoteDialog';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openFolders, setOpenFolders] = useState(true);
  const [openTags, setOpenTags] = useState(true);
  const [newNoteDialogOpen, setNewNoteDialogOpen] = useState(false);
  
  const toggleFolders = () => setOpenFolders(!openFolders);
  const toggleTags = () => setOpenTags(!openTags);

  const folders = [
    { name: 'Physics', count: 12 },
    { name: 'Math', count: 8 },
    { name: 'Computer Science', count: 15 },
    { name: 'Biology', count: 6 }
  ];

  const tags = [
    { name: 'Important', color: '#f56565' },
    { name: 'Review', color: '#ed8936' },
    { name: 'Equations', color: '#48bb78' },
    { name: 'Concepts', color: '#4299e1' }
  ];

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

  const tagItems = [
    { text: 'Physics', count: 12 },
    { text: 'Chemistry', count: 8 },
    { text: 'Mathematics', count: 15 },
    { text: 'Computer Science', count: 10 },
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
            <ListItemButton onClick={toggleFolders}>
              <ListItemIcon>
                <Folder />
              </ListItemIcon>
              <ListItemText primary="Folders" />
              {openFolders ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          
          {openFolders && folders.map((folder) => (
            <ListItem key={folder.name} disablePadding>
              <ListItemButton 
                sx={{ pl: 4 }}
                component={Link}
                to={`/folders/${folder.name.toLowerCase()}`}
              >
                <ListItemText primary={folder.name} />
                <Chip
                  label={folder.count}
                  size="small"
                  sx={{ 
                    height: 20, 
                    minWidth: 20, 
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(0,0,0,0.08)'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          
          <ListItem disablePadding>
            <ListItemButton onClick={toggleTags}>
              <ListItemIcon>
                <Bookmark />
              </ListItemIcon>
              <ListItemText primary="Tags" />
              {openTags ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={openTags} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {tagItems.map((tag) => (
                <ListItemButton
                  key={tag.text}
                  sx={{ pl: 4 }}
                  onClick={() => navigate(`/notes?tag=${tag.text}`)}
                >
                  <ListItemText
                    primary={tag.text}
                    secondary={`${tag.count} notes`}
                  />
                </ListItemButton>
              ))}
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
        
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/settings')}>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
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