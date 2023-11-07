import { resizeText } from "../../Utils/Resize Text.mjs";
import { updateText } from "../../Utils/Update Text.mjs";

const casterInfoDiv = document.getElementById("casterInfo"); // TODO remove 2

const nameSize = 25;
const socialSize = 20;

export class Caster {

    #name = "";
    #tag = "";
    #pronouns = "";
    #socials = [];

    #nameEl;
    #socialTextEl;
    #socialBox;

	constructor() {

        const el = this.#createElement();

        this.#nameEl = el.getElementsByClassName("casterName")[0];
        this.#socialTextEl = el.getElementsByClassName("socialText")[0];
        this.#socialBox = el.getElementsByClassName("socialBox")[0];

	}

	getName() {
		return this.#name;
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
		updateText(this.#nameEl, text, nameSize);
		resizeText(this.#nameEl.parentElement);
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

    /**
     * Creates the commentator element and appends it to the caster box
     * @returns {HTMLElement}
     */
    #createElement() {

        const newEl = document.createElement("div");
        newEl.innerHTML = `
            <div class="casterDiv">
                <div class="casterNameBox">
                    <load-svg src="Resources/SVGs/Mic.svg" class="socialIcon micIcon"></load-svg>
                    <div class="casterName"></div>
                </div>
                <div class="casterSep"></div>
                <div class="socialBox">
                    <div></div>
                    <div class="socialText"></div>
                </div>
            </div>
        `;

        casterInfoDiv.appendChild(newEl);
        return newEl;

    }

}