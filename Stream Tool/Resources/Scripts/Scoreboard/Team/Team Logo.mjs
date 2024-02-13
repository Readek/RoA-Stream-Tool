import { fadeIn } from "../../Utils/Fade In.mjs";
import { fadeOut } from "../../Utils/Fade Out.mjs";
import { current } from "../../Utils/Globals.mjs";
import { gamemode } from "../Gamemode Change.mjs";
import { players } from "../Player/Players.mjs";
import { fadeInTimeSc, fadeOutTimeSc } from "../ScGlobals.mjs";
import { teams } from "./Teams.mjs";

export class TeamLogo {

    #logoImg;
    #imgSrc;

    #side;

    /**
     * Controls the logo for a team
     * @param {HTMLElement} logoImg - Logo image element
     * @param {String} side - L for left, R for right
     */
    constructor(logoImg, side) {

        this.#logoImg = logoImg;
        this.#side = side == "L" ? 0 : 1; // for player/team slot

    }

    async update() {

        let nameLogo = "";

        if (gamemode.getGm() == 1) {

            // if gamemode is singles, we will use the first player's tag
            nameLogo = players.player(this.#side).name().getTag();

            
        } else {

            // if doubles, we will use the team name
            nameLogo = teams.team(this.#side).name().getName();
            
        }

        // if the image to show changed
        if (this.#imgSrc != `Resources/Logos/${nameLogo}.png`) {

            // store for later
            this.#imgSrc = `Resources/Logos/${nameLogo}.png`;

            // delay for fadein animation
            let delay = current.delay;

            // if we aint loading the view, hide the logo
            if (!current.startup) {
                delay = 0;
                await fadeOut(this.#logoImg, fadeOutTimeSc);
            }

            // update the actual image
            this.#logoImg.src = this.#imgSrc;

            // and fade it in
            fadeIn(this.#logoImg, fadeInTimeSc, delay + .35);
            

        }

    }

    /**
     * Updates image position depending on the gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    changeGm(gamemode) {

        if (gamemode == 2) { // doubles
            
            this.#logoImg.style.top = "65px";
            if (this.#side) { // right side
                this.#logoImg.style.right = "352px";
            } else { // left side
                this.#logoImg.style.left = "352px";
            }

        } else { // singles

            this.#logoImg.style.top = "33px";
            if (this.#side) { // right side
                this.#logoImg.style.right = "248px";
            } else { // left side
                this.#logoImg.style.left = "248px";
            }
            
        }
        
    }

    /** Shows the logo image */
    show() {
        fadeIn(this.#logoImg, fadeInTimeSc, current.delay + .35);
    }

}