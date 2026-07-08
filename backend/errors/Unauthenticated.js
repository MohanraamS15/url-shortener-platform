class UnauthenticatedError extends Error {
    constructor(message) {
        super(message);
        this.StatusCode = 401;
    }
}

module.exports = UnauthenticatedError;
