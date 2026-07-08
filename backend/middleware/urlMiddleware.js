const validator = require('validator');

const validateURL = (req, res, next) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).json({ msg: 'Please provide a URL' });
    }

    const isValid = validator.isURL(req.body.url, {
        protocols: ['http', 'https'],
        require_protocol: true
    });

    if (!isValid) {
        return res.status(400).json({ msg: 'Invalid URL — must start with http:// or https://' });
    }

    next();
};

module.exports = validateURL;
