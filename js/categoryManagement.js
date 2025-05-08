// Default categories
const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Ideas', 'Tasks'];
const DEFAULT_CATEGORY_COLOR = 'rgba(36, 183, 252, 0.1)'; // Default light blue

// Get all categories (existing ones from storage or defaults)
export function getCategories() {
    const savedCategories = localStorage.getItem('noteCategories');
    if (savedCategories) {
        return JSON.parse(savedCategories);
    }
    // If no categories exist yet, save and return defaults
    saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
}

// Save categories to localStorage
export function saveCategories(categories) {
    localStorage.setItem('noteCategories', JSON.stringify(categories));
}

// Add a new category
export function addCategory(categoryName) {
    if (!categoryName.trim()) return false;

    const categories = getCategories();
    if (categories.includes(categoryName)) return false;

    categories.push(categoryName);
    saveCategories(categories);
    return true;
}

// Remove a category and reassign its notes
export function removeCategory(categoryToRemove, newCategory) {
    const categories = getCategories();
    const index = categories.indexOf(categoryToRemove);

    if (index === -1) return false;

    // Remove the category
    categories.splice(index, 1);
    saveCategories(categories);

    // Get saved category colors and remove the deleted category color
    const categoryColors = getCategoryColors();
    if (categoryColors[categoryToRemove]) {
        delete categoryColors[categoryToRemove];
        saveCategoryColors(categoryColors);
    }

    // Reassign notes from the removed category to the new category
    const savedNotes = localStorage.getItem('stickyNotes');
    if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        notes.forEach(note => {
            if (note.category === categoryToRemove) {
                note.category = newCategory;
            }
        });
        localStorage.setItem('stickyNotes', JSON.stringify(notes));
    }

    return true;
}

// Get all category colors from localStorage
export function getCategoryColors() {
    const savedColors = localStorage.getItem('categoryColors');
    if (savedColors) {
        return JSON.parse(savedColors);
    }
    return {};
}

// Save category colors to localStorage
export function saveCategoryColors(colorMap) {
    localStorage.setItem('categoryColors', JSON.stringify(colorMap));
}

// Set color for a specific category
export function setCategoryColor(categoryName, colorValue) {
    const categoryColors = getCategoryColors();
    categoryColors[categoryName] = colorValue;
    saveCategoryColors(categoryColors);
    return true;
}

// Get color for a specific category, return default if not found
export function getCategoryColor(categoryName) {
    const categoryColors = getCategoryColors();
    return categoryColors[categoryName] || DEFAULT_CATEGORY_COLOR;
}
