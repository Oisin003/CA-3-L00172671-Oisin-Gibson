import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    author: { type: String, required: true },
    category: { type: String },
    price: { type: Number, required: true },
    numberInStock: { type: Number, required: true, default: 0 }
}, { timestamps: true });

const Book = mongoose.model('Book', BookSchema);
export default Book;
