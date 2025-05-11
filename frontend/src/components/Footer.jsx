import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { useTheme } from '../context/ThemeContext';
import { Book } from '@mui/icons-material';

const Footer = () => {
  const { isDarkMode } = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: isDarkMode ? 'background.paper' : 'background.default',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <Book sx={{ fontSize: '2rem', mr: 1 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            SmartNotes
          </Typography>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Popular
            </Typography>
            <Link href="#" color="inherit" display="block">Link 1</Link>
            <Link href="#" color="inherit" display="block">Link 2</Link>
            <Link href="#" color="inherit" display="block">Link 3</Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Resources
            </Typography>
            <Link href="#" color="inherit" display="block">Resource 1</Link>
            <Link href="#" color="inherit" display="block">Resource 2</Link>
            <Link href="#" color="inherit" display="block">Resource 3</Link>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact
            </Typography>
            <Link href="#" color="inherit" display="block">Contact 1</Link>
            <Link href="#" color="inherit" display="block">Contact 2</Link>
            <Link href="#" color="inherit" display="block">Contact 3</Link>
          </Grid>
        </Grid>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          {'© '}
          {new Date().getFullYear()}
          {' SmartNotes. All rights reserved.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 