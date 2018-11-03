const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const UserError = require('../errors/user_error');
const confirmCode = require('../lib/utils').randomCode;

const saltRounds = 10;

const statusIds = {
    created: 1,
    confirmed: 2,
    removed: 3,
};

class User {
    constructor(email, password, username, name, surname) {
        if (!email || !password || !username)
            throw new UserError('Missing one of the following params: email, password, username');
        this.id = uuidv4();
        this.email = email;
        // this.password = password;
        this.password = bcrypt.hashSync(password, saltRounds);
        this.passwordstatus = 'confirmed';
        this.username = username;
        this.name = name;
        this.surname = surname;
        this.statusid = 0;
    }
    
    static fromObject(obj) {
        const user = new User(obj.email, obj.password, obj.username, obj.name, obj.surname);
        user.id = obj.id;
        user.passwordstatus = obj.passwordstatus;
        user.status = obj.status;
        user.statusid = obj.statusid;
        return user;
    }
    
    static checkPasswords(password, hash) {
        return bcrypt.compare(password, hash);
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
            throw new UserError('Missing password param');
        this.password = bcrypt.hashSync(password, saltRounds);
        this.passwordstatus = 'pending';
        this.confirmPasswordCode = bcrypt.hashSync(confirmCode(99999, 0, 5), saltRounds);
        return this.confirmPasswordCode;
    }
    
    confirmPassword(code) {
        if (!bcrypt.compare(code, this.confirmPasswordCode))
            throw new UserError('Wrong confirmation code!');
        this.passwordstatus = 'confirmed';
        this.confirmPasswordCode = undefined;
    }
    
    created() {
        if (this.statusid >= statusIds.created)
            throw new UserError('Invalid status change');
        this.status = 'created';
        this.statusid++;
    }
    
    confirmed() {
        if (this.statusid >= statusIds.confirmed)
            throw new UserError('Invalid status change');
        this.status = 'confirmed';
        this.statusid++;
    }
    
    removed() {
        if (this.statusid >= statusIds.removed)
            throw new UserError('Invalid status change');
        this.status = 'removed';
        this.statusid++;
    }
}

module.exports = User;
