import { players } from "./Player/Players.mjs";
import { scores } from "./Scores.mjs";
import { teams } from "./Teams.mjs";

document.getElementById('clearButton').addEventListener("click", clearPlayers);

export function clearPlayers() {
    
    //crear the team names
    teams[0].setName("");
    teams[1].setName("");

    for (let i = 0; i < players.length; i++) {

        //clear player texts
        players[i].setName("");
        
        // clear player info
        players[i].pronouns = "";
        players[i].setTag("");
        players[i].twitter = "";
        players[i].twitch = "";
        players[i].yt = "";

        //reset characters to random
        players[i].charChange("Random");

    }

    //clear player scores
    for (let i = 0; i < scores.length; i++) {
        scores[i].setScore(0);
    }

}