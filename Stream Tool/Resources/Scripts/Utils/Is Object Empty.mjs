/**
 * Check if an object is empty
 * @param {Object} obj - Object to review
 * @returns {Boolean}
 */
export function isEmpty(obj) {

    for (const prop in obj) {
        if (Object.hasOwn(obj, prop)) {
            return false;
        }
    }
    
    return true;

}