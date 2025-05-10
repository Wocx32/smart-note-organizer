import { useState, useEffect } from 'react';
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

const NewNoteDialog = ({ open, onClose, onSave, initialNote }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [flashcards, setFlashcards] = useState([]);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setTags(initialNote.tags || []);
      setSummary(initialNote.summary || '');
      setFlashcards(initialNote.flashcards || []);
    }
  }, [initialNote]);

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

  const generateAIContent = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      console.log('[AI] Sending to /process:', { text: content });
      const response = await fetch('http://127.0.0.1:8000/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });
      console.log('[AI] Raw response:', response);
      const data = await response.json();
      console.log('[AI] Parsed response:', data);
      setTags(data.tags || []);
      setSummary(data.summary || '');
      setFlashcards(data.flashcards || []);

      // Remove automatic flashcard storage
      // if (data.flashcards && data.flashcards.length > 0 && data.tags && data.tags.length > 0) {
      //   const existingFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
      //   // Create flashcards for each tag
      //   const newFlashcards = data.flashcards.flatMap(card => 
      //     data.tags.map(tag => ({
      //       id: Date.now() + Math.random(), // Generate a unique ID
      //       front: card.front,
      //       back: card.back,
      //       deck: tag,
      //       tags: data.tags || []
      //     }))
      //   );
      //   localStorage.setItem('flashcards', JSON.stringify([...existingFlashcards, ...newFlashcards]));
      // }
    } catch (error) {
      console.error('[AI] Error calling /process:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      const noteData = {
        id: initialNote?.id,
        title: title.trim(),
        content: content.trim(),
        tags,
        summary: summary || content.substring(0, 150) + '...',
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        recent: true,
        flashcards,
      };

      // Store flashcards in localStorage if they exist
      if (flashcards && flashcards.length > 0) {
        const existingFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
        const newFlashcards = flashcards.map(card => ({
          id: Date.now() + Math.random(),
          front: card.front,
          back: card.back,
          deck: tags[0] || 'General', // Use first tag as deck, or 'General' if no tags
          tags: tags || []
        }));
        localStorage.setItem('flashcards', JSON.stringify([...existingFlashcards, ...newFlashcards]));
      }

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
    setFlashcards([]);
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
          {initialNote ? 'Edit Note' : 'New Note'}
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
            onClick={generateAIContent}
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
        {flashcards.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
              AI Generated Flashcards
            </Typography>
            {flashcards.map((card, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="body2" component="div" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Q: {card.front}
                </Typography>
                <Typography variant="body2" component="div" color="text.secondary" sx={{ mt: 1 }}>
                  A: {card.back}
                </Typography>
              </Box>
            ))}
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