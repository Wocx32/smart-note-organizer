import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Box, Toolbar } from '@mui/material';

const drawerWidth = 240; // Match the sidebar width

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Navbar drawerWidth={drawerWidth} />
      <Sidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          overflow: 'auto',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c5c5c5',
            borderRadius: '4px',
            '&:hover': {
              background: '#a8a8a8',
            },
          },
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, pb: 8 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout; 