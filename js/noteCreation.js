import { saveNotes } from './noteStorage.js';
import { getCategories } from './categoryManagement.js';

// Update the createStickyNote function to include deadline parameter
export function createStickyNote(title = "Title", body = "Content", color = "#fff9a6", category = "Personal", deadline = "") {
    // Create the main note container
    const note = document.createElement("div");
    note.classList.add("note");
    note.style.backgroundColor = color;
    note.dataset.category = category; // Store category in data attribute
    note.dataset.deadline = deadline; // Store deadline in data attribute

    // Create note header to contain title and dropdown menu
    const noteHeader = document.createElement("div");
    noteHeader.classList.add("note-header");

    // Create dropdown menu container
    const dropdownContainer = document.createElement("div");
    dropdownContainer.classList.add("dropdown-container");

    // Create dropdown toggle button
    const dropdownToggle = document.createElement("button");
    dropdownToggle.classList.add("dropdown-toggle");
    dropdownToggle.innerHTML = "⋮"; // Three vertical dots menu icon
    dropdownToggle.setAttribute("aria-label", "Note options");

    // Create dropdown menu content
    const dropdownContent = document.createElement("div");
    dropdownContent.classList.add("dropdown-content");

    // Add color options to dropdown
    const colorOptions = [
        { name: "Yellow", value: "#fff9a6" },
        { name: "Blue", value: "#a6e7ff" },
        { name: "Green", value: "#b5f5c5" },
        { name: "Pink", value: "#ffd1dc" }
    ];

    // Create color option elements
    colorOptions.forEach(colorOption => {
        const colorElement = document.createElement("div");
        colorElement.classList.add("dropdown-item", "color-option");

        const colorSwatch = document.createElement("span");
        colorSwatch.classList.add("color-swatch");
        colorSwatch.style.backgroundColor = colorOption.value;

        const colorText = document.createElement("span");
        colorText.textContent = colorOption.name;

        colorElement.appendChild(colorSwatch);
        colorElement.appendChild(colorText);

        // Add event listener to change note color
        colorElement.addEventListener('click', () => {
            note.style.backgroundColor = colorOption.value;
            dropdownContent.classList.remove("show");
            saveNotes();
        });

        dropdownContent.appendChild(colorElement);
    });

    // Function to build category options - this will be called each time the dropdown is opened
    function buildCategoryOptions() {
        // Remove any existing category options
        const existingCategorySection = dropdownContent.querySelector('.category-section-container');
        if (existingCategorySection) {
            existingCategorySection.remove();
        }

        // Create container for category section
        const categorySectionContainer = document.createElement('div');
        categorySectionContainer.classList.add('category-section-container');

        // Add category section title
        const categoryTitle = document.createElement("div");
        categoryTitle.classList.add("dropdown-section-title");
        categoryTitle.textContent = "Move to category:";
        categorySectionContainer.appendChild(categoryTitle);

        // Add category options
        getCategories().forEach(categoryName => {
            const categoryOption = document.createElement("div");
            categoryOption.classList.add("dropdown-item", "category-option");

            if (categoryName === note.dataset.category) {
                categoryOption.classList.add("active-category");
            }

            categoryOption.textContent = categoryName;

            // Add event listener to change note category
            categoryOption.addEventListener('click', () => {
                note.dataset.category = categoryName;
                dropdownContent.classList.remove("show");

                // Move the note to the correct category section in the UI
                const categorySection = document.querySelector(`.category-section[data-category="${categoryName}"]`);
                if (categorySection) {
                    const notesContainer = categorySection.querySelector('.category-notes');
                    notesContainer.appendChild(note);
                    saveNotes();
                }
            });

            categorySectionContainer.appendChild(categoryOption);
        });

        // Add divider before category section
        const dividerBefore = document.createElement("div");
        dividerBefore.classList.add("dropdown-divider");
        dropdownContent.appendChild(dividerBefore);

        // Add the category section
        dropdownContent.appendChild(categorySectionContainer);

        // Add divider after category section
        const dividerAfter = document.createElement("div");
        dividerAfter.classList.add("dropdown-divider");
        dropdownContent.appendChild(dividerAfter);
    }

    // Add set deadline option
    const setDeadlineOption = document.createElement("div");
    setDeadlineOption.classList.add("dropdown-item", "deadline-option");
    setDeadlineOption.textContent = "Set deadline";
    setDeadlineOption.addEventListener('click', () => {
        showDeadlineDialog(note);
        dropdownContent.classList.remove("show");
    });
    dropdownContent.appendChild(setDeadlineOption);

    // Add divider after deadline option
    const dividerAfterDeadline = document.createElement("div");
    dividerAfterDeadline.classList.add("dropdown-divider");
    dropdownContent.appendChild(dividerAfterDeadline);

    // Add delete option
    const deleteOption = document.createElement("div");
    deleteOption.classList.add("dropdown-item", "delete-option");
    deleteOption.textContent = "Delete note";
    deleteOption.addEventListener('click', () => {
        note.remove();
        saveNotes();
    });
    dropdownContent.appendChild(deleteOption);

    // Toggle dropdown visibility when clicked and rebuild category options
    dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();

        // If we're opening the dropdown, rebuild the category options
        if (!dropdownContent.classList.contains("show")) {
            buildCategoryOptions();
        }

        dropdownContent.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (dropdownContent.classList.contains("show")) {
            dropdownContent.classList.remove("show");
        }
    });

    // Prevent dropdown from closing when clicking inside it
    dropdownContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Append dropdown elements
    dropdownContainer.appendChild(dropdownToggle);
    dropdownContainer.appendChild(dropdownContent);

    // Create title element
    const noteTitle = document.createElement("div");
    noteTitle.classList.add("note-title");
    noteTitle.contentEditable = true;
    noteTitle.innerHTML = title;

    // Append title and dropdown to header
    noteHeader.appendChild(noteTitle);
    noteHeader.appendChild(dropdownContainer);

    // Create deadline display element if a deadline exists
    if (deadline) {
        const deadlineElement = createDeadlineElement(deadline);
        note.appendChild(deadlineElement);
    }

    // Create body element
    const noteBody = document.createElement("div");
    noteBody.classList.add("note-body");
    noteBody.contentEditable = true;
    noteBody.innerHTML = body;

    // Add event listeners to save on content changes
    noteTitle.addEventListener('blur', saveNotes);
    noteBody.addEventListener('blur', saveNotes);

    // Append header and body to the note
    note.appendChild(noteHeader);
    note.appendChild(noteBody);

    // Check and update the deadline status (for visual indicator)
    updateDeadlineStatus(note);

    // Find the category section and append the note there
    const categorySection = document.querySelector(`.category-section[data-category="${category}"]`);
    if (categorySection) {
        const notesContainer = categorySection.querySelector('.category-notes');
        notesContainer.appendChild(note);
    } else {
        // If category section doesn't exist, add to the first available section
        const firstSection = document.querySelector('.category-section');
        if (firstSection) {
            const notesContainer = firstSection.querySelector('.category-notes');
            notesContainer.appendChild(note);
        } else {
            // Fallback to main container if no sections exist
            document.getElementById("notes-container").appendChild(note);
        }
    }

    return note;
}

// Function to create a new category section in the UI
export function createCategorySection(categoryName) {
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

    // Create category title
    const title = document.createElement('h2');
    title.classList.add('category-title');
    title.textContent = categoryName;

    // Add category title to header
    header.appendChild(title);

    // Create container for notes in this category
    const categoryNotes = document.createElement('div');
    categoryNotes.classList.add('category-notes');

    // Assemble section
    section.appendChild(header);
    section.appendChild(categoryNotes);

    // Add to main container
    container.appendChild(section);
}

// Function to create a deadline display element
function createDeadlineElement(deadline) {
    const deadlineContainer = document.createElement("div");
    deadlineContainer.classList.add("note-deadline-container");

    const deadlineIcon = document.createElement("span");
    deadlineIcon.classList.add("deadline-icon");
    deadlineIcon.textContent = "📅";

    const deadlineText = document.createElement("span");
    deadlineText.classList.add("deadline-text");
    deadlineText.textContent = deadline;

    deadlineContainer.appendChild(deadlineIcon);
    deadlineContainer.appendChild(deadlineText);

    return deadlineContainer;
}

// Function to update the deadline status (for visual indicator)
export function updateDeadlineStatus(note) {
    // Remove any existing status classes
    note.classList.remove("deadline-approaching", "deadline-overdue");

    const deadline = note.dataset.deadline;
    if (!deadline) return;

    // Parse the deadline (format: dd/mm-yyyy)
    const [day, monthYear] = deadline.split('/');
    const [month, year] = monthYear.split('-');

    // JavaScript months are 0-indexed
    const deadlineDate = new Date(year, parseInt(month) - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    const timeDiff = deadlineDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Check if deadline is approaching (within 3 days) or overdue
    if (daysDiff < 0) {
        note.classList.add("deadline-overdue");
    } else if (daysDiff <= 3) {
        note.classList.add("deadline-approaching");
    }
}

// Function to show a dialog for setting a deadline
function showDeadlineDialog(note) {
    // Create modal dialog
    const modal = document.createElement('div');
    modal.classList.add('modal');

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    // Create title
    const title = document.createElement('h3');
    title.textContent = 'Set Deadline';
    modalContent.appendChild(title);

    // Create date input field
    const dateLabel = document.createElement('label');
    dateLabel.textContent = 'Select Date (dd/mm-yyyy):';
    dateLabel.setAttribute('for', 'deadline-date-input');
    modalContent.appendChild(dateLabel);

    // Replace your native date input:
    const dateInput = document.createElement('input');
    dateInput.type        = 'date';
    dateInput.id          = 'deadline-date-input';
    dateInput.className   = 'modal-input';


   // If there's already a deadline, set the input value
    if (note.dataset.deadline) {
        const [day, month, year] = note.dataset.deadline.split(/[-\/]/);
        // Convert to the correct input format (yyyy-mm-dd)
        dateInput.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    
    dateInput.addEventListener("change", () => {
        const [year, month, day] = dateInput.value.split("-");
        note.dataset.deadline = `${day}/${month}-${year}`;
    });
    
    modalContent.appendChild(dateInput);

    // Create buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('modal-buttons');

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove Deadline';
    removeButton.addEventListener('click', () => {
        // Remove deadline data attribute
        note.dataset.deadline = '';

        // Remove deadline element if it exists
        const deadlineElement = note.querySelector('.note-deadline-container');
        if (deadlineElement) {
            note.removeChild(deadlineElement);
        }

        // Remove any status classes
        note.classList.remove("deadline-approaching", "deadline-overdue");

        // Save notes
        saveNotes();
        document.body.removeChild(modal);
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('primary-button');
    saveButton.addEventListener('click', () => {
        if (!dateInput.value) {
            alert('Please select a date');
            return;
        }

        // Format date as dd/mm-yyyy
        const date = new Date(dateInput.value);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const formattedDeadline = `${day}/${month}-${year}`;

        // Update note's deadline data attribute
        note.dataset.deadline = formattedDeadline;

        // Remove existing deadline element if it exists
        const existingDeadline = note.querySelector('.note-deadline-container');
        if (existingDeadline) {
            note.removeChild(existingDeadline);
        }

        // Add the new deadline element after the header
        const deadlineElement = createDeadlineElement(formattedDeadline);
        const header = note.querySelector('.note-header');
        note.insertBefore(deadlineElement, header.nextSibling);

        // Update deadline status (for visual indicator)
        updateDeadlineStatus(note);

        // Save notes
        saveNotes();
        document.body.removeChild(modal);
    });

    // Add buttons in this order: Remove (left), Cancel and Save (right)
    buttonContainer.appendChild(removeButton);
    const rightButtons = document.createElement('div');
    rightButtons.style.marginLeft = 'auto';
    rightButtons.appendChild(cancelButton);
    rightButtons.appendChild(saveButton);
    buttonContainer.appendChild(rightButtons);

    modalContent.appendChild(buttonContainer);

    // Add modal content to modal
    modal.appendChild(modalContent);

    // Add modal to body
    document.body.appendChild(modal);

    // Focus on date input
    dateInput.focus();

    // Close modal if clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}