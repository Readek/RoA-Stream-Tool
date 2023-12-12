import { players } from "./Player/Players.mjs";
import { teams } from "./Team/Teams.mjs";

const r = document.querySelector(':root');
const tLogoImg = document.getElementsByClassName("tLogos");
const scoreNums = document.getElementsByClassName("scoreNum");
let numSize = 36;
const nameBg = document.getElementsByClassName("nameBg");

class Gamemode {

    #currentGamemode = 1;

    /**
     * Rearranges all DOM elements depending on current gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    update(gamemode) {

        if (gamemode != this.#currentGamemode) {

            this.#currentGamemode = gamemode;

            if (gamemode == 2) {
                this.#toDoubles();
            } else {
                this.#toSingles();
            }

        }

    }

    getGm() {
        return this.#currentGamemode;
    }

    #toDoubles() {

        // move the scoreboard to the new positions
		r.style.setProperty("--scoreboardX", "var(--scoreboardXDoubles)");
		r.style.setProperty("--scoreboardY", "var(--scoreboardYDoubles)");

        // update players for the new 2v2 positions
        players.changeGm(this.getGm());

		// update those team positions
		teams.changeGm(this.getGm());

        /* TO IMPLEMENT */
		// move the team logos
		tLogoImg[0].style.left = "352px";
		tLogoImg[0].style.top = "65px";
		tLogoImg[1].style.right = "352px";
		tLogoImg[1].style.top = "65px";

		// move the score numbers
		scoreNums[0].style.left = "225px";
		scoreNums[1].style.left = "225px";
		scoreNums[0].style.top = "23px";
		scoreNums[1].style.top = "23px";
		numSize = 30;

		//show all hidden elements
		const dubELs = document.getElementsByClassName("dubEL");
		for (let i = 0; i < dubELs.length; i++) {
			dubELs[i].style.display = "block";
		}

        // update the background images
        nameBg[0].src = `Resources/Overlay/Scoreboard/Name BG ${this.getGm()}.png`;
        nameBg[1].src = `Resources/Overlay/Scoreboard/Name BG ${this.getGm()}.png`;

    }

    #toSingles() {

        r.style.setProperty("--scoreboardX", "var(--scoreboardXSingles)");
		r.style.setProperty("--scoreboardY", "var(--scoreboardYSingles)");

        players.changeGm(this.getGm());

		teams.changeGm(this.getGm());

		tLogoImg[0].style.left = "248px";
		tLogoImg[0].style.top = "33px";
		tLogoImg[1].style.right = "248px";
		tLogoImg[1].style.top = "33px";

		scoreNums[0].style.left = "-12px";
		scoreNums[1].style.left = "-12px";
		scoreNums[0].style.top = "27px";
		scoreNums[1].style.top = "27px";
		numSize = 36;

		const dubELs = document.getElementsByClassName("dubEL");
		for (let i = 0; i < dubELs.length; i++) {
			dubELs[i].style.display = "none";
		}

        nameBg[0].src = `Resources/Overlay/Scoreboard/Name BG ${this.getGm()}.png`;
        nameBg[1].src = `Resources/Overlay/Scoreboard/Name BG ${this.getGm()}.png`;

    }

}

export const gamemode = new Gamemode;