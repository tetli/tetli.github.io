import { createStickyNote } from './noteCreation.js';
import { getCategories } from './categoryManagement.js';

// Function to save notes to localStorage
export function saveNotes() {
    const notesContainer = document.getElementById("notes-container");
    const notes = [];
    // Collect all notes
    const noteElements = notesContainer.querySelectorAll('.note');
    noteElements.forEach(noteElement => {
        const title = noteElement.querySelector('.note-title').innerHTML;
        const body = noteElement.querySelector('.note-body').innerHTML;
        const color = noteElement.style.backgroundColor;
        const category = noteElement.dataset.category;
        notes.push({ title, body, color, category });
    });
    // Save to localStorage
    localStorage.setItem('stickyNotes', JSON.stringify(notes));
}

// Function to load notes from localStorage
export function loadNotes() {
    const savedNotes = localStorage.getItem('stickyNotes');
    if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        // Create each saved note
        notes.forEach(note => {
            // Use the saved category or default to the first category
            const category = note.category || getCategories()[0];
            createStickyNote(note.title, note.body, note.color, category);
        });
    }
}