const User = require('../models/userSchema');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const register = async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
        throw new BadRequestError('Please provide name, email and password');
    }

    const user = await User.create({ email, password, name, role: 'user' });
    const token = user.createJWT();

    return res.status(201).json({
        name: user.name,
        email: user.email,
        role: user.role,
        token
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    const token = user.createJWT();

    return res.status(200).json({
        name: user.name,
        email: user.email,
        role: user.role,
        token
    });
};

module.exports = { register, login };
