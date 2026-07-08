class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.StatusCode = 404;
    }
}

module.exports = NotFoundError;
