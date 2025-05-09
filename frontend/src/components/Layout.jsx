import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Box } from '@mui/material';

const Layout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ display: 'flex', flexGrow: 1, backgroundColor: '#f7fafc' }}>
        <Sidebar />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3,
            overflow: 'auto',
            height: 'calc(100vh - 64px)'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 