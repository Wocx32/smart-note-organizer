import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Box, Toolbar } from '@mui/material';
import { useTheme } from '../context/ThemeContext';

const drawerWidth = 240; // Match the sidebar width

const Layout = () => {
  const { isDarkMode } = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      flexDirection: 'column',
      bgcolor: 'background.default',
      color: 'text.primary'
    }}>
      <Navbar drawerWidth={drawerWidth} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: isDarkMode ? '#2d3748' : '#f1f1f1',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: isDarkMode ? '#4a5568' : '#c5c5c5',
              borderRadius: '4px',
              '&:hover': {
                background: isDarkMode ? '#718096' : '#a8a8a8',
              },
            },
          }}
        >
          <Toolbar />
          <Box sx={{ flexGrow: 1 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout; 