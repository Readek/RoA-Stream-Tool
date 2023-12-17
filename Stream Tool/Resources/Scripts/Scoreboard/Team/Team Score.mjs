import { current } from "../../Utils/Globals.mjs";
import { resizeText } from "../../Utils/Resize Text.mjs";
import { updateText } from "../../Utils/Update Text.mjs";
import { bestOf } from "../BestOf.mjs";
import { gamemode } from "../Gamemode Change.mjs";
import { teams } from "./Teams.mjs";

let scoreSize = 36;

export class TeamScore {

    #scoreImg;
    #scoreNum;
    #scoreVid;
    #borderImg;

    #score = -1;
    #teamNum = -1;

    /**
     * Controls the team's score
     * @param {HTMLElement} scoreImg - Team score ticks
     * @param {HTMLElement} scoreNum - Team score number
     * @param {HTMLElement} scoreVid - Team score animation video
     * @param {HTMLElement} border - Team border image
     * @param {String} side - Side of team, L or R
     */
    constructor(scoreImg, scoreNum, scoreVid, border, side) {

        this.#scoreImg = scoreImg;
        this.#scoreNum = scoreNum;
        this.#scoreVid = scoreVid;
        this.#borderImg = border;

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
            this.updateImg(gamemode.getGm(), bestOf.getBo(), score);

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

    /**
     * Updates elements to desired Best Of mode
     * @param {*} bo - Current Best Of type
     * @param {Number} gm - Current gamemode
     */
    updateBo(bo, gm) {

        // update the border image
        this.#borderImg.src = `Resources/Overlay/Scoreboard/Borders/Border ${gm} Bo${bo}.png`;

        // update score image
        this.updateImg(gm, bo, this.#score);

        // show or hide number element
        if (bo == "X") {
            this.#scoreNum.style.display = "flex";
        } else {
            this.#scoreNum.style.display = "none";
        }

        // move border images to compensate for new image width
        if (bo == "X" && gm == 1) {
            this.#borderImg.classList.add("borderX");
        } else {
            this.#borderImg.classList.remove("borderX");
        }

    }

    /**
     * Updates elements depending on the gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    changeGm(gamemode) {

        if (gamemode == 2) { // doubles
            
            this.#scoreNum.classList.add("scoreNumDubs");
            scoreSize = 30;
            
        } else { // singles

            this.#scoreNum.classList.remove("scoreNumDubs");
            scoreSize = 36;

        }

        // update them images
        this.updateImg(gamemode, bestOf.getBo(), this.#score);
        this.updateBo(bestOf.getBo(), gamemode);

    }

}