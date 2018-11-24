class Property {
    constructor(type, args) {
        this.type = type;
        this.args = args;
        this.implemented = false;
    }
}

/* var interface = {
    save: new Property("function", 2),
    getPreviousPendingResCount: new Property("function", 1),
    getReservationsFromDateToDate: new Property("function", 3)
} */

function checkImplementation(interf, implementation) {
    const inter = Object.assign({}, interf);
    Object.entries(implementation).forEach(([key, value]) => {
        if (!inter[key]) return;
        if (typeof value !== inter[key].type)
            throw new Error(`The dbmanager implementation of ${key} don't satisfy the type of the property: required type ${inter[key].type}`);
        if (typeof value === 'function' && value.length !== inter[key].args)
            throw new Error(`The dbmanager implementation of ${key} don't satisfy the number of parameters: required ${inter[key].args}parameters.`);
        inter[key].implemented = true;
    });

    Object.getOwnPropertyNames(inter).forEach(prop => {
        if (!inter[prop].implemented)
            throw new Error(`The dbmanager implementation don't satisfy the required interface: missing ${prop}`);
    });
}

module.exports = { Property, checkImplementation };
