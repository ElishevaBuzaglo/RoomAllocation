// בס"ד
require('dotenv').config(); //.env טוען את המשתנים מקובץ ה-
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware לקריאת JSON
app.use(express.json());

// הגדרת משתנים מה-env
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;

// חיבור למסד הנתונים
mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB successfully!');
        // רק אחרי שהחיבור הצליח, השרת מתחיל להאזין
        app.listen(PORT, () => {
            console.log(`🚀Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // סגירת האפליקציה במקרה של שגיאת חיבור קריטית
    });

// נתיב בדיקה ראשוני
app.get('/', (req, res) => {
    res.send('Room Allocation API is running...');
});