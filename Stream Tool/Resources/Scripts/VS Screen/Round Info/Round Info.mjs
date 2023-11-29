import { fadeIn } from "../../Utils/Fade In.mjs";
import { fadeOut } from "../../Utils/Fade Out.mjs";
import { current } from "../../Utils/Globals.mjs";
import { fadeInTimeVs, fadeOutTimeVs } from "../VsGlobals.mjs";
import { RoundTournament } from "./Round Tournament.mjs";

const roundInfoEl = document.getElementById("roundInfo");

const tournament = new RoundTournament(document.getElementById("tournament"), 28);
const round = new RoundTournament(document.getElementById("round"), 30);

class RoundInfo {

    /**
     * Updates the shown texts, fading them out and in if needed,
     * and resizing their containing box
     * @param {String} tournamentText - Tournament text to be displayed
     * @param {String} roundText - Round text to be displayed
     */
    update(tournamentText, roundText) {

        this.#actualUpdate(tournament, tournamentText);
        this.#actualUpdate(round, roundText);

    }

    /**
     * Where the actual magic happens
     * @param {Object} classToUpdate - Class to be used
     * @param {String} text - Text to update to
     */
    async #actualUpdate(classToUpdate, text) {

        // check if the text is different than the previous one
        if (text != classToUpdate.getText()) {
            
            // if we arent loading the view up
            if (!current.startup) {
                await classToUpdate.fadeOut();
            }
    
            // actual text update
            classToUpdate.setText(text);
    
            // resize the containing box
            this.#resizeDiv();
            
            // if there are no texts, hide the box
            if (!round.getText() && !tournament.getText()) {

                fadeOut(roundInfoEl, fadeOutTimeVs);
                // adjust element height
                roundInfoEl.style.height = "0px";
                roundInfoEl.style.borderWidth = "0px";

            } else {

                // adjust element height
                roundInfoEl.style.height = "90px";
                roundInfoEl.style.borderWidth = "10px 63px";
                // show the box in case it was hidden
                fadeIn(roundInfoEl, fadeInTimeVs);
                // fade in the new text!
                classToUpdate.fadeIn();

            }
            
        }

    }

    /** Resizes round info div to force trigger transition animation */
    #resizeDiv() {

        // tournament data gather
        const tourStyle = window.getComputedStyle(tournament.getElement());
        // we slice to remove the "px" at the end of the value
        const tourWidth = Number((tourStyle.width).slice(0, -2))
                            + Number((tourStyle.marginLeft).slice(0, -2))
                            + Number((tourStyle.marginRight).slice(0, -2));
        
        // round data gather
        const roundStyle = window.getComputedStyle(round.getElement());
        const roundWidth = Number((roundStyle.width).slice(0, -2))
                            + Number((roundStyle.marginLeft).slice(0, -2))
                            + Number((roundStyle.marginRight).slice(0, -2));

        // final calc
        if (tourWidth > roundWidth) {
            roundInfoEl.style.width = tourWidth + "px";
        } else {
            roundInfoEl.style.width = roundWidth + "px";
        }

    }

    /**
     * Changes behaviour to adapt to requested gamemode
     * @param {Number} gamemode - Current gamemode
     */
    changeGamemode(gamemode) {

        if (gamemode == 2) { // doubles
            
            roundInfoEl.classList.remove("roundInfoSingles");
            roundInfoEl.classList.add("roundInfoDoubles");

        } else { // singles
            
            roundInfoEl.classList.add("roundInfoSingles");
            roundInfoEl.classList.remove("roundInfoDoubles");

        }

    }

}

export const roundInfo = new RoundInfo;