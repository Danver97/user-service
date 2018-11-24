const assert = require('assert');

function assertStrictEqual(actual, expected) {
    const current = Object.assign({}, actual);
    const expect = Object.assign({}, expected);
    Object.keys(current).forEach(k => {
        if (/_.*/.test(k))
            delete current[k];
    });
    Object.keys(expect).forEach(k => {
        if (/_.*/.test(k))
            delete expect[k];
    });
    assert.strictEqual(JSON.stringify(current), JSON.stringify(expect));
}

function mins(qty) {
    return qty * 60 * 1000;
}

function hours(qty) {
    return mins(qty * 60);
}

function promisify(execute, cb) {
    const promise = new Promise(async (resolve, reject) => {
        let err = null;
        let result;
        try {
            result = execute();
            if (result instanceof Promise)
                result = await result;
        } catch (e) {
            err = e;
        }
        if (cb)
            cb(err, result);
        if (!cb && err)
            reject(err);
        else
            resolve(result);
    });
    if (cb)
        return null;
    return promise;
}

module.exports = {
    assertStrictEqual,
    mins,
    hours,
    promisify,
};
