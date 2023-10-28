/**
 * Fades in an element
 * @param {HTMLElement} itemID - Element to be faded in
 * @param {Number} dur - Time in seconds for the animation to last
 * @param {Number} delay - Time in seconds to wait until fade happens
 */
export function fadeIn(itemID, dur, delay = 0) {
	itemID.style.animation = `fadeIn ${dur}s ${delay}s both`;
}