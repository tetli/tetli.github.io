import { saveNotes } from './noteStorage.js';

let draggedNote = null; // Stores the actual DOM element being dragged

function handleDragStart(e) {
    draggedNote = this; // 'this' is the note element being dragged
    // It's good practice to set some data, e.g., the note's ID
    e.dataTransfer.setData('text/plain', this.id);
    e.dataTransfer.effectAllowed = 'move';

    // Add 'dragging' class with a slight delay
    // This allows the browser to capture the drag image before the style changes
    setTimeout(() => {
        if (draggedNote) { // Check if draggedNote still exists (it should)
            draggedNote.classList.add('dragging');
        }
    }, 0);
}

function handleDragEnd() {
    // 'this' is the note element that was dragged
    if (this.classList.contains('dragging')) {
        this.classList.remove('dragging');
    }
    // Clean up any .drag-over classes on category containers
    document.querySelectorAll('.category-notes.drag-over').forEach(container => {
        container.classList.remove('drag-over');
    });
    draggedNote = null; // Clear the reference to the dragged note
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow a drop
    e.dataTransfer.dropEffect = 'move'; // Visual cue to the user

    // 'this' is the .category-notes container being dragged over
    // Add highlight if a note is being dragged and it's not over its current parent container
    if (draggedNote && draggedNote.parentElement !== this) {
        this.classList.add('drag-over');
    }
}

function handleDragEnter(e) {
    // 'this' is the .category-notes container
    // Add highlight if the cursor enters the container itself (not a child element within it)
    // and a valid note is being dragged from another container.
    if (e.target === this && draggedNote && draggedNote.parentElement !== this) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    // 'this' is the .category-notes container
    // Remove highlight if the cursor leaves the container itself.
    // Check e.relatedTarget to ensure the cursor is not moving to a child inside the container.
    if (e.target === this && (!e.relatedTarget || !this.contains(e.relatedTarget))) {
        this.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault(); // Prevent default browser action
    // 'this' is the .category-notes container where the note is dropped
    this.classList.remove('drag-over'); // Remove highlight

    // Proceed if a valid note was being dragged and it's not dropped into its original container
    if (draggedNote && draggedNote.parentElement !== this) {
        const categorySection = this.closest('.category-section');
        if (categorySection) {
            const targetCategoryName = categorySection.dataset.category;
            this.appendChild(draggedNote); // Move the actual DOM element
            draggedNote.dataset.category = targetCategoryName; // Update the note's category
            saveNotes(); // Save all notes with updated categories
        } else {
            console.error('Could not determine target category for the dropped note.');
        }
    }
    // draggedNote is cleared in handleDragEnd
}

export function initializeDragAndDrop() {
    // Initialize notes to be draggable
    const notes = document.querySelectorAll('.note');
    notes.forEach(note => {
        if (!note.id) { // Ensure each note has a unique ID for robust tracking
            note.id = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        note.setAttribute('draggable', 'true');

        // Remove existing listeners before adding new ones to prevent duplicates if this function is called multiple times
        note.removeEventListener('dragstart', handleDragStart);
        note.addEventListener('dragstart', handleDragStart);

        note.removeEventListener('dragend', handleDragEnd);
        note.addEventListener('dragend', handleDragEnd);
    });

    // Initialize category notes containers to be droppable
    const categoryNotesContainers = document.querySelectorAll('.category-notes');
    categoryNotesContainers.forEach(container => {
        // Remove existing listeners
        container.removeEventListener('dragover', handleDragOver);
        container.addEventListener('dragover', handleDragOver);

        container.removeEventListener('dragenter', handleDragEnter);
        container.addEventListener('dragenter', handleDragEnter);

        container.removeEventListener('dragleave', handleDragLeave);
        container.addEventListener('dragleave', handleDragLeave);

        container.removeEventListener('drop', handleDrop);
        container.addEventListener('drop', handleDrop);
    });
}
