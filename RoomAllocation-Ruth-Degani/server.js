// בס"ד
require('dotenv').config(); //.env טוען את המשתנים מקובץ ה-
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware לקריאת JSON
app.use(express.json());
app.use(cors());

// הגדרת משתנים מה-env
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI;
// const mongoURI = 'mongodb+srv://<username>:<password>@cluster.mongodb.net/SeminarDB';

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
   
// הגדרת הסכמה בהתאם לתמונה שלך
const RoomSchema = new mongoose.Schema({
  wing: String,
  floor: Number,
  size: Number,
  hasProjector: Boolean,
  status: String
});
const Room = mongoose.model('Room', RoomSchema, 'Rooms'); // הפרמטר השלישי מוודא פנייה לאוסף Rooms
// נתיב לקבלת רשימת החדרים
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();    
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// נתיב בדיקה ראשוני
app.get('/', (req, res) => {
    res.send('Room Allocation API is running...');
});
