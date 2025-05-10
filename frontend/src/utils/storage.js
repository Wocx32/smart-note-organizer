const STORAGE_KEY = 'smart_notes';
const TAGS_KEY = 'smart_notes_tags';

// Custom event for notes update
const NOTES_UPDATED_EVENT = 'smart_notes_updated';

export const getNotes = () => {
  const notes = localStorage.getItem(STORAGE_KEY);
  return notes ? JSON.parse(notes) : [];
};

export const saveNotes = (notes) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  // Dispatch event to notify components of notes update
  window.dispatchEvent(new Event(NOTES_UPDATED_EVENT));
};

export const addNote = (note) => {
  const notes = getNotes();
  const newNote = {
    ...note,
    id: Date.now(), // Use timestamp as unique ID
  };
  notes.unshift(newNote); // Add to beginning of array
  saveNotes(notes);
  
  // Update tags when adding a new note
  updateTagsFromNotes(notes);
  
  return newNote;
};

export const updateNote = (updatedNote) => {
  const notes = getNotes();
  const index = notes.findIndex(note => note.id === updatedNote.id);
  if (index !== -1) {
    notes[index] = updatedNote;
    saveNotes(notes);
    
    // Update tags when updating a note
    updateTagsFromNotes(notes);
  }
};

export const deleteNote = (noteId) => {
  const notes = getNotes();
  const filteredNotes = notes.filter(note => note.id !== noteId);
  saveNotes(filteredNotes);
  
  // Update tags when deleting a note
  updateTagsFromNotes(filteredNotes);
};

// Tag management functions
export const getTags = () => {
  const tags = localStorage.getItem(TAGS_KEY);
  return tags ? JSON.parse(tags) : [];
};

export const saveTags = (tags) => {
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  // Dispatch custom event when tags are updated
  window.dispatchEvent(new CustomEvent(NOTES_UPDATED_EVENT));
};

// Helper function to update tags based on all notes
const updateTagsFromNotes = (notes) => {
  const allTags = new Set();
  notes.forEach(note => {
    note.tags.forEach(tag => allTags.add(tag));
  });
  saveTags(Array.from(allTags));
}; 