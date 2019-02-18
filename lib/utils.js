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
    randomInt,
    randomCode,
};
