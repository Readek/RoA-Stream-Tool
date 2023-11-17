import { roundClass } from "./Scoreboard/Round.mjs";
import { fadeInTimeSc, fadeOutTimeSc } from "./Scoreboard/ScGlobals.mjs";
import { fadeIn } from "./Utils/Fade In.mjs";
import { fadeOut } from "./Utils/Fade Out.mjs";
import { current } from "./Utils/Globals.mjs";
import { resizeText } from "./Utils/Resize Text.mjs";
import { updateText } from "./Utils/Update Text.mjs";

//animation stuff
let introDelay = .5; //all animations will get this delay when the html loads (use this so it times with your transition)

//max text sizes (used when resizing back)
const introSize = 85;
const nameSize = 24;
const tagSize = 17;
const nameSizeDubs = 22;
const tagSizeDubs = 15;
const teamSize = 22;
let numSize = 36;

//to avoid the code constantly running the same method over and over
const pCharPrev = [], scorePrev = [], colorPrev = [], wlPrev = [], topBarMoved = [];
let bestOfPrev, gamemodePrev;

//to consider how many loops will we do
let maxPlayers = 2;
const maxSides = 2;

// this will connect us to the GUI
let webSocket;

let startup = true;


//next, global variables for the html elements
const scoreboard = document.getElementsByClassName("scoreboard");
const teamNames = document.getElementsByClassName("teamName");
const colorImg = document.getElementsByClassName("colors");
const topBars = document.getElementsByClassName("topBarTexts");
const wlText = document.getElementsByClassName("wlText");
const scoreImg = document.getElementsByClassName("scoreImgs");
const scoreNums = document.getElementsByClassName("scoreNum");
const scoreAnim = document.getElementsByClassName("scoreVid");
const tLogoImg = document.getElementsByClassName("tLogos");
const borderImg = document.getElementsByClassName('border');

// we want the correct order, we cant use getClassName here
const pWrapper = [], pTag = [], pName = [], pProns = [], charImg = [];
function pushArrayInOrder(array, string) {
    for (let i = 0; i < 4; i++) {
        array.push(document.getElementById("p"+(i+1)+string));
    }
}
pushArrayInOrder(pWrapper, "Wrapper");
pushArrayInOrder(pTag, "Tag");
pushArrayInOrder(pName, "Name");
pushArrayInOrder(pProns, "Pronouns");
pushArrayInOrder(charImg, "Character");


// first we will start by connecting with the GUI with a websocket
startWebsocket();
function startWebsocket() {

	// change this to the IP of where the GUI is being used for remote control
	webSocket = new WebSocket("ws://localhost:8080?id=gameData");
	webSocket.onopen = () => { // if it connects successfully
		// everything will update everytime we get data from the server (the GUI)
		webSocket.onmessage = function (event) {
			updateData(JSON.parse(event.data));
		}
		// hide error message in case it was up
		document.getElementById('connErrorDiv').style.display = 'none';
	}

	// if the connection closes, wait for it to reopen
	webSocket.onclose = () => {errorWebsocket()}

}
function errorWebsocket() {

	// show error message
	document.getElementById('connErrorDiv').style.display = 'flex';
	// delete current webSocket
	webSocket = null;
	// we will attempt to reconect every 5 seconds
	setTimeout(() => {
		startWebsocket();
	}, 5000);

}

async function updateData(data) {

	const player = data.player;
	const teamName = data.teamName;

	const color = data.color;
	const score = data.score;
	const wl = data.wl;

	const bestOf = data.bestOf;
	const gamemode = data.gamemode;

	const round = data.round;


	// first of all, things that will always happen on each cycle
	
	// set the max players depending on singles or doubles
	maxPlayers = gamemode == 1 ? 2 : 4;

	// change border depending of the Best Of status
	if (bestOfPrev != bestOf) {
		updateBorder(bestOf, gamemode); // update the border
		// update the score ticks so they fit the bestOf border
		updateScore(score[0], bestOf, color[0], 0, gamemode, false);
		updateScore(score[1], bestOf, color[1], 1, gamemode, false);
	}

	// things that will happen for each side
	for (let i = 0; i < maxSides; i++) {

		// change the player background colors
		if (colorPrev[i] != color[i].name) {
			updateColor(colorImg[i], color[i], gamemode, scoreNums[i]);
			colorPrev[i] = color[i].name;
		}

	}


	// now, things that will happen only once, when the html loads
	if (startup) {

		//of course, we have to start with the cool intro stuff
		if (data.allowIntro) {

			//lets see that intro
			document.getElementById('overlayIntro').style.opacity = 1;

			//this vid is just the bars moving (todo: maybe do it through javascript?)
			const introVid = document.getElementById('introVid');
			introVid.src = 'Resources/Overlay/Scoreboard/Intro.webm';
			introVid.play();

			if (score[0] + score[1] == 0) { //if this is the first game, introduce players

				for (let i = 0; i < maxSides; i++) {
					const pIntroEL = document.getElementById('p'+(i+1)+'Intro');

					//update players intro text
					if (gamemode == 1) { //if singles, show player 1 and 2 names
						pIntroEL.textContent = player[i].name;
					} else { //if doubles
						if (teamName[i] == color[i].name + " Team") { //if theres no team name, show player names
							pIntroEL.textContent = player[i].name + " & " + player[i+2].name;
						} else { //else, show the team name
							pIntroEL.textContent = teamName[i];
						}
					}

					pIntroEL.style.fontSize = introSize + "px"; //resize the font to its max size
					resizeText(pIntroEL); //resize the text if its too large

					//change the color of the player text shadows
					pIntroEL.style.textShadow = '0px 0px 20px ' + color[i].hex;
					
				};

				//player name fade in
				fadeInMove(document.getElementById("p1Intro"), introDelay, null, true);
				fadeInMove(document.getElementById("p2Intro"), introDelay, null, false);


			} else { //if its not the first game, show game count
				const midTextEL = document.getElementById('midTextIntro');
				if ((score[0] + score[1]) != 4) { //if its not the last game of a bo5

					//just show the game count in the intro
					midTextEL.textContent = "Game " + (score[0] + score[1] + 1);

				} else { //if game 5

					if ((round.toUpperCase() == "TRUE FINALS")) { //if true finals

						midTextEL.textContent = "True Final Game"; //i mean shit gets serious here
						
					} else {

						midTextEL.textContent = "Final Game";
						
						//if GF, we dont know if its the last game or not, right?
						if (round.toLocaleUpperCase() == "GRAND FINALS" && !(wl[0] == "L" && wl[1] == "L")) {
							fadeIn(document.getElementById("superCoolInterrogation"), 1.5, introDelay+.5);
						}

					}
				}
			}

			document.getElementById('roundIntro').textContent = round;
			document.getElementById('tNameIntro').textContent = data.tournamentName;
			
			//round, tournament and VS/GameX text fade in
			document.querySelectorAll(".textIntro").forEach(el => {
				fadeIn(el, fadeInTimeSc, introDelay-.2);
			});

			//aaaaand fade out everything
			fadeOut(document.getElementById("overlayIntro"), fadeInTimeSc+.2, introDelay+1.8)

			//lets delay everything that comes after this so it shows after the intro
			introDelay = 2.5;
		}


		//if this isnt a singles match, rearrange stuff
		if (gamemode != 1) {
			changeGM(gamemode);
		}
		gamemodePrev = gamemode;


		// this will be used later to sync the animations for all character images
		const charsLoaded = [];

		// now for the actual initialization of players
		for (let i = 0; i < maxPlayers; i++) {
			
			//lets start with the player names and tags
			updatePlayerName(i, player[i].name, player[i].tag, gamemode);
			if (gamemode == 1) { //if this is singles, fade the names in with a sick motion
				const side = (i % 2 == 0) ? true : false; //to know direction
				fadeInMove(pWrapper[i], introDelay, null, side); // fade it in with some movement
			} else { //if doubles, just fade them in
				fadeIn(pWrapper[i], fadeInTimeSc, introDelay+.15)
			}

			// show player pronouns if any
			updatePronouns(i, player[i].pronouns);
			displayTopBarElement(pProns[i]);

			//set the character image for the player
			charsLoaded.push(updateChar(player[i].sc.charImg, player[i].sc.charPos, i));
			//the animation will be fired below, when the image finishes loading

			//save the character so we run the character change code only when this doesnt equal to the next
			pCharPrev[i] = player[i].sc.charImg;

		}

		// now we use that array from earlier to animate all characters at the same time
		Promise.all(charsLoaded).then( (value) => { // when all images are loaded
			for (let i = 0; i < value.length; i++) { // for every character loaded
				fadeInMove(value[i], introDelay+.2, true); // fade it in
			}
		})

		// this will run for each side (so twice)
		for (let i = 0; i < maxSides; i++) {

			// to know animation direction
			const side = (i % 2 == 0) ? true : false;

			//set the team names if not singles
			if (gamemode != 1) {
				updateText(teamNames[i], teamName[i], teamSize);
				resizeText(teamNames[i]);
				fadeInMove(teamNames[i], introDelay, null, side);
			}

			// fade in move the scoreboards
			fadeInMove(scoreboard[i].parentElement, introDelay-.1, null, side);
			
			//if its grands, we need to show the [W] and/or the [L] on the players
			updateWL(wl[i], i);
			displayTopBarElement(wlText[i]);
			
			//save for later so the animation doesn't repeat over and over
			wlPrev[i] = wl[i];

			//set the current score
			updateScore(score[i], bestOf, color[i], i, gamemode, false);
			scorePrev[i] = score[i];

			//check if we have a logo we can place on the overlay
			if (gamemode == 1) { //if this is singles, check the player tag
				updateLogo(tLogoImg[i], player[i].tag);
			} else { //if doubles, check the team name
				updateLogo(tLogoImg[i], teamName[i]);
			}

			// fade in the top bar
			fadeInTopBar(topBars[i], introDelay+.6);
			
		}

		//update the round text	and fade it in
		roundClass.update(data.round);

		startup = false; //next time we run this function, it will skip all we just did
		current.startup = false;

	}

	// now things that will happen on all the other cycles
	else {

		//of course, check if the gamemode has changed
		if (gamemodePrev != gamemode) {
			changeGM(gamemode);
			// we need to update some things
			updateBorder(bestOf, gamemode);
			for (let i = 0; i < maxSides; i++) {
				updateColor(colorImg[i], color[i], gamemode, scoreNums[i]);
				updateScore(score[i], bestOf, color[i], i, gamemode, false);
			}
			gamemodePrev = gamemode;
		}
		
		// this will be used later to sync the animations for all character images
		const charsLoaded = [], animsEnded = [];
		//lets check each player
		for (let i = 0; i < maxPlayers; i++) {
			
			//player names and tags
			if (pName[i].textContent != player[i].name || pTag[i].textContent != player[i].tag) {

				//check the player's side so we know the direction of the movement
				const side = (i % 2 == 0) ? true : false;

				//if this is singles, move the texts while updating
				if (gamemode == 1) {
					//move and fade out the player 1's text
					fadeOutMove(pWrapper[i], null, side).then( () => {
						//now that nobody is seeing it, quick, change the text's content!
						updatePlayerName(i, player[i].name, player[i].tag, gamemode);
						//fade the name back in with a sick movement
						fadeInMove(pWrapper[i], 0, null, side);
					});
				} else { //if not singles, dont move the texts
					fadeOut(pWrapper[i], fadeOutTimeSc).then( () => {
						updatePlayerName(i, player[i].name, player[i].tag, gamemode);
						fadeIn(pWrapper[i], fadeInTimeSc);
					}); 
				}
				
			}

			// show player pronouns if any
			if (player[i].pronouns != pProns[i].textContent) {
				topBarMoved[i % 2] = true;
				fadeOutTopBar(topBars[i % 2]).then( () => {
					updatePronouns(i, player[i].pronouns);
					displayTopBarElement(pProns[i]);
				});
			}

			//player characters and skins
			if (pCharPrev[i] != player[i].sc.charImg) {

				//fade out the image while also moving it because that always looks cool
				animsEnded.push(fadeOutMove(charImg[i], true, null).then( () => {
					//now that nobody can see it, lets change the image!
					charsLoaded.push(updateChar(player[i].sc.charImg, player[i].sc.charPos, i));
					//will fade in when image finishes loading
				}));
				pCharPrev[i] = player[i].sc.charImg;
			}

		}
		// now we use that array from earlier to animate all characters at the same time
		Promise.all(animsEnded).then( () => { // need to sync somehow
			Promise.all(charsLoaded).then( (value) => { // when all images are loaded
				for (let i = 0; i < value.length; i++) { // for every character loaded
					fadeInMove(value[i], .1, true); // fade it in
				}
			})
		})

		//now let's check stuff from each side
		for (let i = 0; i < maxSides; i++) {

			//check if the team names changed
			if (gamemode != 1) {

				const side = (i % 2 == 0) ? true : false;

				if (teamNames[i].textContent != teamName[i]) {
					fadeOutMove(teamNames[i], null, side).then( () => {
						updateText(teamNames[i], teamName[i], teamSize);
						resizeText(teamNames[i]);
						fadeInMove(teamNames[i], 0, null, side);
					});
				}
			}
			
			//the [W] and [L] status for grand finals
			if (wlPrev[i] != wl[i]) {
				//move it away!
				fadeOutTopBar(topBars[i]).then( () => {
					//change the thing!
					updateWL(wl[i], i);
					displayTopBarElement(wlText[i]);
				});
				wlPrev[i] = wl[i];
				topBarMoved[i] = true;
			}

			// if either W/L status or pronouns changed
			if (topBarMoved[i]) {
				setTimeout(() => {
					// move it back up!
					fadeInTopBar(topBars[i]);
					topBarMoved[i] = false;
				}, 500);
			}

			//score check
			if (scorePrev[i] != score[i]) {
				updateScore(score[i], bestOf, color[i], i, gamemode, true);
				scorePrev[i] = score[i];
			}

			//check if we have a logo we can place on the overlay
			if (gamemode == 1) { //if this is singles, check the player tag
				if (pTag[i].textContent != player[i].tag) {
					fadeOut(tLogoImg[i], fadeOutTimeSc).then( () => {
						updateLogo(tLogoImg[i], player[i].tag);
						fadeIn(tLogoImg[i], fadeInTimeSc);
					});
				}
			} else { //if doubles, check the team name
				if (teamNames[i].textContent != teamName[i]) {
					fadeOut(tLogoImg[i], fadeOutTimeSc).then( () => {
						updateLogo(tLogoImg[i], teamName[i]);
						fadeIn(tLogoImg[i], fadeInTimeSc);
					});
				}
			}


		}
		
		//and finally, update the round text
		roundClass.update(data.round);

	}
}


// the gamemode manager
function changeGM(gm) {
			
	if (gm == 2) {

		// move the scoreboard to the new positions
		const r = document.querySelector(':root');
		r.style.setProperty("--scoreboardX", "15px");
		r.style.setProperty("--scoreboardY", "13px");

		// add new positions for the character images
		charImg[0].parentElement.parentElement.classList.add("charTop");
		charImg[1].parentElement.parentElement.classList.add("charTop");

		//change the positions for the player texts
		for (let i = 0; i < 2; i++) {
			pWrapper[i].classList.remove("wrappersSingles");
			pWrapper[i].classList.add("wrappersDubs");
			//update the text size and resize it if it overflows
			pName[i].style.fontSize = nameSizeDubs + "px";
			pTag[i].style.fontSize = tagSizeDubs + "px";
			resizeText(pWrapper[i]);
		}
		pWrapper[0].style.left = "257px";
		pWrapper[1].style.right = "257px";

		// move the pronouns / [W]/[L] top bars
		topBars[0].parentElement.parentElement.style.width = "285px";
		topBars[1].parentElement.parentElement.style.width = "285px";
		topBars[0].parentElement.parentElement.style.transform = "translateX(95px)";
		topBars[1].parentElement.parentElement.style.transform = "translateX(95px)";
		topBars[0].parentElement.parentElement.style.justifyContent = "center";
		topBars[1].parentElement.parentElement.style.justifyContent = "center";

		// move the team logos
		tLogoImg[0].style.left = "352px";
		tLogoImg[0].style.top = "65px";
		tLogoImg[1].style.right = "352px";
		tLogoImg[1].style.top = "65px";

		// move the score numbers
		scoreNums[0].style.left = "225px";
		scoreNums[1].style.left = "225px";
		scoreNums[0].style.top = "23px";
		scoreNums[1].style.top = "23px";
		numSize = 30;

		//show all hidden elements
		const dubELs = document.getElementsByClassName("dubEL");
		for (let i = 0; i < dubELs.length; i++) {
			dubELs[i].style.display = "block";
		}

	} else {

		const r = document.querySelector(':root');
		r.style.setProperty("--scoreboardX", "470px");
		r.style.setProperty("--scoreboardY", "25px");

		charImg[0].parentElement.parentElement.classList.remove("charTop");
		charImg[1].parentElement.parentElement.classList.remove("charTop");

		for (let i = 0; i < 2; i++) {
			pWrapper[i].classList.remove("wrappersDubs");
			pWrapper[i].classList.add("wrappersSingles");
			pName[i].style.fontSize = nameSize + "px";
			pTag[i].style.fontSize = tagSize + "px";
			resizeText(pWrapper[i]);
		}
		pWrapper[0].style.left = "38px";
		pWrapper[1].style.right = "38px";

		topBars[0].parentElement.parentElement.style.width = "380px";
		topBars[1].parentElement.parentElement.style.width = "380px";
		topBars[0].parentElement.parentElement.style.transform = "";
		topBars[1].parentElement.parentElement.style.transform = "";
		topBars[0].parentElement.parentElement.style.justifyContent = "";
		topBars[1].parentElement.parentElement.style.justifyContent = "";

		tLogoImg[0].style.left = "248px";
		tLogoImg[0].style.top = "33px";
		tLogoImg[1].style.right = "248px";
		tLogoImg[1].style.top = "33px";

		scoreNums[0].style.left = "-12px";
		scoreNums[1].style.left = "-12px";
		scoreNums[0].style.top = "27px";
		scoreNums[1].style.top = "27px";
		numSize = 36;

		const dubELs = document.getElementsByClassName("dubEL");
		for (let i = 0; i < dubELs.length; i++) {
			dubELs[i].style.display = "none";
		}
		
	}

	// update the background images
	document.getElementById("bgL").src = `Resources/Overlay/Scoreboard/Name BG ${gm}.png`;
	document.getElementById("bgR").src = `Resources/Overlay/Scoreboard/Name BG ${gm}.png`;

}


// update functions
async function updateScore(pScore, bestOf, pColor, pNum, gamemode, playAnim) {

	if (playAnim) { //do we want to play the score up animation?
		// depending on the color, change the clip
		scoreAnim[pNum].src = `Resources/Overlay/Scoreboard/Score/${gamemode}/${pColor.name}.webm`;
		scoreAnim[pNum].play();
	} 
	// change the score image with the new values
	scoreImg[pNum].src = `Resources/Overlay/Scoreboard/Score/${gamemode}/Bo${bestOf} ${pScore}.png`;
	// update that score number in case we are using those
	updateText(scoreNums[pNum], pScore, numSize);

}

function updateColor(colorEL, pColor, gamemode, scoreNum) {
	colorEL.src = `Resources/Overlay/Scoreboard/Colors/${gamemode}/${pColor.name}.png`;

	// change the text shadows for the numerical scores
	scoreNum.style.webkitTextStroke = "1px " + pColor.hex;
	scoreNum.style.textShadow = "0px 0px 2px " + pColor.hex;
}

function updateBorder(bestOf, gamemode) {
	for (let i = 0; i < borderImg.length; i++) {
		borderImg[i].src = `Resources/Overlay/Scoreboard/Borders/Border ${gamemode} Bo${bestOf}.png`;
		if (bestOf == "X") {
			scoreNums[i].style.display = "flex";
			
		} else {
			scoreNums[i].style.display = "none";
		}
		if (bestOf == "X" && gamemode == 1) {
			borderImg[i].style.transform = "translateX(-26px)";
			topBars[i].parentElement.parentElement.style.transform = "translateX(-26px)";
		} else {
			borderImg[i].style.transform = "translateX(0px)";
			if (gamemode == 1) {
				topBars[i].parentElement.parentElement.style.transform = "translateX(0px)";
			}
		}
	}
	bestOfPrev = bestOf
}

function updateLogo(logoEL, nameLogo) {
	logoEL.src = `Resources/Logos/${nameLogo}.png`;
}

function updatePlayerName(pNum, name, tag, gamemode) {
	if (gamemode == 2) {
		pName[pNum].style.fontSize = nameSizeDubs + "px"; //set original text size
		pTag[pNum].style.fontSize = tagSizeDubs + "px";
	} else {
		pName[pNum].style.fontSize = nameSize + "px";
		pTag[pNum].style.fontSize = tagSize + "px";
	}
	pName[pNum].textContent = name; //change the actual text
	pTag[pNum].textContent = tag;
	resizeText(pWrapper[pNum]); //resize if it overflows
}

function updateWL(pWL, pNum) {
	//check if winning or losing in a GF, then change image
	if (pWL == "W") {
		wlText[pNum].textContent = "WINNERS";
		wlText[pNum].style.color = "#76a276";
	} else if (pWL == "L") {
		wlText[pNum].textContent = "LOSERS";
		wlText[pNum].style.color = "#a27677";
	} else if (wlText[pNum].textContent == "WINNERS" || wlText[pNum].textContent == "LOSERS") {
		// clear contents if there are no pronouns
		wlText[pNum].textContent = "";
	}
}

function updatePronouns(pNum, pronouns) {
	pProns[pNum].textContent = pronouns;
}

function displayTopBarElement(el) {
	if (el.textContent) {
		el.style.display = "block";
	} else {
		el.style.display = "none";
	}
}


//fade out but with movement
async function fadeOutMove(itemID, chara, side) {

	if (chara) {
		// we need to target a different element since chromium
		// does not support idependent transforms on css yet
		itemID.parentElement.style.animation = `charaMoveOut ${fadeOutTimeSc}s both
			,fadeOut ${fadeOutTimeSc}s both`
		;
	} else {
		if (side) {
			itemID.style.animation = `moveOutLeft ${fadeOutTimeSc}s both
				,fadeOut ${fadeOutTimeSc}s both`
			;
		} else {
			itemID.style.animation = `moveOutRight ${fadeOutTimeSc}s both
				,fadeOut ${fadeOutTimeSc}s both`
			;
		}
		
	}
	
	await new Promise(resolve => setTimeout(resolve, fadeOutTimeSc * 1000));

}


//fade in but with movement
function fadeInMove(itemID, delay = 0, chara, side) {
	if (chara) {
		itemID.parentElement.style.animation = `charaMoveIn ${fadeOutTimeSc}s ${delay}s both
			, fadeIn ${fadeOutTimeSc}s ${delay}s both`
		;
	} else {
		if (side) {
			itemID.style.animation = `moveInLeft ${fadeInTimeSc}s ${delay}s both
				, fadeIn ${fadeInTimeSc}s ${delay}s both`
			;
		} else {
			itemID.style.animation = `moveInRight ${fadeInTimeSc}s ${delay}s both
				, fadeIn ${fadeInTimeSc}s ${delay}s both`
			;
		}
	}
}

//movement for the [W]/[L] images
async function fadeOutTopBar(el) {
	el.style.animation = `wlMoveOut .4s both`;
	await new Promise(resolve => setTimeout(resolve, 400));
}
function fadeInTopBar(el, delay = 0) {
	el.style.animation = `wlMoveIn .4s ${delay}s both`;
}


// time to change that image!
async function updateChar(charSrc, charPos, pNum) {

	// change the image path
	charImg[pNum].src = charSrc;

	// position the character
	charImg[pNum].style.transform = `translate(${charPos[0]}px, ${charPos[1]}px) scale(${charPos[2]})`;

	// this will make the thing wait till the image is fully loaded
	await charImg[pNum].decode();

	return charImg[pNum];

}
