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

/**
 * Fades out a player's character and trail
 * @param {HTMLElement} charaEL - Element containing both char and trail
 * @param {HTMLElement} trailEL - Trail element
 * @param {Number} dur - Time in seconds for the animation to last
 */
export async function charaFadeOut(charaEL, trailEL, dur) {

	charaEL.style.animation = `charaMoveOut ${dur}s both
		,fadeOut ${dur}s both`
	;
	// this is only so the animation change gets activated on fade in
	trailEL.parentElement.style.animation = `trailMoveOut 0s both`;

	await new Promise(resolve => setTimeout(resolve, dur * 1000));

}