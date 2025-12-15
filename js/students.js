/**
 * ============================================
 * students.js - Student Management Logic
 * ============================================
 * 
 * KEY JAVASCRIPT CONCEPTS USED:
 * 1. DOM Manipulation - Getting and setting HTML elements
 * 2. Event Listeners - Handling form submissions and button clicks
 * 3. localStorage - Saving and retrieving data
 * 4. Functions - Reusable code blocks
 * 5. Arrays & Objects - Storing and manipulating data
 * 6. Loops (forEach) - Iterating through arrays
 * 7. Conditionals (if/else) - Making decisions
 * 8. Template Literals - Building HTML strings
 * 
 * This file handles:
 * - Adding new students (CRUD: Create)
 * - Editing existing students (CRUD: Update)
 * - Deleting students (CRUD: Delete)
 * - Displaying students in a table (CRUD: Read)
 * - Form validation
 */

// Global variable to track if we're editing a student
// This helps us know if we're adding new or updating existing
let editingStudentId = null;

/**
 * Show alert message
 * @param {string} message - Message to display
 * @param {string} type - Alert type: 'success' or 'error'
 */
function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) {
        console.error('Alert div not found!');
        return;
    }
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';
    
    // Hide alert after 5 seconds
    setTimeout(() => {
        if (alertDiv) {
            alertDiv.style.display = 'none';
            alertDiv.textContent = '';
        }
    }, 5000);
}

/**
 * Clear alert message
 */
function clearAlert() {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.style.display = 'none';
        alertDiv.textContent = '';
        alertDiv.className = 'alert';
    }
}

/**
 * Clear the form and reset to "add" mode
 */
function resetForm() {
    document.getElementById('studentForm').reset();
    editingStudentId = null;
    document.getElementById('formTitle').textContent = 'Add New Student';
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('studentCIN').disabled = false;
    clearAlert(); // Clear any error messages
    populateUserDropdown();
}

/**
 * Populate form with student data for editing
 * @param {number|string} studentId - Student ID to edit
 */
function editStudent(studentId) {
    // Convert to number to ensure correct type
    const id = typeof studentId === 'string' ? parseInt(studentId) : studentId;
    
    if (isNaN(id)) {
        showAlert('Invalid student ID!', 'error');
        return;
    }
    
    const student = getStudentById(id);
    
    if (!student) {
        showAlert('Student not found!', 'error');
        return;
    }
    
    // Populate form
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentCIN').value = student.cin;
    document.getElementById('studentGroup').value = student.group;
    document.getElementById('studentUserId').value = student.userId || '';
    
    // Set editing mode
    editingStudentId = id; // Use the converted numeric ID
    document.getElementById('formTitle').textContent = 'Edit Student';
    document.getElementById('cancelBtn').style.display = 'inline-block';
    document.getElementById('studentCIN').disabled = true; // Prevent CIN change
    
    // Refresh user dropdown
    populateUserDropdown();
    document.getElementById('studentUserId').value = student.userId || '';
    
    // Scroll to form
    document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Delete a student after confirmation
 * @param {number|string} studentId - Student ID to delete
 */
function deleteStudentHandler(studentId) {
    // Convert to number to ensure correct type
    const id = typeof studentId === 'string' ? parseInt(studentId) : studentId;
    
    if (isNaN(id)) {
        showAlert('Invalid student ID!', 'error');
        console.error('Invalid student ID:', studentId, typeof studentId);
        return;
    }
    
    console.log('Attempting to delete student with ID:', id, typeof id);
    const student = getStudentById(id);
    console.log('Found student:', student);
    
    if (!student) {
        // Debug: show what students exist
        const allStudents = getStudents();
        console.error('Student not found. Available students:', allStudents.map(s => ({ id: s.id, type: typeof s.id, name: s.name })));
        showAlert('Student not found!', 'error');
        return;
    }
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete ${student.name}? This will also delete all their grades.`)) {
        deleteStudent(id); // Call function from data.js with numeric ID
        displayStudents();
        showAlert('Student deleted successfully!', 'success');
        
        // Reset form if we were editing this student
        if (editingStudentId === id) {
            resetForm();
        }
    }
}

/**
 * Populate user dropdown with student users
 */
function populateUserDropdown() {
    const users = getUsers();
    const studentUsers = users.filter(u => u.role === 'student');
    const dropdown = document.getElementById('studentUserId');
    
    if (!dropdown) return;
    
    dropdown.innerHTML = '<option value="">Select User Account (Optional)</option>';
    
    studentUsers.forEach(user => {
        // Check if user is already linked to a student
        const students = getStudents();
        const isLinked = students.some(s => s.userId === user.id);
        
        if (!isLinked || (editingStudentId && getStudentById(editingStudentId)?.userId === user.id)) {
            dropdown.innerHTML += `<option value="${user.id}">${user.name} (${user.email})</option>`;
        }
    });
}

/**
 * Display all students in a table
 */
function displayStudents() {
    const students = getStudents();
    const users = getUsers();
    const container = document.getElementById('studentsTableContainer');
    
    if (students.length === 0) {
        container.innerHTML = '<p class="empty-state">No students added yet. Use the form above to add students.</p>';
        return;
    }
    
    // Create table
    let tableHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>CIN</th>
                        <th>Group</th>
                        <th>Linked User</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add rows for each student
    students.forEach(student => {
        const linkedUser = student.userId ? users.find(u => u.id === student.userId) : null;
        const userInfo = linkedUser ? `${linkedUser.name} (${linkedUser.email})` : 'Not linked';
        
        tableHTML += `
            <tr>
                <td>${student.name}</td>
                <td>${student.cin}</td>
                <td>${student.group}</td>
                <td><small style="color: var(--text-secondary);">${userInfo}</small></td>
                <td>
                    <button class="btn btn-warning btn-small" onclick="editStudent(${Number(student.id)})">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteStudentHandler(${Number(student.id)})">
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
    const name = document.getElementById('studentName').value.trim();
    const cin = document.getElementById('studentCIN').value.trim();
    const group = document.getElementById('studentGroup').value.trim();
    
    // Validate inputs
    if (!name || !cin || !group) {
        showAlert('Please fill in all fields!', 'error');
        return;
    }
    
    // Validate CIN format (should be alphanumeric, max 10 characters)
    if (cin.length < 5 || cin.length > 10) {
        showAlert('CIN must be between 5 and 10 characters!', 'error');
        return;
    }
    
    // Get userId (optional - can be empty)
    const userId = document.getElementById('studentUserId').value;
    
    const studentData = {
        name: name,
        cin: cin,
        group: group,
        userId: userId ? parseInt(userId) : null
    };
    
    let success = false;
    
    if (editingStudentId) {
        // Update existing student
        success = updateStudent(editingStudentId, studentData);
        if (success) {
            showAlert('Student updated successfully!', 'success');
        } else {
            showAlert('Failed to update student. CIN might already exist.', 'error');
            return;
        }
    } else {
        // Add new student
        success = addStudent(studentData);
        if (success) {
            showAlert('Student added successfully!', 'success');
        } else {
            showAlert('Failed to add student. CIN already exists!', 'error');
            return;
        }
    }
    
    // Reset form and refresh table
    resetForm();
    displayStudents();
}

/**
 * ============================================
 * PAGE INITIALIZATION
 * ============================================
 * 
 * This runs when the page finishes loading (DOMContentLoaded event)
 * It sets up all the event listeners and displays initial data
 */
document.addEventListener('DOMContentLoaded', () => {
    // Step 0: Clear any existing alert messages
    clearAlert();
    
    // Step 1: Populate the user dropdown with available student accounts
    populateUserDropdown();
    
    // Step 2: Display all existing students in the table
    displayStudents();
    
    // Step 3: Add event listener to the form - when user submits, call handleFormSubmit
    document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
    
    // Step 4: Add event listener to cancel button - when clicked, reset the form
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
});

