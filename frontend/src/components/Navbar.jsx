import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Box, InputBase, Avatar } from '@mui/material';
import { Menu as MenuIcon, Search as SearchIcon, Notifications, Book, Lightbulb, Settings } from '@mui/icons-material';

const Navbar = () => {
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
    { text: 'Settings', path: '/settings', icon: <Settings /> },
  ];

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#1a202c' }}>
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
            }}
          >
            <Book sx={{ mr: 1 }} />
            SmartNotes
          </Typography>
          
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
            {menuItems.map((item) => (
              <Button 
                key={item.text}
                component={Link}
                to={item.path}
                color="inherit"
                startIcon={item.icon}
                sx={{ textTransform: 'none' }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ 
            position: 'relative', 
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 1,
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
            width: { xs: '100%', sm: 'auto' },
            maxWidth: '300px',
            mr: 2
          }}>
            <Box sx={{ position: 'absolute', height: '100%', display: 'flex', alignItems: 'center', pl: 2 }}>
              <SearchIcon />
            </Box>
            <InputBase
              placeholder="Search notes..."
              sx={{ color: 'inherit', pl: 5, pr: 1, py: 1, width: '100%' }}
            />
          </Box>
          
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          
          <Avatar sx={{ ml: 2, bgcolor: '#4299E1', width: 32, height: 32 }}>U</Avatar>
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