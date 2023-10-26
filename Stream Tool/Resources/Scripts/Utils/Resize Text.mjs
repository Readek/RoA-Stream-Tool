/**
 * Keeps making text smaller until it fits the element
 * @param {HTMLElement} textEL - Element to resize
 */
export function resizeText(textEL) {

	const childrens = textEL.children;
	while (textEL.scrollWidth > textEL.offsetWidth) {
		if (childrens.length > 0) { // for wrappers with more than 1 text
			Array.from(childrens).forEach((child) => {
				child.style.fontSize = getFontSize(child) + "px";
			});
		} else {
			textEL.style.fontSize = getFontSize(textEL) + "px";
		}
	}
    
}

//
/**
 * Returns a smaller fontSize for the provided element
 * @param {HTMLElement} textElement - Element to resize
 * @returns {Number} New font size
 */
function getFontSize(textElement) {
	return (parseFloat(textElement.style.fontSize.slice(0, -2)) * .90);
}