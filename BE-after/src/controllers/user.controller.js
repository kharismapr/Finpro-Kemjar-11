const User = require('../models/User');

class UserController {
    static async getUsers(req, res) {
        try {
        const { search = '', page = 1, limit = 10 } = req.query;
        
        // FIX: Validasi dan sanitization sudah di middleware
        const result = await User.findAll(search, page, limit);
        
        res.json({
            users: result.users,
            pagination: result.pagination
        });
        } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            error: 'Failed to get users',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        }
    }

    // FIX: Hanya admin atau user itu sendiri yang bisa akses
    static async getUserById(req, res) {
        try {
        const { id } = req.params;
        
        // Authorization check
        if (req.user.role !== 'admin' && req.user.id !== id) {
            return res.status(403).json({ 
            error: 'Access denied',
            message: 'You can only access your own profile'
            });
        }
        
        const result = await User.findById(id);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const user = result.rows[0];
        
        // FIX: Sembunyikan informasi sensitif berdasarkan role
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            total_score: user.total_score,
            created_at: user.created_at
        };
        
        // Hanya admin yang bisa melihat role user lain
        if (req.user.role === 'admin' || req.user.id === id) {
            userData.role = user.role;
        }
        
        res.json(userData);
        } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
        }
    }

    static async updateUserScore(req, res) {
        try {
        const { userId } = req.params;
        const { score } = req.body;
        
        // FIX: Validasi input
        if (typeof score !== 'number' || score < 0 || score > 1000) {
            return res.status(400).json({ error: 'Score must be a number between 0 and 1000' });
        }
        
        // FIX: Cek user exists
        const userExists = await User.exists(userId);
        if (!userExists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        await User.updateScore(userId, score);
        
        const updatedUser = await User.findById(userId);
        
        res.json({ 
            message: 'Score updated successfully',
            user: {
            id: updatedUser.rows[0].id,
            name: updatedUser.rows[0].name,
            total_score: updatedUser.rows[0].total_score
            }
        });
        } catch (error) {
        console.error('Update score error:', error);
        res.status(500).json({ error: 'Failed to update score' });
        }
    }
}

module.exports = UserController;