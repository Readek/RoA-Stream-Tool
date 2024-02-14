import { fadeIn } from "../../Utils/Fade In.mjs";
import { fadeOut } from "../../Utils/Fade Out.mjs";
import { current } from "../../Utils/Globals.mjs";
import { isEmpty } from "../../Utils/Is Object Empty.mjs";
import { gamemode } from "../Gamemode Change.mjs";
import { fadeInTimeVs, fadeOutTimeVs, introDelayVs } from "../VsGlobals.mjs";

export class PlayerInfo {

    #pronouns = "";
    #socials = {};

    #infoEl;

    #id = 0;
    #side = "";

    /**
     * Controls the player's pronouns and socials
     * @param {HTMLElement} infoEl - Element with all player info
     * @param {Number} id - Player slot
     */
    constructor(infoEl, id) {

        this.#infoEl = infoEl;

        this.#id = id;
        this.#side = (id % 2) ? "L" : "R";

    }

    getPronouns() {
        return this.#pronouns;
    }
    #setPronouns(pronouns) {
        this.#pronouns = pronouns;
    }

    getSocials() {
        return this.#socials;
    }
    #setSocials(socials) {
        this.#socials = socials || {};
    }

    /**
     * Checks if the current socials dont match with the provided data
     * @param {String} pronouns - The player's pronouns
     * @param {Object} socials - The player's socials
     * @returns {Boolean} - True if missmatch
     */
    hasChanged(pronouns, socials) {

        // check them pronouns
        if (pronouns != this.#pronouns) {
            return true;
        }

        // check if socials match
        for (const social in socials) {
            if (socials[social] != this.#socials[social]) {
                return true;
            }
        }

        // for empty socials
        return isEmpty(socials);

    }

    /**
     * Updates the displayed player info (pronouns, socials)
     * @param {String} pronouns - The player's pronouns
     * @param {Object} socials - The player's socials
     */
    async update(pronouns, socials) {

        let delayTime = introDelayVs + .6;

        // if not loading up
        if (!current.startup) {

            // we wont need delay
            delayTime = 0;
            // wait for the fadeout to proceed
            await fadeOut(this.#infoEl, fadeOutTimeVs);

        }

        // delete current elements
        this.#deleteInfo();

        // update that data
        this.#setPronouns(pronouns);
        this.#setSocials(socials);

        // create new elements with the new data
        this.#createElements();

        // display the info element
        this.#infoEl.style.animation = "";

        // fade them in progressively
        for (let i = 0; i < this.#infoEl.children.length; i++) {
            
            // make the animation happen
            fadeIn(this.#infoEl.children[i], fadeInTimeVs, delayTime);
            // add in an extra delay for the next one
            delayTime = delayTime+.15;
            
        }

    }

    #createElements() {

        // pronouns are kind of their own thing
        if (this.getPronouns()) {

            // element to be appended
            const infoDiv = document.createElement("div");

            // add text element inside it
            const pronDiv = document.createElement("span");
            pronDiv.classList.add("playerInfoText");
            pronDiv.innerHTML = this.getPronouns();
            infoDiv.appendChild(pronDiv);

            // add it to the general div
            this.#infoEl.appendChild(infoDiv);

        }

        // socials!
        for (const key in this.#socials) {

            if (this.#socials[key]) {

                const capitalizedSocial = key.charAt(0).toUpperCase() + key.slice(1);

                // element to be appended
                const infoDiv = document.createElement("div");

                // add text element inside it
                const pronDiv = document.createElement("span");
                pronDiv.classList.add("playerInfoText");
                pronDiv.innerHTML = this.getSocials()[key];
                // social icon
                const iconEl = document.createElement("load-svg");
                iconEl.classList.add("playerInfoIcon", `playerInfoIcon${capitalizedSocial}`);
                iconEl.setAttribute("src", `Resources/SVGs/${capitalizedSocial}.svg`)

                // append it all to the parent div
                infoDiv.appendChild(iconEl);
                infoDiv.appendChild(pronDiv);

                // add it to the general div
                this.#infoEl.appendChild(infoDiv);
            }

        }

        // add classes to all elements
        for (let i = 0; i < this.#infoEl.children.length; i++) {
            
            // all elements have these
            this.#infoEl.children[i].classList.add("playerInfo", `bgColor${this.#side}`);

            if (this.#id > 2) { // players 3 and 4

                this.#infoEl.children[i].classList.add(`playerInfo2${this.#side}`);

            } else if (gamemode.getGm() == 2) { // if in doubles

                this.#infoEl.children[i].classList.add(`playerInfo1${this.#side}`);

            }

        }

    }

    /** Deletes everything inside the player info element */
    #deleteInfo() {
        this.#infoEl.innerHTML = "";
    }

    /**
     * Adapts the elements depending on the gamemode
     * @param {Number} gamemode - Gamemode to change to
     */
    changeGm(gamemode) {

        if (gamemode == 2) { // doubles
            
            // remove and add doubles classes
            this.#infoEl.classList.remove("playerInfoDiv", `playerInfoDiv${this.#side}`);
            this.#infoEl.classList.add("playerInfoDiv2", `playerInfoDiv${this.#side}1`);
            // add this class to every current children
            for (let i = 0; i < this.#infoEl.children.length; i++) {
                this.#infoEl.children[i].classList.add(`playerInfo1${this.#side}`);
            }

        } else { // singles
            
            this.#infoEl.classList.add("playerInfoDiv", `playerInfoDiv${this.#side}`);
            this.#infoEl.classList.remove("playerInfoDiv2", `playerInfoDiv${this.#side}1`);
            for (let i = 0; i < this.#infoEl.children.length; i++) {
                this.#infoEl.children[i].classList.remove(`playerInfo1${this.#side}`);
            };

        }

    }

    /** Hides the text elements */
    hide() {
        this.#infoEl.style.display = "none";
    }

    /** Displays the text elements, fading them in */
    show() {

        let delayTime = introDelayVs + .6;

        for (let i = 0; i < this.#infoEl.children.length; i++) {

            // determine the animation to be used
            fadeIn(this.#infoEl.children[i], fadeInTimeVs, delayTime);
            // add in an extra delay for the next one
            delayTime = delayTime+.15;

        }

        this.#infoEl.style.display = "flex";

    }

}