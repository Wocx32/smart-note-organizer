import { Box, Typography } from '@mui/material';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { isDarkMode } = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        backgroundColor: isDarkMode ? 'background.paper' : 'white',
        borderTop: '1px solid',
        borderColor: 'divider',
        width: '100%',
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ fontSize: '0.875rem' }}
      >
        Made by Ali Khan, Subhan Rauf, Shamoon Butt © 2025
      </Typography>
    </Box>
  );
};

export default Footer; 