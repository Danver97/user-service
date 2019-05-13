class ExtendableError extends Error {
    constructor(message, code) {
        super(message);
        this.msg = message;
        this.name = this.constructor.name;
        if (code) this.code = code;
        if (typeof Error.captureStackTrace === 'function')
            Error.captureStackTrace(this, this.constructor);
        else
            this.stack = (new Error(message)).stack;
    }
}

module.exports = ExtendableError;
