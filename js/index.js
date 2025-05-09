import { saveNotes, loadNotes, sortNotesByDeadline } from './noteStorage.js';
import { createStickyNote } from './noteCreation.js';
import { getCategories, addCategory, getCategoryColor, setCategoryColor } from './categoryManagement.js';
import { initializeDragAndDrop } from './dragAndDrop.js'; // Import the new module

// Get reference to the "Add Note" and "Clear All" buttons
const addNewNote = document.getElementById("addNewnote");
const clearAll = document.getElementById("clearAll");
const addCategoryBtn = document.getElementById("addCategory");

// Add event listener to create a new sticky note when button is clicked
addNewNote.addEventListener("click", () => {
    showAddNoteDialog();
});

// Add event listener to clear all notes from the container
clearAll.addEventListener("click", () => {
    // Instead of clearing the entire container, only remove the notes
    // within each category section
    const categoryNotes = document.querySelectorAll('.category-notes');
    categoryNotes.forEach(notesContainer => {
        notesContainer.innerHTML = '';
    });

    // Clear notes from localStorage but preserve categories
    localStorage.removeItem('stickyNotes');
});

// Update the showAddNoteDialog function to include deadline input
function showAddNoteDialog(preselectedCategory = null) {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.classList.add('modal');

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    // Create title
    const title = document.createElement('h3');
    title.textContent = 'Create New Note';
    modalContent.appendChild(title);

    // Create title input field
    const titleLabel = document.createElement('label');
    titleLabel.textContent = 'Note Title:';
    titleLabel.setAttribute('for', 'note-title-input');
    modalContent.appendChild(titleLabel);

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'note-title-input';
    titleInput.className = 'modal-input';
    titleInput.placeholder = 'Enter note title';
    titleInput.value = 'Title';
    modalContent.appendChild(titleInput);

    // Create category selection
    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'Select Category:';
    categoryLabel.setAttribute('for', 'category-select');
    modalContent.appendChild(categoryLabel);

    const categorySelect = document.createElement('select');
    categorySelect.id = 'category-select';

    // Add categories as options
    getCategories().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        // If a preselected category is provided, select it
        if (preselectedCategory && category === preselectedCategory) {
            option.selected = true;
        }
        categorySelect.appendChild(option);
    });

    modalContent.appendChild(categorySelect);

    // Add deadline input field (optional)
    const deadlineLabel = document.createElement('label');
    deadlineLabel.textContent = 'Set Deadline (optional):';
    deadlineLabel.setAttribute('for', 'deadline-input');
    modalContent.appendChild(deadlineLabel);

    const deadlineInput = document.createElement('input');
    deadlineInput.type = 'date';
    deadlineInput.id = 'deadline-input';
    deadlineInput.className = 'modal-input';
    modalContent.appendChild(deadlineInput);

    // Create buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('modal-buttons');

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    const createButton = document.createElement('button');
    createButton.textContent = 'Create';
    createButton.classList.add('primary-button');
    createButton.addEventListener('click', () => {
        const selectedCategory = categorySelect.value;
        const noteTitle = titleInput.value.trim() || 'Title'; // Use entered title or default to 'Title'

        // Format deadline if provided (dd/mm-yyyy)
        let formattedDeadline = '';
        if (deadlineInput.value) {
            const date = new Date(deadlineInput.value);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            formattedDeadline = `${day}/${month}-${year}`;
        }

        createStickyNote(noteTitle, "Content", "#fff9a6", selectedCategory, formattedDeadline);
        saveNotes(); // Save the new note to localStorage
        initializeDragAndDrop(); // Make the new note draggable and update drop targets
        document.body.removeChild(modal);
    });

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(createButton);
    modalContent.appendChild(buttonContainer);

    // Add modal content to modal
    modal.appendChild(modalContent);

    // Add modal to body
    document.body.appendChild(modal);

    // Close modal if clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}


// Add event listener for the Add Category button
if (addCategoryBtn) {
    addCategoryBtn.addEventListener("click", () => {
        showAddCategoryDialog();
    });
}

// Function to create a new category with color selection
function showAddCategoryDialog() {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.classList.add('modal');

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    // Create title
    const title = document.createElement('h3');
    title.textContent = 'Create New Category';
    modalContent.appendChild(title);

    // Create name input field
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Category Name:';
    nameLabel.setAttribute('for', 'category-name-input');
    modalContent.appendChild(nameLabel);

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'category-name-input';
    nameInput.className = 'modal-input';
    nameInput.placeholder = 'Enter category name';
    modalContent.appendChild(nameInput);

    // Create color selection
    const colorLabel = document.createElement('label');
    colorLabel.textContent = 'Select Color:';
    modalContent.appendChild(colorLabel);

    // Create color options container
    const colorOptionsContainer = document.createElement('div');
    colorOptionsContainer.classList.add('color-options-container');

    
    // Define BRIGHTER color options
    const colorOptions = [
        { name: "Bright Blue", value: "#00bfff" },       // Brighter Blue (Deep Sky Blue with more opacity)
        { name: "Bright Green", value: "#00ff00" },        // Brighter Green (Lime with more opacity)
        { name: "Bright Pink", value: "#ff69b4" },      // Brighter Pink (Hot Pink with more opacity)
        { name: "Bright Purple", value: "rgba(138, 43, 226, 0.7)" },     // Brighter Purple (Blue Violet with more opacity)
        { name: "Bright Orange", value: "#ffa500" }       // Brighter Orange (with more opacity)
    ];

    // Track selected color
    let selectedColor = colorOptions[0].value;

    // Create color swatches
    colorOptions.forEach(colorOption => {
        const colorSwatch = document.createElement('div');
        colorSwatch.classList.add('color-swatch-option');
        colorSwatch.style.backgroundColor = colorOption.value;
        colorSwatch.title = colorOption.name;

        // Mark first option as selected by default
        if (colorOption.value === selectedColor) {
            colorSwatch.classList.add('selected');
        }

        colorSwatch.addEventListener('click', () => {
            // Remove selected class from all swatches
            document.querySelectorAll('.color-swatch-option').forEach(swatch => {
                swatch.classList.remove('selected');
            });

            // Add selected class to this swatch
            colorSwatch.classList.add('selected');

            // Update selected color
            selectedColor = colorOption.value;
        });

        colorOptionsContainer.appendChild(colorSwatch);
    });

    modalContent.appendChild(colorOptionsContainer);

    // Create buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('modal-buttons');

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    const createButton = document.createElement('button');
    createButton.textContent = 'Create';
    createButton.classList.add('primary-button');
    createButton.addEventListener('click', () => {
        const categoryName = nameInput.value.trim();

        if (!categoryName) {
            alert("Please enter a category name");
            return;
        }

        if (addCategory(categoryName)) {
            // Create the category section
            createCategorySection(categoryName);

            // Set the category color
            setCategoryColor(categoryName, selectedColor);

            // Update the header color
            const categoryHeader = document.querySelector(`.category-section[data-category="${categoryName}"] .category-header`);
            if (categoryHeader) {
                categoryHeader.style.backgroundColor = selectedColor;
            }
            initializeDragAndDrop(); // Ensure new category container is a drop target
            document.body.removeChild(modal);
        } else {
            alert("Category already exists!");
        }
    });

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(createButton);
    modalContent.appendChild(buttonContainer);

    // Add modal content to modal
    modal.appendChild(modalContent);

    // Add modal to body
    document.body.appendChild(modal);

    // Focus on name input
    nameInput.focus();

    // Close modal if clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Function to create a new category section in the UI
function createCategorySection(categoryName) {
    const container = document.getElementById('notes-container');

    // Check if this category section already exists
    if (document.querySelector(`.category-section[data-category="${categoryName}"]`)) {
        return;
    }

    // Create category section
    const section = document.createElement('div');
    section.classList.add('category-section');
    section.dataset.category = categoryName;

    // Create category header
    const header = document.createElement('div');
    header.classList.add('category-header');

    // Set the saved color or default
    const categoryColor = getCategoryColor(categoryName);
    header.style.backgroundColor = categoryColor;

    // Create category title
    const title = document.createElement('h2');
    title.classList.add('category-title');
    title.textContent = categoryName;

    // Create dropdown for category actions
    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('dropdown-container', 'category-dropdown');

    // Create dropdown toggle (three dots)
    const dropdownToggle = document.createElement('button');
    dropdownToggle.classList.add('dropdown-toggle');
    dropdownToggle.innerHTML = '⋮'; // Three vertical dots
    dropdownToggle.setAttribute('aria-label', 'Category options');

    // Create dropdown content
    const dropdownContent = document.createElement('div');
    dropdownContent.classList.add('dropdown-content');

    // Add color options to dropdown
    const colorSectionHeader = document.createElement('div');
    colorSectionHeader.classList.add('dropdown-section-title');
    colorSectionHeader.textContent = 'Change color:';
    dropdownContent.appendChild(colorSectionHeader);

    // Define color options
    const colorOptions = [
        { name: "Bright Blue", value: "#00bfff" },       // Brighter Blue (Deep Sky Blue with more opacity)
        { name: "Bright Green", value: "#00ff00" },        // Brighter Green (Lime with more opacity)
        { name: "Bright Pink", value: "#ff69b4" },      // Brighter Pink (Hot Pink with more opacity)
        { name: "Bright Purple", value: "rgba(138, 43, 226, 0.7)" },     // Brighter Purple (Blue Violet with more opacity)
        { name: "Bright Orange", value: "#ffa500" }       // Brighter Orange (with more opacity)
    ];

    // Create color option elements
    colorOptions.forEach(colorOption => {
        const colorElement = document.createElement('div');
        colorElement.classList.add('dropdown-item', 'color-option');

        const colorSwatch = document.createElement('span');
        colorSwatch.classList.add('color-swatch');
        colorSwatch.style.backgroundColor = colorOption.value;

        const colorText = document.createElement('span');
        colorText.textContent = colorOption.name;

        colorElement.appendChild(colorSwatch);
        colorElement.appendChild(colorText);

        // Add event listener to change category color
        colorElement.addEventListener('click', () => {
            header.style.backgroundColor = colorOption.value;
            setCategoryColor(categoryName, colorOption.value);
            dropdownContent.classList.remove('show');
        });

        dropdownContent.appendChild(colorElement);
    });

    // Add divider
    const divider = document.createElement('div');
    divider.classList.add('dropdown-divider');
    dropdownContent.appendChild(divider);

    // Add new note option
    const newNoteOption = document.createElement('div');
    newNoteOption.classList.add('dropdown-item', 'new-note-option');
    newNoteOption.textContent = 'Add new note';
    newNoteOption.addEventListener('click', () => {
        // Replace direct sticky note creation with the dialog
        showAddNoteDialog(categoryName);
        dropdownContent.classList.remove('show');
    });
    dropdownContent.appendChild(newNoteOption);

    // Add divider between options
    const divider2 = document.createElement('div');
    divider2.classList.add('dropdown-divider');
    dropdownContent.appendChild(divider2);

    // Add delete option
    const deleteOption = document.createElement('div');
    deleteOption.classList.add('dropdown-item', 'delete-option');
    deleteOption.textContent = 'Delete category';
    deleteOption.addEventListener('click', () => {
        handleCategoryRemoval(categoryName, section);
    });

    dropdownContent.appendChild(deleteOption);

    // Toggle dropdown visibility when clicked
    dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (dropdownContent.classList.contains('show')) {
            dropdownContent.classList.remove('show');
        }
    });

    // Prevent dropdown from closing when clicking inside it
    dropdownContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Assemble dropdown
    dropdownContainer.appendChild(dropdownToggle);
    dropdownContainer.appendChild(dropdownContent);

    // Add title and dropdown to header
    header.appendChild(title);
    header.appendChild(dropdownContainer);

    // Create container for notes in this category
    const categoryNotes = document.createElement('div');
    categoryNotes.classList.add('category-notes');

    // Assemble section
    section.appendChild(header);
    section.appendChild(categoryNotes);

    // Add to main container
    container.appendChild(section);
}

// Function to handle category removal
function handleCategoryRemoval(categoryName, sectionElement) {
    const categories = getCategories();

    // Don't allow removing the last category
    if (categories.length <= 1) {
        alert("Cannot delete the only remaining category");
        return;
    }

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete the "${categoryName}" category? All notes in this category will be moved to the first available category.`)) {
        return;
    }

    // Find alternative category to move notes to
    const alternativeCategory = categories.find(cat => cat !== categoryName);

    // Get all notes in this category
    const notes = sectionElement.querySelectorAll('.note');

    if (notes.length > 0) {
        // Find the target category section
        const targetSection = document.querySelector(`.category-section[data-category="${alternativeCategory}"]`);
        const targetNotesContainer = targetSection.querySelector('.category-notes');

        // Move each note to the alternative category
        notes.forEach(note => {
            note.dataset.category = alternativeCategory;
            targetNotesContainer.appendChild(note);
        });
    }

    // Remove the category section from UI
    sectionElement.remove();

    // Remove the category from storage
    const index = categories.indexOf(categoryName);
    if (index !== -1) {
        categories.splice(index, 1);
        localStorage.setItem('noteCategories', JSON.stringify(categories));
    }

    // Save notes with updated categories
    saveNotes();
    initializeDragAndDrop(); // Re-initialize in case notes were moved or categories changed
}

// Function to toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    // Save preference to localStorage
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Function to check if dark mode is enabled in localStorage
function checkDarkModePreference() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
}

// Set up dark mode toggle and load notes
document.addEventListener('DOMContentLoaded', () => {
    // First ensure we have the category management JS
    if (typeof getCategories !== 'function') {
        console.error('Category management not loaded!');
        return;
    }

    // Create initial category sections
    const categories = getCategories();
    categories.forEach(category => {
        createCategorySection(category);
    });

    // Load saved notes
    loadNotes(); // This calls createStickyNote, which now assigns IDs

    initializeDragAndDrop(); // Initialize for all loaded notes and category containers

    // Check if dark mode was previously enabled
    checkDarkModePreference();

    // Set up event listener for dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
});

// Create Sort by Deadline button
const sortButton = document.createElement('button');
sortButton.id = 'sortDeadlines';
sortButton.className = 'buttons';
sortButton.textContent = 'Sort by Deadline';
sortButton.addEventListener('click', sortNotesByDeadline);

// Add to button container
document.getElementById('btnContainer').appendChild(sortButton);