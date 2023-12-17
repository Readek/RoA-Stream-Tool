import { maxSides } from "../Utils/Globals.mjs";
import { gamemode } from "./Gamemode Change.mjs";
import { teams } from "./Team/Teams.mjs";

class BestOf {

    #bestOf = "";

    getBo() {
        return this.#bestOf;
    }

    /**
     * Updates Best Of info with the provided state
     * @param {*} bestOf - Best Of state
     */
    update(bestOf) {

        // if old doesnt match with new
        if (this.#bestOf != bestOf) {
            
            // show or hide a bunch of elements
            for (let i = 0; i < maxSides; i++) {

                // update elements belonging to score
                teams.team(i).score().updateBo(bestOf, gamemode.getGm());

                // top bar needs to be updated too
                teams.team(i).topBar().updateBo(bestOf, gamemode.getGm());

            }

            // store the new state
            this.#bestOf = bestOf;

        }

    }

}

export const bestOf = new BestOf;