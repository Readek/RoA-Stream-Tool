/**
 * Updates the text of a given element
 * @param {HTMLElement} textEL - Element to update
 * @param {String} textToType - Text to display
 * @param {Number} maxSize - Text's maximun size for resizing shenanigans
 */
export function updateText(textEL, textToType, maxSize = false) {

    // set original text size for possible sesizes later
    if (maxSize) textEL.style.fontSize = maxSize + "px";
	
    // change the actual text
	textEL.textContent = textToType;

}
