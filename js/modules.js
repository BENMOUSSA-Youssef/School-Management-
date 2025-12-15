/**
 * ============================================
 * modules.js - Module Management Logic
 * ============================================
 * 
 * This file handles:
 * - Adding new modules
 * - Editing existing modules
 * - Deleting modules
 * - Displaying modules in a table
 * - Form validation
 */

// Global variable to track if we're editing
let editingModuleId = null;

/**
 * Show alert message
 * @param {string} message - Message to display
 * @param {string} type - Alert type: 'success' or 'error'
 */
function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';
    
    // Hide alert after 3 seconds
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 3000);
}

/**
 * Clear the form and reset to "add" mode
 */
function resetForm() {
    document.getElementById('moduleForm').reset();
    editingModuleId = null;
    document.getElementById('formTitle').textContent = 'Add New Module';
    document.getElementById('cancelBtn').style.display = 'none';
}

/**
 * Populate form with module data for editing
 * @param {number|string} moduleId - Module ID to edit
 */
function editModule(moduleId) {
    // Convert to number to ensure correct type
    const id = typeof moduleId === 'string' ? parseInt(moduleId) : moduleId;
    const module = getModuleById(id);
    
    if (!module) {
        showAlert('Module not found!', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('moduleName').value = module.name;
    document.getElementById('moduleCoefficient').value = module.coefficient;
    document.getElementById('moduleExamDate').value = module.examDate || '';
    
    // Set editing mode
    editingModuleId = id;
    document.getElementById('formTitle').textContent = 'Edit Module';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Delete a module after confirmation
 * @param {number|string} moduleId - Module ID to delete
 */
function deleteModuleHandler(moduleId) {
    // Convert to number to ensure correct type
    const id = typeof moduleId === 'string' ? parseInt(moduleId) : moduleId;
    
    if (isNaN(id)) {
        showAlert('Invalid module ID!', 'error');
        console.error('Invalid module ID:', moduleId, typeof moduleId);
        return;
    }
    
    console.log('Attempting to delete module with ID:', id, typeof id);
    const module = getModuleById(id);
    console.log('Found module:', module);
    
    if (!module) {
        // Debug: show what modules exist
        const allModules = getModules();
        console.error('Module not found. Available modules:', allModules.map(m => ({ id: m.id, type: typeof m.id, name: m.name })));
        showAlert('Module not found!', 'error');
        return;
    }
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete "${module.name}"? This will also delete all grades for this module.`)) {
        deleteModule(id); // Call function from data.js with numeric ID
        displayModules();
        showAlert('Module deleted successfully!', 'success');
        
        // Reset form if we were editing this module
        if (editingModuleId === id || editingModuleId === moduleId) {
            resetForm();
        }
    }
}

/**
 * Display all modules in a table
 */
function displayModules() {
    const modules = getModules();
    const container = document.getElementById('modulesTableContainer');
    
    if (modules.length === 0) {
        container.innerHTML = '<p class="empty-state">No modules added yet. Use the form above to add modules.</p>';
        return;
    }
    
    // Create table
    let tableHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Module Name</th>
                        <th>Coefficient</th>
                        <th>Exam Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add rows for each module
    modules.forEach(module => {
        const examDate = module.examDate ? new Date(module.examDate).toLocaleDateString('fr-FR') : 'Not set';
        tableHTML += `
            <tr>
                <td><strong>${module.name}</strong></td>
                <td>${module.coefficient}</td>
                <td>${examDate}</td>
                <td>
                    <button class="btn btn-warning btn-small" onclick="editModule(${Number(module.id)})">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteModuleHandler(${Number(module.id)})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

/**
 * Handle form submission
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('moduleName').value.trim();
    const coefficient = parseFloat(document.getElementById('moduleCoefficient').value);
    const examDate = document.getElementById('moduleExamDate').value; // Can be empty
    
    // Validate inputs
    if (!name) {
        showAlert('Please enter a module name!', 'error');
        return;
    }
    
    if (isNaN(coefficient) || coefficient <= 0) {
        showAlert('Please enter a valid coefficient (greater than 0)!', 'error');
        return;
    }
    
    const moduleData = {
        name: name,
        coefficient: coefficient,
        examDate: examDate || '' // Store exam date (can be empty)
    };
    
    let success = false;
    
    if (editingModuleId) {
        // Update existing module
        success = updateModule(editingModuleId, moduleData);
        if (success) {
            showAlert('Module updated successfully!', 'success');
        } else {
            showAlert('Failed to update module. Name might already exist.', 'error');
            return;
        }
    } else {
        // Add new module
        success = addModule(moduleData);
        if (success) {
            showAlert('Module added successfully!', 'success');
        } else {
            showAlert('Failed to add module. Name already exists!', 'error');
            return;
        }
    }
    
    // Reset form and refresh table
    resetForm();
    displayModules();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Display existing modules
    displayModules();
    
    // Handle form submission
    document.getElementById('moduleForm').addEventListener('submit', handleFormSubmit);
    
    // Handle cancel button
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
});

