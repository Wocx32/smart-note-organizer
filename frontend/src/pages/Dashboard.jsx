import { useState } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Paper,
  Chip
} from '@mui/material';
import { 
  Description, 
  NoteAlt, 
  School, 
  Tag, 
  TrendingUp, 
  QueryStats,
  AccessTime
} from '@mui/icons-material';

const Dashboard = () => {
  // Mock data
  const stats = [
    { title: 'Total Notes', value: 47, icon: <Description />, color: '#4299E1' },
    { title: 'Tags', value: 18, icon: <Tag />, color: '#48BB78' },
    { title: 'Flashcards', value: 126, icon: <School />, color: '#ED8936' },
  ];

  const recentNotes = [
    { id: 1, title: 'Quantum Mechanics: Wave Functions', date: '2 hours ago', tags: ['Physics', 'Advanced'] },
    { id: 2, title: 'Organic Chemistry: Functional Groups', date: '5 hours ago', tags: ['Chemistry'] },
    { id: 3, title: 'Linear Algebra: Eigenvalues', date: 'Yesterday', tags: ['Math', 'Important'] },
    { id: 4, title: 'Neural Networks: Backpropagation', date: '2 days ago', tags: ['CS', 'AI'] },
  ];

  const suggestedLinks = [
    { title: 'Wave Functions & Quantum Mechanics', similarity: '87%' },
    { title: 'Eigenvalues in Quantum Systems', similarity: '75%' },
    { title: 'Computational Methods in Physics', similarity: '68%' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="bold">Dashboard</Typography>
        <Button 
          variant="contained" 
          startIcon={<NoteAlt />}
          sx={{ 
            backgroundColor: '#3182ce',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#2b6cb0',
              boxShadow: 'none',
            }
          }}
        >
          New Note
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats */}
        {stats.map((stat) => (
          <Grid item xs={12} sm={4} key={stat.title}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: stat.color + '20', 
                      color: stat.color,
                      width: 48,
                      height: 48
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Recent notes */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">Recent Notes</Typography>
              <Button size="small" color="primary">View All</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
              {recentNotes.map((note) => (
                <ListItem 
                  key={note.id}
                  alignItems="flex-start"
                  sx={{ 
                    px: 2, 
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': { 
                      backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#E2E8F0', color: '#4A5568' }}>
                      <Description />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={note.title}
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 0.5 }}>
                          <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="caption">{note.date}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                          {note.tags.map((tag) => (
                            <Chip 
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{ 
                                height: 20, 
                                fontSize: '0.7rem',
                                backgroundColor: 'rgba(0,0,0,0.06)'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    }
                    primaryTypographyProps={{ fontWeight: '500' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Suggested links */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ color: '#4299E1', mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">Suggested Links</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
              {suggestedLinks.map((link, index) => (
                <ListItem 
                  key={index}
                  alignItems="flex-start"
                  sx={{ 
                    px: 2, 
                    py: 1.5, 
                    mb: 1, 
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                >
                  <ListItemText
                    primary={link.title}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <QueryStats sx={{ fontSize: 14, mr: 0.5, color: '#48BB78' }} />
                        <Typography variant="caption" color="#48BB78">
                          {link.similarity} similar
                        </Typography>
                      </Box>
                    }
                    primaryTypographyProps={{ fontWeight: '500' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 