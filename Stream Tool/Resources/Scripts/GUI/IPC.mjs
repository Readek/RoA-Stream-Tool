const ipc = require('electron').ipcRenderer;

// ipc is the communication bridge between us and nodejs
// we can send signals to do node exclusive stuff,
// and recieve messages from it with data

// node code is the only thing thats embbeded on the executable
// meaning that to see it or modify it, you will need to
// be able to build this project yourself... check the repo's wiki!


// we will store data to send to the browsers here
let gameData;
let bracketData;


// when a new browser connects
ipc.on('requestData', () => {

    // send the current (not updated) data
    sendGameData();
    sendBracketData();

})

/** Sends current game data object to websocket clients */
export function sendGameData() {
    ipc.send('sendData', gameData);
}
export function updateGameData(data) {
    gameData = data;
}
/** Sends current bracket object to websocket clients */
export function sendBracketData() {
    ipc.send('sendData', bracketData);
}
export function updateBracketData(data) {
    bracketData = data;
}

// when we get data remotely, update GUI
/* TODO fix this mess*/
/* ipc.on('remoteGuiData', (event, data) => {

    // parse that json so we get an object we can read
    const newJson = JSON.parse(data);

    // set the gamemode and scoremode
    if (newJson.gamemode == 1) {
        gamemode = 2;
    } else {
        gamemode = 1;
    }
    document.getElementById("gamemode").click();

    if (newJson.bestOf == 5) {
        currentBestOf = "X"
    } else if (newJson.bestOf == 3) {
        currentBestOf = 5
    } else {
        currentBestOf = 3
    }
    document.getElementById("bestOf").click();

    // set the settings
    if (newJson.workshop != wsCheck.checked) {
        if (newJson.workshop) {
            glob.wsCheck.checked = true;
        } else {
            glob.wsCheck.checked = false;
        }
        workshopToggle();
    } else {
        if (newJson.workshop) {
            glob.wsCheck.checked = true;
        } else {
            glob.wsCheck.checked = false;
        }
    }
    if (newJson.altSkin) {
        forceAlt.checked = true;
    } else {
        forceAlt.checked = false;
    }
    if (newJson.allowIntro) {
        document.getElementById("allowIntro").checked = true;
    } else {
        document.getElementById("allowIntro").checked = false;
    }
    if (newJson.forceHD) {
        forceHDCheck.checked = true;
    } else {
        forceHDCheck.checked = false;
    }
    if (newJson.noLoAHD) {
        noLoAHDCheck.checked = true;
    } else {
        noLoAHDCheck.checked = false;
    }
    if (newJson.forceWL != forceWL.checked) {
        if (newJson.forceWL) {
            forceWL.checked = true;
        } else {
            forceWL.checked = false;
        }
        forceWLtoggle();
    } else {
        if (newJson.forceWL) {
            forceWL.checked = true;
        } else {
            forceWL.checked = false;
        }
    }
   
    for (let i = 0; i < newJson.player.length; i++) {

        // player info
        players[i].getName() = newJson.player[i].name;
        players[i].pronouns = newJson.player[i].pronouns;
        players[i].tag = newJson.player[i].tag;
        players[i].twitter = newJson.player[i].twitter;
        players[i].twitch = newJson.player[i].twitch;
        players[i].yt = newJson.player[i].yt;

        // player character and skin
        players[i].charChange(newJson.player[i].char, true);
        players[i].skinChange({name: newJson.player[i].skin});

    };


    for (let i = 0; i < 2; i++) {
        
        // stuff for each side
        scores[i].setScore(newJson.score[i]);
        tNameInps[i].value = newJson.teamName[i];
        updateColor(i, newJson.color[i]);
        
    }

    if (newJson.wl[0] == "W") {p1W.click()};
    if (newJson.wl[0] == "L") {p1L.click()};
    if (newJson.wl[1] == "W") {p2W.click()};
    if (newJson.wl[1] == "L") {p2L.click()};

    roundInp.value = newJson.round;
    tournamentInp.value = newJson.tournamentName;

    for (let i = 0; i < newJson.caster.length; i++) {
        casters[i].setName(newJson.caster[i].name);
        casters[i].setTwitter(newJson.caster[i].twitter == "-" ? "" : newJson.caster[i].twitter);
        casters[i].setTwitch(newJson.caster[i].twitch == "-" ? "" : newJson.caster[i].twitch);
        casters[i].setYt(newJson.caster[i].yt == "-" ? "" : newJson.caster[i].yt);
    }

    // write it down
    writeScoreboard();
    displayNotif("GUI was remotely updated");

}); */
