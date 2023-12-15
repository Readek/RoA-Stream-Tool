import { current } from "../../Utils/Globals.mjs";
import { resizeText } from "../../Utils/Resize Text.mjs";
import { updateText } from "../../Utils/Update Text.mjs";
import { gamemode } from "../Gamemode Change.mjs";
import { teams } from "./Teams.mjs";

const scoreSize = 36;

export class TeamScore {

    #scoreImg;
    #scoreNum;
    #scoreVid;

    #score = -1;
    #teamNum = -1;

    /**
     * Controls the team's score
     * @param {HTMLElement} scoreImg - Team score ticks
     * @param {HTMLElement} scoreNum - Team score number
     * @param {HTMLElement} scoreVid - Team score animation video
     * @param {String} side - Side of team, L or R
     */
    constructor(scoreImg, scoreNum, scoreVid, side) {

        this.#scoreImg = scoreImg;
        this.#scoreNum = scoreNum;
        this.#scoreVid = scoreVid;

        this.#teamNum = side == "L" ? 0 : 1;

    }

    getScore() {
        return this.#score;
    }

    update(score) {

        // if old does not match new
        if (this.#score != score) {
            
            // lets remember this new score
            this.#score = score;

            // if not loading the view, fire a cute animation when the score changes
            if (!current.startup) {
                // depending on the color, change the clip
                const cName = teams.team(this.#teamNum).color().getColorName();
                this.#scoreVid.src = `Resources/Overlay/Scoreboard/Score/${gamemode.getGm()}/${cName}.webm`;
                this.#scoreVid.play();
            }

            // change the score image with the new values
            // todo link best of to class
            this.updateImg(gamemode.getGm(), 5, score);

            // update the numerical score in case we are displaying that
            updateText(this.#scoreNum, score, scoreSize);
            resizeText(this.#scoreNum);

        }

    }

    /**
     * Updates the score image used to hide score ticks
     * @param {Number} gamemode - Current gamemode
     * @param {*} bestOf - Current Best Of type
     * @param {Number} score - Current score
     */
    updateImg(gm, bo, score) {

        // if using numerical Best Of, just dont bother
        if (bo != "X") {
            this.#scoreImg.src = `Resources/Overlay/Scoreboard/Score/${gm}/Bo${bo} ${score}.png`;
        }

    }

}