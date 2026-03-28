const express = require('express');
const router = express.Router();
const Secret = require('../models/Secret');
const { encrypt, decrypt } = require('../encryptionHandler');
const auth = require('../middleware/auth');

router.post('/add', auth, async (req, res) => {
    try {
        const { title, category, secret, identifier, url, noteBody } = req.body;
        const contentToEncrypt = category === "Note" ? noteBody : secret;
        if (!contentToEncrypt) {
            return res.status(400).json({ error: "No sensitive data provided to encrypt" });
        }
        const { iv, encryptedData } = encrypt(contentToEncrypt);
        const newSecret = new Secret({
            user: req.user, // From auth middleware
            title,
            category,        // "Login", "API Key", or "Note"
            identifier,      // Stored as plain text (Email or Key ID)
            url,             // Stored as plain text (Website URL)
            encryptedValue: encryptedData,
            iv: iv
        });
        await newSecret.save();
        return res.status(201).json({ msg: `${category} successfully secured in the vault!` });
    } catch (err) {
        console.error("Add Secret Error:", err.message);
        res.status(500).json({ error: "Server Error: Could not save secret" });
    }
});
router.get('/all', auth, async (req, res) => {
    try {
        const secrets = await Secret.find({ user: req.user });
        const decryptedSecrets = secrets.map((s) => {
            try {
                return {
                    id: s._id,
                    title: s.title,
                    category: s.category,
                    identifier: s.identifier,
                    url: s.url,
                    value: decrypt({ encryptedData: s.encryptedValue, iv: s.iv })
                };
            } catch (decError) {
                return { ...s._doc, value: "Decryption Error" };
            }
        });
        res.json(decryptedSecrets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.put('/update/:id', auth, async (req, res) => {
    try {
        let secret = await Secret.findById(req.params.id);
        if (!secret) return res.status(404).json({ msg: "Secret not found" });
        if (secret.user.toString() !== req.user) {
            return res.status(401).json({ msg: "User not authorized" });
        }
        const { title, category, secret: newSecretVal, identifier, url, noteBody } = req.body;
        let updateData = { title, category, identifier, url };
        const contentToUpdate = category === "Note" ? noteBody : newSecretVal;
        if (contentToUpdate) {
            const { iv, encryptedData } = encrypt(contentToUpdate);
            updateData.encryptedValue = encryptedData;
            updateData.iv = iv;
        }
        secret = await Secret.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { returnDocument: 'after' }
        );
        res.json({ msg: "Secret updated successfully!", secret });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/:id', auth, async (req, res) => {
    try {
        const secret = await Secret.findById(req.params.id);
        if (!secret) {
            return res.status(404).json({ msg: "Secret not found" });
        }
        // Security check: Ensure user owns this secret
        if (secret.user.toString() !== req.user) {
            return res.status(401).json({ msg: "User not authorized" });
        }
        await Secret.findByIdAndDelete(req.params.id);
        res.json({ msg: "Secret deleted from vault" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;