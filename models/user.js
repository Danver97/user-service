const bcrypt = require('bcrypt');
const saltRounds = 10;
const UserError = require('../errors/user_error');

const statusIds = {
    created: 1,
    confirmed: 2,
    removed: 3,
};

class User {
    constructor(email, password, username, name, surname){
        if(!email || !password || !username)
            throw new UserError('Missing one of the following params: email, password, username');
        this.id = (new Date()).getTime();
        this.email = email;
        //this.password = password;
        this.password = bcrypt.hashSync(password, saltRounds);
        this.username = username;
        this.name = name;
        this.surname = surname;
        this.statusid = 0;
    }
    
    static checkPasswords(password, hash) {
        return bcrypt.compare(password, hash);
    }
    
    setProperties(props) {
        const notSettableProps = ['email', 'password']
        Object.keys(props).forEach(p => {
            if(notSettableProps.includes(p))
                return;
            this[p] = props[p] || this[p];
        });
    }
    
    setPassword(password) {
        if(!password)
            throw new UserError('Missing password param');
        this.password = bcrypt.hashSync(password, saltRounds);
    }
    
    created() {
        if(this.statusid >= statusIds['created'])
            throw new UserError('Invalid status change');
        this.status = 'created';
        this.statusid++;
    }
    
    confirmed() {
        if(this.statusid >= statusIds['confirmed'])
            throw new UserError('Invalid status change');
        this.status = 'confirmed';
        this.statusid++;
    }
    
    removed() {
        if(this.statusid >= statusIds['removed'])
            throw new UserError('Invalid status change');
        this.status = 'removed';
        this.statusid++;
    }
}

module.exports = User;