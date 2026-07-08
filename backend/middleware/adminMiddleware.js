const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Access Denied' });
    }
    next();
};

module.exports = adminAuth;
