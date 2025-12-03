const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const quizRoutes = require('./routes/quiz.route');
require('dotenv').config();

const app = express();

// VULNERABILITY: CORS terlalu permisif
app.use(cors({
  origin: '*', // Harusnya domain tertentu
  credentials: true
}));

app.use(express.json());

// VULENREALIYLITY: Tidak ada security headers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});