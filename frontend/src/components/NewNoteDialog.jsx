import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

const NewNoteDialog = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      const newTags = [...tags, currentTag.trim()];
      console.log('Adding new tag:', currentTag.trim(), 'Updated tags:', newTags);
      setTags(newTags);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    console.log('Removing tag:', tagToRemove, 'Updated tags:', newTags);
    setTags(newTags);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleTagKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddTag();
    }
  };

  const generateTagsAndSummary = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    try {
      console.log('Generating tags and summary for content:', content.substring(0, 100) + '...');
      
      // Generate tags
      const tagsResponse = await fetch('http://127.0.0.1:8000/generate-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });
      const tagsData = await tagsResponse.json();
      console.log('Tags API Response:', tagsData);
      
      // Generate summary
      const summaryResponse = await fetch('http://127.0.0.1:8000/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });
      const summaryData = await summaryResponse.json();
      console.log('Summary API Response:', summaryData);

      // Update state with generated tags and summary
      setTags(tagsData.tags);
      setSummary(summaryData.summary.content);
      console.log('Updated state - Tags:', tagsData.tags, 'Summary:', summaryData.summary.content);
    } catch (error) {
      console.error('Error generating tags and summary:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        tags,
        summary: summary || content.substring(0, 150) + '...',
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        recent: true
      };
      console.log('Saving note with data:', noteData);
      onSave(noteData);
      handleClose();
    }
  };

  const handleClose = () => {
    console.log('Closing dialog, resetting state');
    setTitle('');
    setContent('');
    setTags([]);
    setCurrentTag('');
    setSummary('');
    setTagInput('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '60vh'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          New Note
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Content"
          fullWidth
          multiline
          rows={8}
          variant="outlined"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
            Tags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                size="small"
              />
            ))}
          </Box>
          <TextField
            size="small"
            placeholder="Add tags..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            fullWidth
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            onClick={generateTagsAndSummary}
            disabled={!content || isLoading}
          >
            Auto Generate
          </Button>
        </Box>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {summary && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
              AI Generated Summary
            </Typography>
            <Typography variant="body2" component="div" color="text.secondary">
              {summary}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!title || !content}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewNoteDialog; 