import { createStickyNote } from './noteCreation.js';
import { getCategories } from './categoryManagement.js';

// Update the saveNotes function to include deadlines
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
        const deadline = noteElement.dataset.deadline || ''; // Get deadline or empty string
        notes.push({ title, body, color, category, deadline });
    });
    // Save to localStorage
    localStorage.setItem('stickyNotes', JSON.stringify(notes));
}

// Update the loadNotes function to include deadlines
export function loadNotes() {
    const savedNotes = localStorage.getItem('stickyNotes');
    if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        // Create each saved note
        notes.forEach(note => {
            // Use the saved category or default to the first category
            const category = note.category || getCategories()[0];
            createStickyNote(note.title, note.body, note.color, category, note.deadline || '');
        });
    }
}

// Sorting functionality for notes by deadline
export function sortNotesByDeadline() {
    const categories = getCategories();

    categories.forEach(category => {
        const categorySection = document.querySelector(`.category-section[data-category="${category}"]`);
        if (!categorySection) return;

        const notesContainer = categorySection.querySelector('.category-notes');
        const notes = Array.from(notesContainer.querySelectorAll('.note'));

        // Sort notes by deadline
        notes.sort((a, b) => {
            const deadlineA = a.dataset.deadline;
            const deadlineB = b.dataset.deadline;

            // Notes without deadlines come last
            if (!deadlineA && !deadlineB) return 0;
            if (!deadlineA) return 1;
            if (!deadlineB) return -1;

            // Parse dates (format: dd/mm-yyyy)
            const [dayA, monthYearA] = deadlineA.split('/');
            const [monthA, yearA] = monthYearA.split('-');
            const dateA = new Date(yearA, parseInt(monthA) - 1, dayA);

            const [dayB, monthYearB] = deadlineB.split('/');
            const [monthB, yearB] = monthYearB.split('-');
            const dateB = new Date(yearB, parseInt(monthB) - 1, dayB);

            return dateA - dateB;
        });

        // Re-append notes in sorted order
        notes.forEach(note => notesContainer.appendChild(note));
    });

    // Save the new order
    saveNotes();
}