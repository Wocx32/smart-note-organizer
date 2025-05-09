import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Chip
} from '@mui/material';
import { 
  Dashboard, 
  NoteAlt, 
  Folder, 
  Tag, 
  School, 
  Add,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

const drawerWidth = 240;

const Sidebar = () => {
  const location = useLocation();
  const [openFolders, setOpenFolders] = useState(true);
  const [openTags, setOpenTags] = useState(true);
  
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
            startIcon={<Add />}
            sx={{ 
              width: '80%',
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
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              to="/"
              selected={location.pathname === '/'}
            >
              <ListItemIcon>
                <Dashboard />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              to="/notes"
              selected={location.pathname === '/notes'}
            >
              <ListItemIcon>
                <NoteAlt />
              </ListItemIcon>
              <ListItemText primary="All Notes" />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              to="/flashcards"
              selected={location.pathname === '/flashcards'}
            >
              <ListItemIcon>
                <School />
              </ListItemIcon>
              <ListItemText primary="Flashcards" />
            </ListItemButton>
          </ListItem>
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
                <Tag />
              </ListItemIcon>
              <ListItemText primary="Tags" />
              {openTags ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          
          {openTags && tags.map((tag) => (
            <ListItem key={tag.name} disablePadding>
              <ListItemButton 
                sx={{ pl: 4 }}
                component={Link}
                to={`/tags/${tag.name.toLowerCase()}`}
              >
                <Box 
                  sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    backgroundColor: tag.color,
                    mr: 2
                  }} 
                />
                <ListItemText primary={tag.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
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
    </Drawer>
  );
};

export default Sidebar; 