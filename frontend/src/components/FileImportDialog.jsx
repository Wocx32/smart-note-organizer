import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Upload,
  Description,
  PictureAsPdf,
  Delete,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const FileImportDialog = ({ open, onClose, onImport }) => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const processPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      text += textContent.items.map(item => item.str).join(' ') + '\n';
    }

    return text;
  };

  const processImage = async (file) => {
    const worker = await createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return text;
  };

  const handleImport = async () => {
    setProcessing(true);
    setProgress(0);

    try {
      const processedFiles = await Promise.all(
        files.map(async (file, index) => {
          let content = '';
          let type = '';

          if (file.type === 'application/pdf') {
            content = await processPDF(file);
            type = 'pdf';
          } else if (file.type.startsWith('image/')) {
            content = await processImage(file);
            type = 'image';
          } else if (file.type === 'text/plain') {
            content = await file.text();
            type = 'text';
          }

          setProgress(((index + 1) / files.length) * 100);
          return { name: file.name, content, type };
        })
      );

      onImport(processedFiles);
      onClose();
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import Files</DialogTitle>
      <DialogContent>
        <Paper
          sx={{
            p: 3,
            mb: 3,
            border: '2px dashed #ccc',
            borderRadius: 2,
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.txt,image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drag & Drop Files Here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to select files
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Supported formats: PDF, TXT, Images (for OCR)
          </Typography>
        </Paper>

        {files.length > 0 && (
          <List>
            {files.map((file, index) => (
              <ListItem
                key={index}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  {file.type === 'application/pdf' ? (
                    <PictureAsPdf color="error" />
                  ) : (
                    <Description />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024).toFixed(1)} KB`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => removeFile(index)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {processing && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Processing files... {Math.round(progress)}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={files.length === 0 || processing}
          startIcon={processing ? null : <CheckCircle />}
        >
          {processing ? 'Processing...' : 'Import'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileImportDialog; 