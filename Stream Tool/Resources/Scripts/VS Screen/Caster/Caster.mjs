import { fadeIn } from "../../Utils/Fade In.mjs";
import { fadeOut } from "../../Utils/Fade Out.mjs";
import { isEmpty } from "../../Utils/Is Object Empty.mjs";
import { resizeText } from "../../Utils/Resize Text.mjs";
import { updateText } from "../../Utils/Update Text.mjs";
import { fadeInTimeVs, fadeOutTimeVs } from "../VsGlobals.mjs";

const casterInfoDiv = document.getElementById("casters");

const nameSize = 25;
const tagSize = 15;
const socialSize = 19;

export class Caster {

    #name = "-";
    #tag = "";
    #pronouns = "";
    #socials = {};

    #el;

    #nameEl;
    #tagEl;
    #socialTextEl;
    #socialBox;

	constructor() {

        this.#el = this.#createElement();

        this.#nameEl = this.#el.getElementsByClassName("casterName")[0];
        this.#tagEl = this.#el.getElementsByClassName("casterTag")[0];
        this.#socialTextEl = this.#el.getElementsByClassName("socialText")[0];
        this.#socialBox = this.#el.getElementsByClassName("socialBox")[0];

	}

	getName() {
		return this.#name;
	}
    getTag() {
        return this.#tag;
    }
	getSocials() {
		return this.#socials;
	}
	
    /**
     * Changes the commentator name, resizing text if necessary
     * @param {String} text - Text to display
     */
	setName(text) {
        this.#name = text;
		updateText(this.#nameEl, text || "-", nameSize);
		resizeText(this.#nameEl.parentElement);
	}

    /**
     * Changes the commentator tag, resizing text if necessary
     * @param {String} text - Text to display
     */
	setTag(text) {
        this.#tag = text;
		updateText(this.#tagEl, text, tagSize);
		resizeText(this.#tagEl.parentElement);
	}
    
    /**
     * Updates socials object data
     * @param {Object} data 
     */
	setSocials(data) {

        this.#socials = data.socials;
        this.#pronouns = data.pronouns;

	}

    /**
     * Updates current social text, resizing if necessary
     * @param {String} key - Name of social to be used
     */
    updateSocialText(key) {

        let actualText = this.#socials[key];
        if (key == "pronouns") {
            actualText = this.#pronouns;
        }

        updateText(this.#socialTextEl, actualText || "-", socialSize);
		resizeText(this.#socialTextEl.parentElement);

    }

    /**
     * Updates the displayed social icon
     * @param {String} social - Name of social to be used
     */
    updateSocialIcon(social) {

        // remove current icon
        this.#socialBox.firstElementChild.remove();

        // theres no dedicated pronouns icon
        if (social == "pronouns") {
            social = "person";
        }
        
        // objects dont typically start capitalized, but our icons do
        const capitalizedSocial = social.charAt(0).toUpperCase() + social.slice(1);
        
        // create the new icon element
        const newEl = document.createElement("load-svg");
        newEl.classList.add("socialIcon", `${social}Icon`);
        newEl.setAttribute("src", `Resources/SVGs/${capitalizedSocial}.svg`);

        // and add it to the final thing
        this.#socialBox.insertBefore(newEl, this.#socialBox.firstElementChild);
    
    }

    /**
     * Checks if the current socials dont match with the provided data
     * @param {Object} data - Object with all socials
     * @returns {Boolean} - True if mismatch
     */
    haveSocialsChanged(data) {

        for (const social in data.socials) {
            if (data.socials[social] != this.#socials[social]) {
                return true;
            }
        }

        // since pronouns share text with socials, we check those too
        if (data.pronouns != this.#pronouns) {
            return true;
        }

        // for empty socials
        return isEmpty(data.socials);

    }

    /**
     * Checks if this commentator has the requested social
     * @param {String} social - Social value to check
     * @returns {Boolean}
     */
    hasSocial(social) {
        if (social == "pronouns") {
            return this.#pronouns;
        } else {
            return this.#socials[social];
        }
    }

    /** Fades out commentator name, returning a promise */
    async fadeOutName() {
        await fadeOut(this.#nameEl.parentElement, fadeOutTimeVs);
    }
    /**Fades in commentator name */
    fadeInName() {
        fadeIn(this.#nameEl.parentElement, fadeInTimeVs, .2);
    }

    /** Fades out socials, returning a promise */
    async fadeOutSocials() {
        await fadeOut(this.#socialBox, fadeOutTimeVs);
    }
    /**Fades in commentator socials */
    fadeInSocials() {
        fadeIn(this.#socialBox, fadeInTimeVs, .2);
    }

    /**
     * Checks if commentator has any info at the moment
     * @returns {Boolean} True if it has data
     */
    isNotEmpty() {
        
        let hasSomething;

        if (this.#name) hasSomething = true;
        if (this.#tag) hasSomething = true;
        if (this.#pronouns) hasSomething = true;

        for (const key in this.#socials) {
            if (this.#socials[key]) {
                hasSomething = true;
            }
        }

        return hasSomething;
        
    }

    /**
     * Creates the commentator element and appends it to the caster box
     * @returns {HTMLElement}
     */
    #createElement() {

        const newEl = document.createElement("div");
        newEl.classList.add("casterDiv");
        newEl.innerHTML = `
            <div class="casterNameBox">
                <load-svg src="Resources/SVGs/Mic.svg" class="socialIcon micIcon"></load-svg>
                <div class="casterTag"></div>
                <div class="casterName"></div>
            </div>
            <div class="casterSep"></div>
            <div class="socialBox">
                <div></div>
                <div class="socialText"></div>
            </div>
        `;

        casterInfoDiv.appendChild(newEl);
        return newEl;

    }

    /** Removes commentator HTML element from the DOM */
    delet() {
        this.#el.remove();
    }

}