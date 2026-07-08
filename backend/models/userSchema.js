const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide the name'],
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: [true, 'Email is mandatory'],
        unique: [true, 'This email already exists, try logging in'],
        lowercase: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
    return jwt.sign(
        {
            userId: this._id,
            name: this.name,
            role: this.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '10d' }
    );
};

UserSchema.methods.comparePassword = async function (checkPassword) {
    return bcrypt.compare(checkPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
