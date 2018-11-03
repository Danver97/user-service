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

function randomInt(max, min) {
    const minim = min || 0;
    return Math.floor(Math.random() * (max - minim + 1)) + minim;
}

function randomCode(max, min, length) {
    const int = randomInt(max, min);
    const intStr = String(int);
    if (intStr.length > length)
        return intStr.slice(-length);
    const result = '0'.repeat(length - intStr.length) + intStr;
    return result;
}

module.exports = {
    promisify,
    randomInt,
    randomCode,
};
