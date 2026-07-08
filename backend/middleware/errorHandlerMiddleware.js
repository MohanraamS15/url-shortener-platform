const errorHandler = (err, req, res, next) => {
    console.log(err);

    const statusCode = err.StatusCode || err.statusCode || 500;
    const msg = err.message || 'Internal Server Error';

    res.status(statusCode).json({ msg });
};

module.exports = errorHandler;
