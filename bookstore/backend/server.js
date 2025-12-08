import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import booksRouter from './routes/books.js';
import purchasesRouter from './routes/purchases.js';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookstore';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.json({ status: 'Bookstore API', version: '1.0' });
});

app.use('/api/books', booksRouter);
app.use('/api/purchases', purchasesRouter);
app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
