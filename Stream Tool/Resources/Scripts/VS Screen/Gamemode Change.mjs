import { maxSides } from "../Utils/Globals.mjs";
import { casters } from "./Caster/Casters.mjs";
import { players } from "./Player/Players.mjs";
import { roundInfo } from "./Round Info/Round Info.mjs";

const overlay = document.getElementById("vsOverlay");

const dubELs = document.getElementsByClassName("dubEL");

const textBG = document.getElementsByClassName("textBg");

const middleDivs = document.getElementById("middleDivs");


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

        // change the overlay
        overlay.src = "Resources/Overlay/VS Screen/VS Overlay Dubs.png";

		// make all the extra doubles elements visible
		for (let i = 0; i < dubELs.length; i++) {
			dubELs[i].style.display = "flex";
		}

		// change size/angle of text backgrounds (will now be used for team names)
        for (let i = 0; i < maxSides; i++) {
			textBG[i].classList.add("textBgDubs");
		}
		// vertically align them to the center of the screen
		textBG[0].parentElement.classList.add("textBGsDubs");

		// move the match info to the center of the screen
        middleDivs.style.setProperty("--topMargin", "var(--doublesTopMargin)");
        roundInfo.changeGamemode(this.getGm());
        casters.changeGamemode(this.getGm());
		
		// adapt the players for the new gamemode
		players.changeGm(this.getGm());

    }

    #toSingles() {

        // change the overlay
        overlay.src = "Resources/Overlay/VS Screen/VS Overlay.png";

		// hide the extra elements
		const dubELs = document.getElementsByClassName("dubEL");
		for (let i = 0; i < dubELs.length; i++) {
			dubELs[i].style.display = "none";
		}

		// move everything back to where it was
        for (let i = 0; i < maxSides; i++) {
			textBG[i].classList.remove("textBgDubs");
		}
		textBG[0].parentElement.classList.remove("textBGsDubs");

		middleDivs.style.setProperty("--topMargin", " var(--singlesTopMargin)");
        roundInfo.changeGamemode(this.getGm());
        casters.changeGamemode(this.getGm());
		
		players.changeGm(this.getGm());

    }

}

export const gamemode = new Gamemode;