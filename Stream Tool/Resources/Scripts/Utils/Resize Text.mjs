/**
 * Keeps making text smaller until it fits the element
 * @param {HTMLElement} textEL - Element to resize
 */
export function resizeText(textEL) {

	// there's a chance the element gets resized when its not being rendered
	// because of this, we need to briefly display it so we get its boundaries
	const isHidden = textEL.style.display == "none" ? true : false;
	if (isHidden) {
		textEL.style.display = "block";
	}

	// this is where the magic happens
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

	// hide it back if the element came as hidden
	if (isHidden) {
		textEL.style.display = "none";
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