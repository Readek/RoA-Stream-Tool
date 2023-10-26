import { RoundTournament } from "./Round Tournament.mjs";

class Round extends RoundTournament {

    constructor() {
        super()
        this._element = document.getElementById("round");
        this._fontSize = 30;
    }

}

export const round = new Round;