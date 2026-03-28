const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/**
 * Validates Registration Data
 * @returns {string|null} - Returns error message string if invalid, else null
 */
const validateRegistration = (data) => {
    const { username, password } = data;
    if (!username || !emailRegex.test(username)) {
        return "Please enter a valid email address.";
    }
    if (!password || !passwordRegex.test(password)) {
        return "Password must be 8+ characters with uppercase, lowercase, a number, and a symbol.";
    }
    return null; 
};
const validateLogin = (data) => {
    if (!data.username) return "Email is required.";
    if (!data.password) return "Password is required.";
    return null;
};
const validateResetPassword = (password) => {
    if (!password || !passwordRegex.test(password)) {
        return "New password must meet security requirements (8+ chars, caps, symbols).";
    }
    return null;
};
module.exports = {
    validateRegistration,
    validateLogin,
    validateResetPassword
};