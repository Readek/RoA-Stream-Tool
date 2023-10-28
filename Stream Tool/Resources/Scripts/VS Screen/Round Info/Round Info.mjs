import { fadeIn } from "../../Utils/Fade In.mjs";
import { fadeOut } from "../../Utils/Fade Out.mjs";
import { current } from "../../Utils/Globals.mjs";
import { Tournament } from "../Tournament.mjs";
import { fadeInTime, fadeOutTime } from "../VsGlobals.mjs";
import { Round } from "./Round.mjs";

const roundInfoEl = document.getElementById("roundInfo");
const tournamentEl = document.getElementById("tournament");
const roundEl = document.getElementById("round");

const tournament = new Tournament;
const round = new Round;

class RoundInfo {

    /**
     * Updates the shown text, fading it out and in if needed,
     * and resizing its containing box
     * @param {String} text - Text to be displayed
     */
    updateTournament(text) {

        this.#actualUpdate(tournament, text);

    }

    /**
     * Updates the shown text, fading it out and in if needed,
     * and resizing its containing box
     * @param {String} text - Text to be displayed
     */
    updateRound(text) {

        this.#actualUpdate(round, text);

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

                fadeOut(roundInfoEl, fadeOutTime);

            } else {

                // show the box in case it was hidden
                fadeIn(roundInfoEl, fadeInTime);
                // fade in the new text!
                classToUpdate.fadeIn();

            }
            
        }

    }

    /** Resizes round info div to force trigger transition animation */
    #resizeDiv() {

        // tournament data gather
        const tourStyle = window.getComputedStyle(tournamentEl);
        // we slice to remove the "px" at the end of the value
        const tourWidth = Number((tourStyle.width).slice(0, -2))
                            + Number((tourStyle.marginLeft).slice(0, -2))
                            + Number((tourStyle.marginRight).slice(0, -2));
        
        // round data gather
        const roundStyle = window.getComputedStyle(roundEl);
        const roundWidth = Number((roundStyle.width).slice(0, -2))
                            + Number((roundStyle.paddingLeft).slice(0, -2))
                            + Number((roundStyle.paddingRight).slice(0, -2));

        // final calc
        if (tourWidth > roundWidth) {
            roundInfoEl.style.width = tourWidth + "px";
        } else {
            roundInfoEl.style.width = roundWidth + "px";
        }

    }


}

export const roundInfo = new RoundInfo;