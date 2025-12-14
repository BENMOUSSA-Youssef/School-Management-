/**
 * ============================================
 * students.js - Student Management Logic
 * ============================================
 * 
 * This file handles:
 * - Adding new students
 * - Editing existing students
 * - Deleting students
 * - Displaying students in a table
 * - Form validation
 */

// Global variable to track if we're editing
let editingStudentId = null;

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
    document.getElementById('studentForm').reset();
    editingStudentId = null;
    document.getElementById('formTitle').textContent = 'Add New Student';
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('studentCIN').disabled = false;
    populateUserDropdown();
}

/**
 * Populate form with student data for editing
 * @param {number} studentId - Student ID to edit
 */
function editStudent(studentId) {
    const student = getStudentById(studentId);
    
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
    editingStudentId = studentId;
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
 * @param {number} studentId - Student ID to delete
 */
function deleteStudentHandler(studentId) {
    const student = getStudentById(studentId);
    
    if (!student) {
        showAlert('Student not found!', 'error');
        return;
    }
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete ${student.name}? This will also delete all their grades.`)) {
        deleteStudent(studentId); // Call function from data.js
        displayStudents();
        showAlert('Student deleted successfully!', 'success');
        
        // Reset form if we were editing this student
        if (editingStudentId === studentId) {
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
                    <button class="btn btn-warning btn-small" onclick="editStudent(${student.id})">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteStudentHandler(${student.id})">
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

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Populate user dropdown
    populateUserDropdown();
    
    // Display existing students
    displayStudents();
    
    // Handle form submission
    document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
    
    // Handle cancel button
    document.getElementById('cancelBtn').addEventListener('click', resetForm);
});

