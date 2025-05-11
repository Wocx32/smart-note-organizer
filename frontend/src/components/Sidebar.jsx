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
  InputAdornment,
  Tooltip
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
  Label,
  ChevronLeft,
  ChevronRight,
  Menu,
  LightMode,
  DarkMode
} from '@mui/icons-material';
import { getTags } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

const drawerWidth = 240;
const collapsedWidth = 65;

const Sidebar = ({ onTagSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage, default to true if not set
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState ? JSON.parse(savedState) : true;
  });
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

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const handleTagClick = (tag) => {
    onTagSelect(tag);
  };

  const filteredTags = tags.filter(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleTags = showAllTags ? filteredTags : filteredTags.slice(0, MAX_VISIBLE_TAGS);
  const hasMoreTags = filteredTags.length > MAX_VISIBLE_TAGS;

  const menuItems = [
    { text: 'Notes', icon: <NoteAlt />, path: '/notes' },
    { text: 'Flashcards', icon: <School />, path: '/flashcards' },
    { text: 'Search', icon: <Search />, path: '/search' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { 
          width: isCollapsed ? collapsedWidth : drawerWidth,
          boxSizing: 'border-box',
          borderRight: '0.5px solid black',
          borderColor: 'divider',
          backgroundColor: 'background.default',
          height: 'calc(100vh - 64px)',
          position: 'fixed',
          top: '64px',
          transition: 'width 0.2s ease-in-out',
          overflowX: 'hidden'
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
        {isCollapsed ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 2 
          }}>
            <Tooltip title="Expand sidebar" arrow placement="right">
              <IconButton 
                onClick={() => setIsCollapsed(false)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <Menu />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            px: 1, 
            mb: 1 
          }}>
            <Tooltip title="Collapse sidebar" arrow>
              <IconButton 
                onClick={() => setIsCollapsed(true)}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <ChevronLeft />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />
        
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <Tooltip 
                title={isCollapsed ? item.text : ""} 
                placement="right"
                arrow
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                    minHeight: 48,
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(49, 130, 206, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(49, 130, 206, 0.15)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: isCollapsed ? 'auto' : 40,
                    justifyContent: 'center',
                    '& .MuiSvgIcon-root': {
                      fontSize: isCollapsed ? '2.2rem' : '1.7rem'
                    }
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '1.3rem',
                        fontWeight: location.pathname === item.path ? 600 : 400,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>

        {!isCollapsed && (
          <>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ px: 2, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: '1.5rem', color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '1.2rem'
                  }
                }}
              />
            </Box>

            <Box sx={{ px: 2 }}>
              <ListItemButton
                onClick={() => setExpanded(!expanded)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <ListItemIcon>
                  <Tag sx={{ fontSize: '1.9rem' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Tags"
                  primaryTypographyProps={{
                    fontSize: '1.3rem',
                    fontWeight: expanded ? 600 : 400,
                  }}
                />
                {expanded ? <ExpandLess sx={{ fontSize: '1.9rem' }} /> : <ExpandMore sx={{ fontSize: '1.5rem' }} />}
              </ListItemButton>

              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
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
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Label sx={{ fontSize: '1.1rem' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={tag}
                        primaryTypographyProps={{
                          fontSize: '0.9rem',
                        }}
                      />
                    </ListItemButton>
                  ))}
                  {!showAllTags && hasMoreTags && (
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
                        primary={`Show ${filteredTags.length - MAX_VISIBLE_TAGS} more`}
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
          </>
        )}
        
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Theme Toggle Button */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            ...(isCollapsed && {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 65, // match collapsed sidebar width for a perfect square
              p: 0,
            })
          }}
        >
          <Tooltip title={isCollapsed ? (isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode") : ""} arrow placement="right">
            <Button
              onClick={toggleTheme}
              fullWidth={!isCollapsed}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                color: 'text.primary',
                textTransform: 'none',
                minWidth: 0,
                p: isCollapsed ? 0 : 2,
                m: 0,
                width: isCollapsed ? 48 : '100%',
                height: isCollapsed ? 48 : 'auto',
                borderRadius: isCollapsed ? '50%' : 1,
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              {isDarkMode ? <DarkMode sx={{ fontSize: 28 }} /> : <LightMode sx={{ fontSize: 28 }} />}
              {!isCollapsed && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ml: 1,
                    fontWeight: 500
                  }}
                >
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Typography>
              )}
            </Button>
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;   