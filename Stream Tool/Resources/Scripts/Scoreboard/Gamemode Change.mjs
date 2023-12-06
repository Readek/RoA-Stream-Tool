import { players } from "./Player/Players.mjs";

const r = document.querySelector(':root');
const topBars = document.getElementsByClassName("topBarTexts");
const charImg = [
    document.getElementById("p1Character"),
    document.getElementById("p2Character"),
]
const tLogoImg = document.getElementsByClassName("tLogos");
const scoreNums = document.getElementsByClassName("scoreNum");
let numSize = 36;

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

        /* TO IMPLEMENT */
        // add new positions for the character images
		charImg[0].parentElement.parentElement.classList.add("charTop");
		charImg[1].parentElement.parentElement.classList.add("charTop");
        // move the pronouns / [W]/[L] top bars
		topBars[0].parentElement.parentElement.style.width = "285px";
		topBars[1].parentElement.parentElement.style.width = "285px";
		topBars[0].parentElement.parentElement.style.transform = "translateX(95px)";
		topBars[1].parentElement.parentElement.style.transform = "translateX(95px)";
		topBars[0].parentElement.parentElement.style.justifyContent = "center";
		topBars[1].parentElement.parentElement.style.justifyContent = "center";

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

    }

    #toSingles() {

        r.style.setProperty("--scoreboardX", "var(--scoreboardXSingles)");
		r.style.setProperty("--scoreboardY", "var(--scoreboardYSingles)");

		charImg[0].parentElement.parentElement.classList.remove("charTop");
		charImg[1].parentElement.parentElement.classList.remove("charTop");

        players.changeGm(this.getGm());

		topBars[0].parentElement.parentElement.style.width = "380px";
		topBars[1].parentElement.parentElement.style.width = "380px";
		topBars[0].parentElement.parentElement.style.transform = "";
		topBars[1].parentElement.parentElement.style.transform = "";
		topBars[0].parentElement.parentElement.style.justifyContent = "";
		topBars[1].parentElement.parentElement.style.justifyContent = "";

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

    }

}

export const gamemode = new Gamemode;