import { Box, Typography, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 3,
        backgroundColor: '#ffffff',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        width: '100%'
      }}
    >
      <Divider sx={{ mb: 2 }} />
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