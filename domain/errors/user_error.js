const ExtendableError = require('./extendable_error');

const errorTypes = {
    paramError: {
        code: 0,
        name: 'paramError',
    },
    statusChangeError: {
        code: 100,
        name: 'statusChangeError',
    },
    passwordConfirmCodeError: {
        code: 101,
        name: 'passwordConfirmCodeError',
    },
};

class UserError extends ExtendableError {
    constructor(message, errorCode) {
        let code = errorCode;
        if (typeof code === 'object')
            code = code.code;
        super(message, code);
    }

    static get errors() {
        return errorTypes;
    }

    static get paramError() {
        return errorTypes.paramError.code;
    }

    static get statusChangeError() {
        return errorTypes.statusChangeError.code;
    }

    static get passwordConfirmCodeError() {
        return errorTypes.passwordConfirmCodeError.code;
    }
}

module.exports = UserError;
