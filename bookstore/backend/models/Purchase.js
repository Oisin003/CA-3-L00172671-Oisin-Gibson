import mongoose from 'mongoose';

const PurchaseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 }
}, { timestamps: true });

const Purchase = mongoose.model('Purchase', PurchaseSchema);
export default Purchase;
