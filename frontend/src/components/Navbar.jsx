import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Box } from '@mui/material';
import { Menu as MenuIcon, Book, Lightbulb, Search as SearchIcon } from '@mui/icons-material';
import React from 'react';

const Navbar = ({ drawerWidth }) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = [
    { text: 'Dashboard', path: '/', icon: <Book /> },
    { text: 'My Notes', path: '/notes', icon: <Book /> },
    { text: 'Flashcards', path: '/flashcards', icon: <Lightbulb /> },
  ];

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          backgroundColor: '#1a202c',
          width: '100%',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ 
              flexGrow: 0, 
              mr: 4, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              fontSize: '2rem'
            }}
          >
            <Book sx={{ mr: 0.2, fontSize: '2rem' }} />
            SmartNotes
          </Typography>
          
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
            {menuItems.map((item) => (
              <Button 
                key={item.text}
                component={Link}
                to={item.path}
                color="inherit"
                startIcon={React.cloneElement(item.icon, { sx: { fontSize: '1.5rem' } })}
                sx={{ 
                  textTransform: 'none',
                  fontSize: '1.1rem'
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/search')}
            sx={{ 
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              },
              '& .MuiSvgIcon-root': {
                fontSize: '2.5rem'
              }
            }}
          >
            <SearchIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <Box sx={{ mr: 2 }}>{item.icon}</Box>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar; 