const ExtendableError = require('./extendable_error');

class UserError extends ExtendableError {}

module.exports = UserError;
