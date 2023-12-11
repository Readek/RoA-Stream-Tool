import { resizeText } from "../../Utils/Resize Text.mjs";
import { updateText } from "../../Utils/Update Text.mjs";

const scoreSize = 48;

export class TeamScore {

    #scoreTicks;
    #scoreNum;
    #side;

    #score = -1;

    /**
     * Controls the team's score
     * @param {HTMLElement} scoreTicks - Team score ticks
     * @param {HTMLElement} scoreNum - Team score number
     * @param {String} side - Side of the team, L or R
     */
    constructor(scoreTicks, scoreNum, side) {

        this.#scoreTicks = scoreTicks.getElementsByClassName("scoreTick");
        this.#scoreNum = scoreNum;
        this.#side = side;

    }

    getScore() {
        return this.#score;
    }

    update(score) {

        // if old does not match new
        if (this.#score != score) {
            
            // lets remember this new score
            this.#score = score;

            // there has to be a more elegant way to do this right?
            if (score == 0) {
                this.#scoreTicks[0].style.fill = "var(--greyScore)";
                this.#scoreTicks[1].style.fill = "var(--greyScore)";
                this.#scoreTicks[2].style.fill = "var(--greyScore)";
            } else if (score == 1) {
                this.#scoreTicks[0].style.fill = `var(--color${this.#side})`;
                this.#scoreTicks[1].style.fill = "var(--greyScore)";
                this.#scoreTicks[2].style.fill = "var(--greyScore)";
            } else if (score == 2) {
                this.#scoreTicks[0].style.fill = `var(--color${this.#side})`;
                this.#scoreTicks[1].style.fill = `var(--color${this.#side})`;
                this.#scoreTicks[2].style.fill = "var(--greyScore)";
            } else if (score == 3) {
                this.#scoreTicks[0].style.fill = `var(--color${this.#side})`;
                this.#scoreTicks[1].style.fill = `var(--color${this.#side})`;
                this.#scoreTicks[2].style.fill = `var(--color${this.#side})`;
            }

            // update the numerical score in case we are displaying that
            updateText(this.#scoreNum, score, scoreSize);
            resizeText(this.#scoreNum);

        }

    }

}