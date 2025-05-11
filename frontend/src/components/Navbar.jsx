import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Box } from '@mui/material';
import { Menu as MenuIcon, Book, Lightbulb, Search as SearchIcon, Home as HomeIcon } from '@mui/icons-material';
import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const menuItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'My Notes', path: '/notes', icon: <Book /> },
    { text: 'Flashcards', path: '/flashcards', icon: <Lightbulb /> },
  ];

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          backgroundColor: 'background.default',
          color: 'text.primary',
          width: '100%',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ 
              mr: { xs: 1, sm: 2 }, 
              display: { sm: 'none' },
              p: { xs: 0.5, sm: 1 }
            }}
          >
            <MenuIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
          </IconButton>
          
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ 
              flexGrow: 0, 
              mr: { xs: 2, sm: 4 }, 
              textDecoration: 'none', 
              color: 'inherit',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >
            <Book sx={{ mr: 0.2, fontSize: { xs: '1.5rem', sm: '2rem' } }} />
            SmartNotes
          </Typography>
          
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: { xs: 1, sm: 2 } }}>
            {menuItems.map((item) => (
              <Button 
                key={item.text}
                component={Link}
                to={item.path}
                color="inherit"
                startIcon={React.cloneElement(item.icon, { sx: { fontSize: { xs: '1.25rem', sm: '1.5rem' } } })}
                sx={{ 
                  textTransform: 'none',
                  fontSize: { xs: '0.9rem', sm: '1.1rem' },
                  py: { xs: 0.5, sm: 1 },
                  px: { xs: 1, sm: 2 }
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
                backgroundColor: 'action.hover'
              },
              p: { xs: 0.5, sm: 1 },
              '& .MuiSvgIcon-root': {
                fontSize: { xs: '1.75rem', sm: '2.5rem' }
              }
            }}
          >
            <SearchIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Navbar; 