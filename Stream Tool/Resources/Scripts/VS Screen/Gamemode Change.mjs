import { maxSides } from "../Utils/Globals.mjs";
import { resizeText } from "../Utils/Resize Text.mjs";
import { casters } from "./Caster/Casters.mjs";
import { roundInfo } from "./Round Info/Round Info.mjs";

const overlay = document.getElementById("vsOverlay");

const dubELs = document.getElementsByClassName("dubEL");
const textBG = document.getElementsByClassName("textBG");
const pWrapper = document.getElementsByClassName("wrappers");

const middleDivs = document.getElementById("middleDivs");

const topRow = document.getElementById("topRow");
const clipP1 = document.getElementById("clipP1");
const clipP2 = document.getElementById("clipP2");

const pTag = document.getElementsByClassName("tag");
const pName = document.getElementsByClassName("name");

const pInfo1 = document.getElementById("playerInfoDivL");
const pInfos1 = pInfo1.getElementsByClassName("playerInfo");
const pInfo2 = document.getElementById("playerInfoDivR");
const pInfos2 = pInfo2.getElementsByClassName("playerInfo");


const playerSize = 90;
const tagSize = 50;
const tagSizeDubs = 25;
const playerSizeDubs = 45;


class Gamemode {

    #currentGamemode = 1;

    // todo move most of the logic to their respective classes

    /**
     * Rearranges all DOM elements depending on current gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    change(gamemode) {

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

		// change the positions for the text backgrounds (will now be used for team names)
        for (let i = 0; i < maxSides; i++) {
			textBG[i].style.bottom = "477px";
		}
		textBG[1].style.right = "-10px";

		// move the match info to the center of the screen
        middleDivs.style.setProperty("--topMargin", " var(--doublesTopMargin)");
        roundInfo.changeGamemode(this.getGm());
        casters.changeGamemode(this.getGm());

		// reposition the top characters (bot ones are already positioned)
		topRow.style.top = "-180px";
		// change the clip mask
		clipP1.classList.remove("singlesClip");
		clipP1.classList.add("dubsClip");
		clipP2.classList.remove("singlesClip");
		clipP2.classList.add("dubsClip");
		
		// change the positions for the player texts
		for (let i = 0; i < 2; i++) {
			pWrapper[i].classList.remove("wrappersSingles");
			pWrapper[i].classList.add("wrappersDoubles");
			pWrapper[i].classList.remove("p"+(i+1)+"WSingles");
			pWrapper[i].classList.add("p"+(i+1)+"WDub");
			// update the text size and resize it if it overflows
			pName[i].style.fontSize = playerSizeDubs + "px";
			pTag[i].style.fontSize = tagSizeDubs + "px";
			resizeText(pWrapper[i]);
		};

		// player info positions
		pInfo1.classList.remove("playerInfoDiv", "playerInfoDivL");
		pInfo1.classList.add("playerInfoDiv2", "playerInfoDivL1");
		for (let i = 0; i < pInfos1.length; i++) {
			pInfos1[i].classList.add("playerInfo1L");
		};

		pInfo2.classList.remove("playerInfoDiv", "playerInfoDivR");
		pInfo2.classList.add("playerInfoDiv2", "playerInfoDivR1");
		for (let i = 0; i < pInfos2.length; i++) {
			pInfos2[i].classList.add("playerInfo1R");
		};

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
			textBG[i].style.bottom = "0px";
		}
		textBG[1].style.right = "-2px";

		middleDivs.style.setProperty("--topMargin", " var(--singlesTopMargin)");
        roundInfo.changeGamemode(this.getGm());
        casters.changeGamemode(this.getGm());

		topRow.style.top = "0px";

		clipP1.classList.remove("dubsClip");
		clipP1.classList.add("singlesClip");
		clipP2.classList.remove("dubsClip");
		clipP2.classList.add("singlesClip");
		for (let i = 0; i < 2; i++) {
			pWrapper[i].classList.remove("wrappersDoubles");
			pWrapper[i].classList.add("wrappersSingles");
			pWrapper[i].classList.remove("p"+(i+1)+"WDub");
			pWrapper[i].classList.add("p"+(i+1)+"WSingles");
            pName[i].style.fontSize = playerSize + "px";
			pTag[i].style.fontSize = tagSize + "px";
            resizeText(pWrapper[i]);//resize didnt do anything here for some reason
		}

		pInfo1.classList.add("playerInfoDiv", "playerInfoDivL");
		pInfo1.classList.remove("playerInfoDiv2", "playerInfoDivL1");
		for (let i = 0; i < pInfos1.length; i++) {
			pInfos1[i].classList.remove("playerInfo1L");
		};

		pInfo2.classList.add("playerInfoDiv", "playerInfoDivR");
		pInfo2.classList.remove("playerInfoDiv2", "playerInfoDivR1");
		for (let i = 0; i < pInfos2.length; i++) {
			pInfos2[i].classList.remove("playerInfo1R");
		};

    }

}

export const gamemodeClass = new Gamemode; // todo remove class from name