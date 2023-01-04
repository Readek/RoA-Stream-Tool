const fs = require('fs');

/**
 * Returns parsed json data from a local file
 * @param {String} jPath - Path to local file
 * @returns {Object?} - Parsed json object
*/
export function getJson(jPath) {
    if (fs.existsSync(jPath + ".json")) {
        return JSON.parse(fs.readFileSync(jPath + ".json"));
    } else {
        return null;
    }
}
