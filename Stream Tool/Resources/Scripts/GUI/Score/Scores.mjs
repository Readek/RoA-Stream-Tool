import { Score } from "./Score.mjs";

/** @type {Score[]} */
export const scores = [];

/**
 * Sets the display mode for score inputs
 * @param {Number} mode - "Best of" mode
 */
export function showScoreMode(mode) {
    for (let i = 0; i < scores.length; i++) {
        scores[i].showMode(mode);        
    }
}

/** Resets all scores to 0 */
export function clearScores() {
    for (let i = 0; i < scores.length; i++) {
        scores[i].setScore(0);
    }
}