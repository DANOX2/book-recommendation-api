import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel';
import { generateToken } from '../services/authService';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashedPassword });
    try {
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

// User login
router.post('/login', async (req: express.Request, res: express.Response): Promise<void> => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }

    const token = generateToken(user._id.toString());
    res.json({ token });
});

export default router;