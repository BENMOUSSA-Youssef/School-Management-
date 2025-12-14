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
 * @param {string} moduleId - Module ID to edit
 */
function editModule(moduleId) {
    const module = getModuleById(moduleId);
    
    if (!module) {
        showAlert('Module not found!', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('moduleName').value = module.name;
    document.getElementById('moduleCoefficient').value = module.coefficient;
    
    // Set editing mode
    editingModuleId = moduleId;
    document.getElementById('formTitle').textContent = 'Edit Module';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Delete a module after confirmation
 * @param {string} moduleId - Module ID to delete
 */
function deleteModuleHandler(moduleId) {
    const module = getModuleById(moduleId);
    
    if (!module) {
        showAlert('Module not found!', 'error');
        return;
    }
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete "${module.name}"? This will also delete all grades for this module.`)) {
        deleteModule(moduleId); // Call function from data.js
        displayModules();
        showAlert('Module deleted successfully!', 'success');
        
        // Reset form if we were editing this module
        if (editingModuleId === moduleId) {
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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add rows for each module
    modules.forEach(module => {
        tableHTML += `
            <tr>
                <td>${module.name}</td>
                <td>${module.coefficient}</td>
                <td>
                    <button class="btn btn-warning btn-small" onclick="editModule('${module.id}')">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteModuleHandler('${module.id}')">
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
        coefficient: coefficient
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

