/**
 * Generates a random number within values provided
 * @param {Number} min - Minimum number desired
 * @param {Number} max - Maximun number desired
 * @returns {Number}
 */
export function genRnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}