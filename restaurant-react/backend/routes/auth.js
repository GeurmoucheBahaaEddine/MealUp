import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { createLog } from '../middleware/activityLogger.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { nom, email, adresse, password, confirm_password } = req.body;

        // Validation
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Les mots de passe ne correspondent pas!' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé!' });
        }

        // Create user with hashed password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            nom,
            email,
            adresse,
            password_hash: hashedPassword
        });

        // Manual log
        await createLog(user.id, 'REGISTER', 'USER', user.id, 'Nouveau compte créé', req);

        res.status(201).json({ message: 'Compte créé avec succès!' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Erreur lors de la création du compte' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect!' });
        }

        const isValid = await user.checkPassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect!' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Manual log
        await createLog(user.id, 'LOGIN', 'USER', user.id, 'Connexion réussie', req);

        res.json({
            message: `Bienvenue ${user.nom}!`,
            token,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                adresse: user.adresse,
                role: user.role,
                status: user.status
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user.id,
            nom: user.nom,
            email: user.email,
            adresse: user.adresse,
            role: user.role,
            status: user.status
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { nom, adresse } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        user.nom = nom || user.nom;
        user.adresse = adresse || user.adresse;
        await user.save();

        await createLog(user.id, 'UPDATE_PROFILE', 'USER', user.id, 'Profil mis à jour', req);

        res.json({
            message: 'Profil mis à jour avec succès!',
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                adresse: user.adresse,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
    }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const isValid = await user.checkPassword(currentPassword);
        if (!isValid) {
            return res.status(400).json({ message: 'L\'ancien mot de passe est incorrect' });
        }

        await user.setPassword(newPassword);
        await user.save();

        await createLog(user.id, 'CHANGE_PASSWORD', 'USER', user.id, 'Mot de passe modifié', req);

        res.json({ message: 'Mot de passe modifié avec succès!' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Erreur lors du changement de mot de passe' });
    }
});

export default router;
