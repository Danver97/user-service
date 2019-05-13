const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const UserError = require('../errors/user_error');
const confirmCode = require('../../lib/utils').randomCode;

const saltRounds = 10;

const statusIds = {
    created: 1,
    confirmed: 2,
    removed: 3,
};

class User {
    constructor(email, password, username, name, surname) {
        if (!email || !password || !username) {
            throw new UserError(`Missing the following params:
                ${email ? '' : ' email'}${password ? '' : ' password'}${username ? '' : ' username'}`, UserError.errors.paramError);
        }
        this.id = uuidv4();
        this.email = email;
        // this.password = password;
        this.password = bcrypt.hashSync(password, saltRounds);
        this.passwordStatus = 'confirmed';
        this.username = username;
        this.name = name;
        this.surname = surname;
        this.statusid = 0;
        this.confirmPasswordCode = undefined;
    }

    static fromObject(obj) {
        const user = new User(obj.email, obj.password, obj.username, obj.name, obj.surname);
        user.id = obj.id;
        user.passwordStatus = obj.passwordStatus;
        user.status = obj.status;
        user.statusid = obj.statusid;
        user.confirmPasswordCode = obj.confirmPasswordCode;
        return user;
    }

    static checkPasswords(password, hash) {
        return bcrypt.compareSync(password, hash);
    }

    setProperties(props) {
        const notSettableProps = ['email', 'password'];
        Object.keys(props).forEach(p => {
            if (notSettableProps.includes(p))
                return;
            this[p] = props[p] || this[p];
        });
    }

    setPassword(password) {
        if (!password)
            throw new UserError('Missing password param', UserError.errors.paramError);
        this.password = bcrypt.hashSync(password, saltRounds);
        this.passwordStatus = 'pending';
        const cc = confirmCode(99999, 0, 5);
        this.confirmPasswordCode = bcrypt.hashSync(cc, saltRounds);
        return cc;
    }

    confirmPassword(code) {
        if (!bcrypt.compareSync(code, this.confirmPasswordCode))
            throw new UserError('Wrong confirmation code', UserError.errors.passwordConfirmCodeError);
        this.passwordStatus = 'confirmed';
        this.confirmPasswordCode = undefined;
    }

    created() {
        if (this.statusid >= statusIds.created)
            throw new UserError('Invalid status change', UserError.errors.statusChangeError);
        this.status = 'created';
        this.statusid++;
    }

    confirmed() {
        if (this.statusid >= statusIds.confirmed)
            throw new UserError('Invalid status change', UserError.errors.statusChangeError);
        this.status = 'confirmed';
        this.statusid++;
    }

    removed() {
        if (this.statusid >= statusIds.removed)
            throw new UserError('Invalid status change', UserError.errors.statusChangeError);
        this.status = 'removed';
        this.statusid++;
    }
}

module.exports = User;
