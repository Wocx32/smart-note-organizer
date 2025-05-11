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
      bgcolor: isDarkMode ? 'background.default' : undefined,
      backgroundImage: isDarkMode ? undefined : 'linear-gradient(135deg, #9cd7e4 0%, #ffffff 50%, #b9e3c9 100%)',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      color: 'text.primary'
    }}>
      <Navbar drawerWidth={drawerWidth} />
      <Box sx={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 64px - 80px)' }}>
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
      <Box sx={{ width: '100%', borderTop: '1px solid black', bgcolor: 'white' }}>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout; 