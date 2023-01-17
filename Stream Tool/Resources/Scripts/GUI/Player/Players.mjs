export const players = [];
export const bracketPlayers = [];

/** Checks if all players are ready to send an update */
export function playersReady() {
    let allReady = true;
    for (let i = 0; i < players.length; i++) {
        if (!players[i].getReadyState()) {
            allReady = false;
        }            
    }
    for (let i = 0; i < bracketPlayers.length; i++) {
        if (!bracketPlayers[i].getReadyState()) {
            allReady = false;
        } 
    }
    return allReady;
}

/** Resets all player data */
export function clearPlayers() {
    
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

}