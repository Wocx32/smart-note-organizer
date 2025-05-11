import { useState, useRef, useEffect } from 'react';
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
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Upload,
  Description,
  PictureAsPdf,
  Delete,
  CheckCircle,
  Image,
} from '@mui/icons-material';
import Tesseract from 'tesseract.js';
// const detectedPdfjsVersion = '4.8.68'; // Replace with a version available on cdnjs
// pdfjsWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${detectedPdfjsVersion}/pdf.worker.min.js`;


// --- react-pdf and its internal pdfjs-dist ---
// Import the pdfjs instance exposed by react-pdf
import { pdfjs } from 'react-pdf';
// If you're using react-pdf components like <Document> and <Page> elsewhere,
// you might also need to import them for type consistency or other configurations.
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // If using annotations
// import 'react-pdf/dist/esm/Page/TextLayer.css'; // If using text layer for display

console.log('react-pdf detected pdfjs.version:', pdfjs.version);

// --- PDF.js Worker Setup (using react-pdf's pdfjs instance) ---
// react-pdf exposes its pdfjs instance, which includes GlobalWorkerOptions.
// We need to set the workerSrc for it.
// The version should ideally match what react-pdf's bundled pdfjs-dist uses.
// If pdfjs.version is available and valid, use it. Otherwise, fallback.
let pdfjsWorkerSrc = '';
const detectedPdfjsVersion = "4.8.69"; // This should be from the pdfjs-dist used by react-pdf (e.g., "4.8.69")

if (detectedPdfjsVersion && /^\d+\.\d+\.\d+$/.test(detectedPdfjsVersion)) {
  pdfjsWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${detectedPdfjsVersion}/pdf.worker.min.mjs`;
  console.log(`Using react-pdf's detected pdfjs version: ${detectedPdfjsVersion} for worker. Path: ${pdfjsWorkerSrc}`);
} else {
  // Fallback if version detection is odd (shouldn't happen if react-pdf is set up correctly)
  const fallbackVersion = '4.8.69'; // Match this to the version react-pdf 9.2.1 uses if detection fails
  console.warn(`react-pdf's pdfjs.version ('${detectedPdfjsVersion}') is undefined or unusual. Falling back to CDN version: ${fallbackVersion}`);
  pdfjsWorkerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${fallbackVersion}/pdf.worker.min.js`;
}
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;
console.log("PDF.js worker SRC (via react-pdf) set to:", pdfjs.GlobalWorkerOptions.workerSrc);


// --- Tesseract.js Path Configuration ---
// --- Tesseract.js Path Configuration ---
const TESSERACT_CORE_JS_FILENAME = 'tesseract-core-simd-lstm.wasm.js';
const TESSERACT_CONFIG = {
  workerPath: new URL(`./tesseract_assets/worker.min.js`, window.location.href).href,
  corePath: new URL(`./tesseract_assets/${TESSERACT_CORE_JS_FILENAME}`, window.location.href).href,
  // langPath: `https://tessdata.projectnaptha.com/4.0.0_fast/eng.traineddata.gz`,
};

console.log("Tesseract.js version:", Tesseract.version);
console.log("Using TESSERACT_CONFIG:", TESSERACT_CONFIG);



const FileImportDialog = ({ open, onClose, onImport }) => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const tesseractWorkerRef = useRef(null);

  const initializeTesseractWorker = async (language = 'eng') => {
    if (tesseractWorkerRef.current) {
      console.log("Terminating existing Tesseract worker...");
      await tesseractWorkerRef.current.terminate();
      tesseractWorkerRef.current = null;
    }
    // Pass the config without the logger to createWorker
    console.log(`Creating Tesseract worker with options:`, JSON.stringify(TESSERACT_CONFIG));
    const worker = await Tesseract.createWorker('eng', 1, {
      workerPath: '/tesseract_assets/worker.min.js',
      corePath: '/tesseract_assets/tesseract-core-simd-lstm.wasm.js',
      langPath: 'https://tessdata.projectnaptha.com/4.0.0_fast/ ',
    }); // Use base config
    console.log("Tesseract worker instance created.");

    // You can still add an event listener for general messages if needed,
    // though the logger in `recognize` is often sufficient for progress.
    // worker. Recognizer.events.on('progress', message => {
    //    console.log('General progress event:', message);
    // });

    // console.log(`Loading language '${language}'...`);
    // await worker.loadLanguage(language);
    // console.log(`Language '${language}' loaded.`);
    // console.log(`Initializing Tesseract for language '${language}'...`);
    // await worker.initialize(language);
    // console.log(`Tesseract worker initialized with language: ${language}.`);
    tesseractWorkerRef.current = worker;
    return worker;
  };


  useEffect(() => {
    return () => {
      if (tesseractWorkerRef.current) {
        console.log("Terminating Tesseract worker on component unmount...");
        tesseractWorkerRef.current.terminate();
        tesseractWorkerRef.current = null;
      }
    };
  }, []);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...filterAndPrepareFiles(selectedFiles)]);
    if (event.target) event.target.value = null;
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(prevFiles => [...prevFiles, ...filterAndPrepareFiles(droppedFiles)]);
  };

  const filterAndPrepareFiles = (newFiles) => {
    return newFiles.filter(file => {
      const isValid = file.type === 'application/pdf' ||
        file.type.startsWith('image/') ||
        file.type === 'text/plain';
      if (!isValid) setError(`Unsupported file type: ${file.name}`);
      return isValid;
    });
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Now uses pdfjs.getDocument from react-pdf's instance
  const processPDF = async (file, worker) => {
    setProcessingStatus(`Loading ${file.name}...`);
    setProgress(0);
    const arrayBuffer = await file.arrayBuffer();
    // Use getDocument from the pdfjs object imported from react-pdf
    const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      setProcessingStatus(`Rendering ${file.name} (page ${i} of ${pdfDoc.numPages})...`);
      setProgress((100 / pdfDoc.numPages) * i);

      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const context = canvas.getContext('2d');

      const renderContext = { canvasContext: context, viewport: viewport };
      await page.render(renderContext).promise;

      setProcessingStatus(`Processing ${file.name} (page ${i} of ${pdfDoc.numPages})...`);
      const { data } = await worker.recognize(canvas, {}, {
        // logger: m => { if (m.status === 'recognizing text') setProgress(m.progress * 100); }
      });
      fullText += data.text + '\n\n';
    }
    return fullText;
  };

  const processImage = async (file, worker) => {
    setProcessingStatus(`Processing ${file.name}...`);
    setProgress(0);
    const { data } = await worker.recognize(file, {}, {
      // logger: m => { if (m.status === 'recognizing text') setProgress(m.progress * 100); }
    });
    return data.text;
  };

  const generateAIFeatures = async (content) => {
    try {
      setProcessingStatus('Generating Summary, Flashcards and Tags...');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_BASE_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      });
      const data = await response.json();
      return {
        tags: data.tags || [],
        summary: data.summary || '',
        flashcards: data.flashcards || []
      };
    } catch (error) {
      console.error('[AI] Error generating features:', error);
      return {
        tags: [],
        summary: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
        flashcards: []
      };
    }
  };

  const handleImport = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    setError(null);
    setProcessingStatus('Initializing OCR engine...');

    let tesseractWorker;
    try {
      tesseractWorker = await initializeTesseractWorker('eng');
      console.log("Tesseract worker initialization attempt complete.");
    } catch (initError) {
      console.error('CRITICAL: Failed to initialize Tesseract worker:', initError);
      let errorMessage = String(initError.message || initError);
      if (initError.toString().includes("importScripts")) {
        errorMessage += " This often means Tesseract 'corePath' is incorrect or the file is not accessible.";
      }
      setError(`OCR engine failed to start: ${errorMessage}`);
      setProcessing(false);
      setProcessingStatus('');
      return;
    }

    const processedFilesData = [];
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      let content = '';
      let type = '';
      try {
        if (file.type === 'application/pdf') {
          content = await processPDF(file, tesseractWorker);
          type = 'pdf';
        } else if (file.type.startsWith('image/')) {
          content = await processImage(file, tesseractWorker);
          type = 'image';
        } else if (file.type === 'text/plain') {
          setProcessingStatus(`Reading ${file.name}...`);
          setProgress(100);
          content = await file.text();
          type = 'text';
        }

        // Generate AI features after OCR
        const aiFeatures = await generateAIFeatures(content);

        processedFilesData.push({
          title: file.name.replace(/\.[^/.]+$/, ''),
          content: content,
          type: type,
          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          recent: true,
          favorite: false,
          tags: [...new Set([...aiFeatures.tags, type.toUpperCase()])], // Combine AI tags with file type
          summary: aiFeatures.summary,
          flashcards: aiFeatures.flashcards
        });

        // Store flashcards in localStorage if they exist
        if (aiFeatures.flashcards && aiFeatures.flashcards.length > 0) {
          const existingFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
          const newFlashcards = aiFeatures.flashcards.map(card => ({
            id: Date.now() + Math.random(),
            front: card.front,
            back: card.back,
            deck: aiFeatures.tags[0] || type.toUpperCase(), // Use first AI tag as deck, or file type if no tags
            tags: [...aiFeatures.tags, type.toUpperCase()]
          }));
          localStorage.setItem('flashcards', JSON.stringify([...existingFlashcards, ...newFlashcards]));
        }
      } catch (fileError) {
        console.error(`Error processing ${file.name}:`, fileError);
        if (fileError.message && (fileError.message.toLowerCase().includes('pdf') || fileError.message.toLowerCase().includes('worker'))) {
          setError(`PDF processing error for ${file.name}: ${String(fileError.message || fileError)}. Check console and PDF worker path. Skipping.`);
        } else {
          setError(`Failed to process ${file.name}: ${String(fileError.message || fileError)}. Skipping.`);
        }
      }
    }

    setProcessingStatus(processedFilesData.length > 0 ? 'Import complete!' : 'No files successfully imported.');
    if (processedFilesData.length > 0) onImport(processedFilesData);

    handleClose();
  };

  const handleClose = () => {
    setFiles([]);
    setProcessing(false);
    setProgress(0);
    setProcessingStatus('');
    // setError(null); // Let snackbar manage its own visibility based on error state
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Files</DialogTitle>
      <DialogContent>
        {!processing && (
          <Paper
            sx={{
              p: 3, mb: 3, border: '2px dashed', borderColor: 'divider', borderRadius: 2,
              textAlign: 'center', cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
            }}
            onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file" multiple accept=".pdf,.txt,image/*"
              style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileSelect}
            />
            <Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>Drag & Drop Files Here</Typography>
            <Typography variant="body2" color="text.secondary">or click to select files (PDF, TXT, Images)</Typography>
          </Paper>
        )}

        {files.length > 0 && !processing && (
          <List>
            {files.map((file, index) => (
              <ListItem
                key={`${file.name}-${index}-${file.lastModified}`}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1, bgcolor: 'background.paper' }}
              >
                <ListItemIcon>
                  {file.type === 'application/pdf' ? <PictureAsPdf color="error" /> :
                    file.type.startsWith('image/') ? <Image color="primary" /> :
                      <Description color="action" />}
                </ListItemIcon>
                <ListItemText primary={file.name} secondary={`${(file.size / 1024).toFixed(1)} KB`} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => removeFile(index)} aria-label="delete"><Delete /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {processing && (
          <Box sx={{ width: '100%', mt: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ minHeight: '2em' }}>{processingStatus}</Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 1, height: '8px' }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Current task: {Math.round(progress)}%
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={processing}>Cancel</Button>
        <Button
          onClick={handleImport} variant="contained"
          disabled={files.length === 0 || processing}
          startIcon={processing ? null : <CheckCircle />}
        >
          {processing ? 'Processing...' : `Import ${files.length} File(s)`}
        </Button>
      </DialogActions>
      <Snackbar
        open={!!error} autoHideDuration={10000} onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }} variant="filled">{error}</Alert>
      </Snackbar>
    </Dialog>
  );
};

export default FileImportDialog;