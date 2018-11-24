class Property {
    constructor(type, args) {
        this.type = type;
        this.args = args;
        this.implemented = false;
    }
}

function checkImplementation(interf, implementation) {
    Object.entries(implementation).forEach(([key, value]) => {
        if (!interf[key])
            return;
        if (typeof value !== interf[key].type)
            throw new Error(`The dbmanager implementation of ${key} don't satisfy the type of the property: required type  ${interf[key].type}`);
        if (typeof value === 'function' && value.length !== interf[key].args)
            throw new Error(`The dbmanager implementation of ${key} don't satisfy the number of parameters: required ${interf[key].args} parameters.`);
        interf[key].implemented = true;
    });

    Object.getOwnPropertyNames(interf).forEach(prop => {
        const implemented = interf[prop].implemented;
        if (!implemented)
            throw new Error(`The dbmanager implementation don't satisfy the required interface: missing ${prop}`);
    });
}

module.exports = { Property, checkImplementation };
