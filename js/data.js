/**
 * ============================================
 * data.js - Shared Data Management
 * ============================================
 * 
 * This file handles all localStorage operations for:
 * - Students (with userId linking to users)
 * - Modules
 * - Grades
 * 
 * All data is stored as JSON strings in localStorage
 * IDs are numbers for consistency
 */

// ============================================
// STUDENT DATA MANAGEMENT
// ============================================

/**
 * Get all students from localStorage
 * @returns {Array} Array of student objects with {id, name, cin, group, userId}
 */
function getStudents() {
    const studentsJSON = localStorage.getItem('students');
    return studentsJSON ? JSON.parse(studentsJSON) : [];
}

/**
 * Save students array to localStorage
 * @param {Array} students - Array of student objects
 */
function saveStudents(students) {
    localStorage.setItem('students', JSON.stringify(students));
}

/**
 * Add a new student
 * @param {Object} student - Student object with name, cin, group, userId
 * @returns {boolean} True if added successfully, false if CIN already exists
 */
function addStudent(student) {
    const students = getStudents();
    
    // Check if CIN already exists
    if (students.some(s => s.cin === student.cin)) {
        return false;
    }
    
    // Add unique numeric ID
    const maxId = students.length > 0 ? Math.max(...students.map(s => s.id || 0)) : 0;
    student.id = maxId + 1;
    students.push(student);
    saveStudents(students);
    return true;
}

/**
 * Update an existing student
 * @param {number} id - Student ID
 * @param {Object} updatedStudent - Updated student data
 * @returns {boolean} True if updated successfully
 */
function updateStudent(id, updatedStudent) {
    const students = getStudents();
    const index = students.findIndex(s => s.id === id);
    
    if (index === -1) return false;
    
    // Preserve ID and check CIN uniqueness (if changed)
    updatedStudent.id = id;
    const otherStudents = students.filter(s => s.id !== id);
    if (otherStudents.some(s => s.cin === updatedStudent.cin)) {
        return false; // CIN already exists in another student
    }
    
    students[index] = updatedStudent;
    saveStudents(students);
    return true;
}

/**
 * Delete a student by ID
 * @param {number} id - Student ID
 */
function deleteStudent(id) {
    const students = getStudents();
    const filtered = students.filter(s => s.id !== id);
    saveStudents(filtered);
    
    // Also delete all grades for this student
    deleteStudentGrades(id);
}

/**
 * Get a student by ID
 * @param {number} id - Student ID
 * @returns {Object|null} Student object or null if not found
 */
function getStudentById(id) {
    const students = getStudents();
    return students.find(s => s.id === id) || null;
}

/**
 * Get a student by userId (links student record to user account)
 * @param {number} userId - User ID
 * @returns {Object|null} Student object or null if not found
 */
function getStudentByUserId(userId) {
    const students = getStudents();
    return students.find(s => s.userId === userId) || null;
}

// ============================================
// MODULE DATA MANAGEMENT
// ============================================

/**
 * Get all modules from localStorage
 * @returns {Array} Array of module objects with {id, name, coefficient}
 */
function getModules() {
    const modulesJSON = localStorage.getItem('modules');
    return modulesJSON ? JSON.parse(modulesJSON) : [];
}

/**
 * Save modules array to localStorage
 * @param {Array} modules - Array of module objects
 */
function saveModules(modules) {
    localStorage.setItem('modules', JSON.stringify(modules));
}

/**
 * Add a new module
 * @param {Object} module - Module object with name and coefficient
 * @returns {boolean} True if added successfully, false if name already exists
 */
function addModule(module) {
    const modules = getModules();
    
    // Check if module name already exists
    if (modules.some(m => m.name.toLowerCase() === module.name.toLowerCase())) {
        return false;
    }
    
    // Add unique numeric ID
    const maxId = modules.length > 0 ? Math.max(...modules.map(m => m.id || 0)) : 0;
    module.id = maxId + 1;
    modules.push(module);
    saveModules(modules);
    return true;
}

/**
 * Update an existing module
 * @param {number} id - Module ID
 * @param {Object} updatedModule - Updated module data
 * @returns {boolean} True if updated successfully
 */
function updateModule(id, updatedModule) {
    const modules = getModules();
    const index = modules.findIndex(m => m.id === id);
    
    if (index === -1) return false;
    
    // Preserve ID and check name uniqueness (if changed)
    updatedModule.id = id;
    const otherModules = modules.filter(m => m.id !== id);
    if (otherModules.some(m => m.name.toLowerCase() === updatedModule.name.toLowerCase())) {
        return false; // Name already exists in another module
    }
    
    modules[index] = updatedModule;
    saveModules(modules);
    return true;
}

/**
 * Delete a module by ID
 * @param {number} id - Module ID
 */
function deleteModule(id) {
    const modules = getModules();
    const filtered = modules.filter(m => m.id !== id);
    saveModules(filtered);
    
    // Also delete all grades for this module
    deleteModuleGrades(id);
}

/**
 * Get a module by ID
 * @param {number} id - Module ID
 * @returns {Object|null} Module object or null if not found
 */
function getModuleById(id) {
    const modules = getModules();
    return modules.find(m => m.id === id) || null;
}

// ============================================
// GRADES DATA MANAGEMENT
// ============================================

/**
 * Get all grades from localStorage
 * Grades are stored as array: [{studentId, moduleId, grade}, ...]
 * @returns {Array} Array of grade objects
 */
function getGrades() {
    const gradesJSON = localStorage.getItem('grades');
    return gradesJSON ? JSON.parse(gradesJSON) : [];
}

/**
 * Save grades array to localStorage
 * @param {Array} grades - Array of grade objects
 */
function saveGrades(grades) {
    localStorage.setItem('grades', JSON.stringify(grades));
}

/**
 * Get grade for a specific student and module
 * @param {number} studentId - Student ID
 * @param {number} moduleId - Module ID
 * @returns {number|null} Grade value or null if not found
 */
function getGrade(studentId, moduleId) {
    const grades = getGrades();
    const gradeObj = grades.find(g => g.studentId === studentId && g.moduleId === moduleId);
    return gradeObj ? gradeObj.grade : null;
}

/**
 * Set grade for a specific student and module
 * @param {number} studentId - Student ID
 * @param {number} moduleId - Module ID
 * @param {number} grade - Grade value (0-20) or null to delete
 */
function setGrade(studentId, moduleId, grade) {
    let grades = getGrades();
    
    // Find existing grade
    const index = grades.findIndex(g => g.studentId === studentId && g.moduleId === moduleId);
    
    if (grade === null || grade === '' || isNaN(grade)) {
        // Remove grade if empty or invalid
        if (index !== -1) {
            grades.splice(index, 1);
        }
    } else {
        const gradeValue = parseFloat(grade);
        if (index !== -1) {
            // Update existing grade
            grades[index].grade = gradeValue;
        } else {
            // Add new grade
            grades.push({
                studentId: studentId,
                moduleId: moduleId,
                grade: gradeValue
            });
        }
    }
    
    saveGrades(grades);
}

/**
 * Delete all grades for a specific student
 * @param {number} studentId - Student ID
 */
function deleteStudentGrades(studentId) {
    let grades = getGrades();
    grades = grades.filter(g => g.studentId !== studentId);
    saveGrades(grades);
}

/**
 * Delete all grades for a specific module
 * @param {number} moduleId - Module ID
 */
function deleteModuleGrades(moduleId) {
    let grades = getGrades();
    grades = grades.filter(g => g.moduleId !== moduleId);
    saveGrades(grades);
}

/**
 * Get all grades for a specific student
 * @param {number} studentId - Student ID
 * @returns {Object} Object with moduleId as keys and grade as values
 */
function getStudentGrades(studentId) {
    const grades = getGrades();
    const studentGrades = {};
    
    grades.forEach(gradeObj => {
        if (gradeObj.studentId === studentId) {
            studentGrades[gradeObj.moduleId] = gradeObj.grade;
        }
    });
    
    return studentGrades;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Clear all data from localStorage
 * WARNING: This will delete all students, modules, and grades
 */
function clearAllData() {
    localStorage.removeItem('students');
    localStorage.removeItem('modules');
    localStorage.removeItem('grades');
}
