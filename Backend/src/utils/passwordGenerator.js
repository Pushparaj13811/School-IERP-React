/**
 * Generates a random password with specified length and character types
 * @param {number} length - Length of the password (default: 12)
 * @returns {string} - Generated password
 */
export const generateRandomPassword = (length = 12) => {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Ensure at least one character from each category
    const password = [
        uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
        lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
        numberChars[Math.floor(Math.random() * numberChars.length)],
        specialChars[Math.floor(Math.random() * specialChars.length)]
    ];

    // Fill the rest of the password with random characters from all categories
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    for (let i = password.length; i < length; i++) {
        password.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }

    // Shuffle the password array
    for (let i = password.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join('');
}; 