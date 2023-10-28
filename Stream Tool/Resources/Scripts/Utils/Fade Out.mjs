/**
 * Fades out an element, promise ending after set delay+duration
 * @param {HTMLElement} itemID - Element to be faded out
 * @param {Number} dur - Time in seconds for the animation to last
 * @param {Number} delay - Time in seconds to wait until fade happens
 */
export async function fadeOut(itemID, dur, delay = 0) {

	itemID.style.animation = `fadeOut ${dur}s ${delay}s both`;

	// this function will return a promise when the animation ends
	await new Promise(
        resolve => setTimeout(resolve, (dur + delay) * 1000) // translate to miliseconds
    );

}