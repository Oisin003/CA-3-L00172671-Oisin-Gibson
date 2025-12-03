import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: false },
    totalSpent: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;
