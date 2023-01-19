import { players, playersReady } from "./Player/Players.mjs";
import { scores } from "./Score/Scores.mjs";
import { teams } from "./Team/Teams.mjs";
import { wl } from "./WinnersLosers.mjs";

document.getElementById('swapButton').addEventListener("click", () => {
    if (playersReady()) {
        swapPlayers();
    }
});

export async function swapPlayers() {
    
    //team name
    const teamStore = teams[0].getName();
    teams[0].setName(teams[1].getName());
    teams[1].setName(teamStore);

    for (let i = 0; i < players.length; i+=2) {

        //names
        const nameStore = players[i].getName();
        players[i].setName(players[i+1].getName());
        players[i+1].setName(nameStore);

        // player info
        [players[i].tag, players[i+1].tag] = [players[i+1].tag, players[i].tag];
        [players[i].pronouns, players[i+1].pronouns] = [players[i+1].pronouns, players[i].pronouns];
        [players[i].twitter, players[i+1].twitter] = [players[i+1].twitter, players[i].twitter];
        [players[i].twitch, players[i+1].twitch] = [players[i+1].twitch, players[i].twitch];
        [players[i].yt, players[i+1].yt] = [players[i+1].yt, players[i].yt]

        //characters and skins
        const tempP1Char = players[i].char;
        const tempP2Char = players[i+1].char;
        const tempP1Skin = players[i].skin;
        const tempP2Skin = players[i+1].skin;

        // update the stuff
        await players[i].charChange(tempP2Char, true);
        await players[i+1].charChange(tempP1Char, true);
        players[i].skinChange(tempP2Skin);
        players[i+1].skinChange(tempP1Skin);

    }    

    //scores
    const scoreStore = scores[0].getScore();
    scores[0].setScore(scores[1].getScore());
    scores[1].setScore(scoreStore);

    // [W]/[L] swap
    const previousP1WL = wl.getLeft();
    const previousP2WL = wl.getRight();

    if (previousP2WL == "W") {
        wl.leftW.click();
    } else if (previousP2WL == "L") {
        wl.leftL.click();
    }
    if (previousP1WL == "W") {
        wl.rightW.click();
    } else if (previousP1WL == "L") {
        wl.rightL.click();
    }

}