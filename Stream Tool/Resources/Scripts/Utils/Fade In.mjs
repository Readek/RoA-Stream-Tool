import { fadeInTimeSc, fadeOutTimeSc } from "../Scoreboard/ScGlobals.mjs";

/**
 * Fades in an element
 * @param {HTMLElement} itemID - Element to be faded in
 * @param {Number} dur - Time in seconds for the animation to last
 * @param {Number} delay - Time in seconds to wait until fade happens
 */
export function fadeIn(itemID, dur, delay = 0) {

	itemID.style.animation = `fadeIn ${dur}s ${delay}s both`;

}

/**
 * Moves and fades in an element
 * @param {HTMLElement} itemID - Element to be moved
 * @param {Boolean} chara - If we are moving a character or not
 * @param {Boolean} side - Direction of movement
 * @param {Number} delay - How much to wait before animating, in seconds
 */
export function fadeInMove(itemID, chara, side, delay = 0) {

	if (chara) {

		itemID.parentElement.style.animation = `charaMoveIn ${fadeOutTimeSc}s ${delay}s both
			, fadeIn ${fadeOutTimeSc}s ${delay}s both`
		;

	} else {

		if (side) {
			itemID.style.animation = `moveInLeft ${fadeInTimeSc}s ${delay}s both
				, fadeIn ${fadeInTimeSc}s ${delay}s both`
			;
		} else {
			itemID.style.animation = `moveInRight ${fadeInTimeSc}s ${delay}s both
				, fadeIn ${fadeInTimeSc}s ${delay}s both`
			;
		}

	}

}

/**
 * Fades out a player's character and trail
 * @param {HTMLElement} charaEL - Element containing both char and trail
 * @param {HTMLElement} trailEL - Trail element
 * @param {Number} dur - Time in seconds for the animation to last
 * @param {Number} delay - Time in seconds to wait until fade happens
 */
export function charaFadeIn(charaEL, trailEL, dur, delay = 0) {
	charaEL.style.animation = `charaMoveIn ${dur + .1}s ${delay + .2}s both
		, fadeIn ${dur + .1}s ${delay + .2}s both`
	;
	trailEL.parentElement.style.animation = `trailMoveIn ${dur + .1}s ${delay + .4}s both
		, fadeIn ${dur + .1}s ${delay + .4}s both`
	;
}
