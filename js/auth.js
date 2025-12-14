/**
 * ============================================
 * auth.js - Authentication System
 * ============================================
 * 
 * This file handles:
 * - User registration
 * - User login
 * - Session management
 * - Role-based access control
 * - Page protection
 */

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * Get all users from localStorage
 * @returns {Array} Array of user objects
 */
function getUsers() {
    const usersJSON = localStorage.getItem('users');
    return usersJSON ? JSON.parse(usersJSON) : [];
}

/**
 * Save users array to localStorage
 * @param {Array} users - Array of user objects
 */
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * Get current logged-in user
 * @returns {Object|null} Current user object or null
 */
function getCurrentUser() {
    const userJSON = localStorage.getItem('currentUser');
    return userJSON ? JSON.parse(userJSON) : null;
}

/**
 * Set current logged-in user
 * @param {Object} user - User object
 */
function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Clear current user (logout)
 */
function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

/**
 * Register a new user
 * @param {string} name - User name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role ('teacher' or 'student')
 * @returns {Object} {success: boolean, message: string}
 */
function registerUser(name, email, password, role = 'student') {
    const users = getUsers();
    
    // Validate inputs
    if (!name || !email || !password) {
        return { success: false, message: 'Please fill in all fields!' };
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { success: false, message: 'Please enter a valid email address!' };
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        return { success: false, message: 'Email already registered!' };
    }
    
    // Validate password length
    if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters!' };
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password, // In real app, this would be hashed
        role: role
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: 'Registration successful!' };
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} {success: boolean, message: string, user: Object|null}
 */
function loginUser(email, password) {
    const users = getUsers();
    
    // Validate inputs
    if (!email || !password) {
        return { success: false, message: 'Please fill in all fields!', user: null };
    }
    
    // Find user by email
    const user = users.find(u => u.email === email);
    
    if (!user) {
        return { success: false, message: 'Invalid email or password!', user: null };
    }
    
    // Check password
    if (user.password !== password) {
        return { success: false, message: 'Invalid email or password!', user: null };
    }
    
    // Set current user
    setCurrentUser(user);
    
    return { success: true, message: 'Login successful!', user: user };
}

/**
 * Logout user
 */
function logoutUser() {
    clearCurrentUser();
    window.location.href = 'login.html';
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
function isAuthenticated() {
    return getCurrentUser() !== null;
}

/**
 * Check if user has specific role
 * @param {string} role - Role to check ('teacher' or 'student')
 * @returns {boolean} True if user has the role
 */
function hasRole(role) {
    const user = getCurrentUser();
    return user && user.role === role;
}

/**
 * Protect page - redirect to login if not authenticated
 * @param {string} requiredRole - Required role (optional, 'teacher' or 'student')
 */
function protectPage(requiredRole = null) {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    if (requiredRole && !hasRole(requiredRole)) {
        alert('Access denied! You do not have permission to access this page.');
        window.location.href = 'index.html';
        return;
    }
}

/**
 * Initialize default teacher account if no users exist
 */
function initializeDefaultTeacher() {
    const users = getUsers();
    
    if (users.length === 0) {
        const defaultTeacher = {
            id: 1,
            name: 'Admin Teacher',
            email: 'teacher@emsi.ma',
            password: 'admin123',
            role: 'teacher'
        };
        users.push(defaultTeacher);
        saveUsers(users);
    }
}

// Initialize default teacher on load
initializeDefaultTeacher();

