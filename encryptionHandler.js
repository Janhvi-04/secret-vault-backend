const crypto = require('crypto');
require('dotenv').config();
// It takes your key and pads it or trims it to exactly 32 characters
const ENCRYPTION_KEY = Buffer.alloc(32, process.env.ENCRYPTION_KEY); 
const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    // Use the buffered key here
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex'),
    };
};
const decrypt = (encryptedObj) => {
    const iv = Buffer.from(encryptedObj.iv, 'hex');
    const encryptedText = Buffer.from(encryptedObj.encryptedData, 'hex');
    // Use the buffered key here too
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};
module.exports = { encrypt, decrypt };