import { saveNotes } from './noteStorage.js';
import { getCategories } from './categoryManagement.js';

// Creates a new editable sticky note and appends it to the notes container
export function createStickyNote(title = "Title", body = "Content", color = "#fff9a6", category = "Personal") {
    // Create the main note container
    const note = document.createElement("div");
    note.classList.add("note");
    note.style.backgroundColor = color;
    note.dataset.category = category; // Store category in data attribute

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