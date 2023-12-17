import { fadeInMove } from "../../Utils/Fade In.mjs";
import { current } from "../../Utils/Globals.mjs";
import { TeamColor } from "./Team Color.mjs";
import { TeamLogo } from "./Team Logo.mjs";
import { TeamName } from "./Team Name.mjs";
import { TeamScore } from "./Team Score.mjs";
import { TeamTopBar } from "./Team Top Bar.mjs";

export class Team {

    #scoreboardEl;
    #side;

    #tName;
    #tTopBar;
    #tColor;
    #tScore;
    #tLogo;

    /**
     * Controls name, color and score info for a team
     * @param {HTMLElement} scoreboardEl - The entire scoreboard for this team
     * @param {Element} cssRoot - Where the css variables may be
     * @param {String} side - Side of team, L or R
     */
    constructor(scoreboardEl, cssRoot, side) {

        // get some main stuff
        this.#scoreboardEl = scoreboardEl.parentElement;

        // to know animation direction
	    this.#side = side == "L" ? true : false;

        // gather the data needed for our classes
        const nameEl = scoreboardEl.getElementsByClassName("teamName")[0];
        const nameBg = scoreboardEl.getElementsByClassName("nameBg")[0];

        const topBar = scoreboardEl.getElementsByClassName("topBarTexts")[0];

        const colorImg = scoreboardEl.getElementsByClassName("colors")[0];

        const scoreImg = scoreboardEl.getElementsByClassName("scoreImgs")[0];
        const scoreNum = scoreboardEl.getElementsByClassName("scoreNum")[0];
        const scoreVid = scoreboardEl.getElementsByClassName("scoreVid")[0];
        const scoreBordder = scoreboardEl.getElementsByClassName("border")[0];

        const logoImg = scoreboardEl.getElementsByClassName("tLogos")[0];

        // and create those internal classes
        this.#tName = new TeamName(nameEl, nameBg, side);
        this.#tTopBar = new TeamTopBar(topBar);
        this.#tColor = new TeamColor(cssRoot, colorImg, side);
        this.#tScore = new TeamScore(scoreImg, scoreNum, scoreVid, scoreBordder, side);
        this.#tLogo = new TeamLogo(logoImg, side);

    }

    /**
     * Gets this team's name class
     * @returns {TeamName}
     */
    name() {
        return this.#tName;
    }

    /**
     * Gets this team's top bar class
     * @returns {TeamTopBar}
     */
    topBar() {
        return this.#tTopBar;
    }

    /**
     * Gets this team's color class
     * @returns {TeamColor}
     */
    color() {
        return this.#tColor;
    }

    /**
     * Gets this team's score class
     * @returns {TeamScore}
     */
    score() {
        return this.#tScore;
    }

    /**
     * Gets this team's logo class
     * @returns {TeamScore}
     */
    logo() {
        return this.#tLogo;
    }

    /**
     * Updates team data (name, W/L, color and score)
     * @param {String} name - Team's name
     * @param {String} name - Team's W/L status
     * @param {Object} color - Team's color
     * @param {Number} score - Team's score
     */
    update(name, wl, color, score) {

        // neat fade animation for the scoreboard when loading
        if (current.startup) {
            fadeInMove(this.#scoreboardEl, null, this.#side, current.delay-.1);
        }

        // actual updates
        this.#tName.update(name);
        this.#tTopBar.update(wl);
        this.#tColor.update(color);
        this.#tScore.update(score);
        this.#tLogo.update();

    }

    /**
     * Adapts the team to the selected gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    changeGm(gamemode) {

        this.#tName.changeGm(gamemode);
        this.#tTopBar.changeGm(gamemode);
        this.#tScore.changeGm(gamemode);
        this.#tLogo.changeGm(gamemode);

    }

    /** Hides some stuff when browser goes out of view */
    hide() {

        this.#scoreboardEl.style.display = "none";

        this.#tName.hide();
        this.#tTopBar.hide();
        this.#tLogo.hide();

    }

    /** Display elements and animations when user comes back to the browser */
    show() {

        fadeInMove(this.#scoreboardEl, null, this.#side, current.delay-.1);
        this.#scoreboardEl.style.display = "block";

        this.#tName.show();
        this.#tTopBar.show(current.delay+.6);
        this.#tLogo.show();

    }

}