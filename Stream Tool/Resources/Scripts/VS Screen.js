import { fadeIn } from "./Utils/Fade In.mjs";
import { fadeOut } from "./Utils/Fade Out.mjs";
import { current } from "./Utils/Globals.mjs";
import { resizeText } from "./Utils/Resize Text.mjs";
import { updateText } from "./Utils/Update Text.mjs";
import { bestOf } from "./VS Screen/BestOf.mjs";
import { casters } from "./VS Screen/Caster/Casters.mjs";
import { roundInfo } from "./VS Screen/Round Info/Round Info.mjs";
import { fadeInTimeVs, fadeOutTimeVs, introDelayVs } from "./VS Screen/VsGlobals.mjs";

// this is a weird way to have file svg's that can be recolored by css
customElements.define("load-svg", class extends HTMLElement {
    async connectedCallback(
      shadowRoot = this.shadowRoot || this.attachShadow({mode:"open"})
    ) {
      shadowRoot.innerHTML = await (await fetch(this.getAttribute("src"))).text()
    }
})


//max text sizes (used when resizing back)
const playerSize = 90;
const tagSize = 50;
const playerSizeDubs = 45;
const tagSizeDubs = 25;
const teamSize = 72;

//to avoid the code constantly running the same method over and over
const pCharPrev = [], pBgPrev = [], scorePrev = [], colorPrev = [];
let gamemodePrev;

//to consider how many loops will we do
let maxPlayers = 2; //will change when doubles comes
const maxSides = 2;

// this will connect us to the GUI
let webSocket;


//next, global variables for the html elements
const pWrapper = document.getElementsByClassName("wrappers");
const pTag = document.getElementsByClassName("tag");
const pName = document.getElementsByClassName("name");
const teamNames = document.getElementsByClassName("teamName");
const pInfoProns = document.getElementsByClassName("playerInfoProns");
const pInfoTwitter = document.getElementsByClassName("playerInfoTwitter");
const pInfoTwitch = document.getElementsByClassName("playerInfoTwitch");
const pInfoYt = document.getElementsByClassName("playerInfoYt");
const pChara = document.getElementsByClassName("chara");
const pChar = document.getElementsByClassName("char");
const pTrail = document.getElementsByClassName("trail");
const pBG = document.getElementsByClassName("bgVid");
const scoreImg = document.getElementsByClassName("scoreTick");
const scoreNums = document.getElementsByClassName("scoreNum");
const colorBG = document.getElementsByClassName("colorBG");
const textBG = document.getElementsByClassName("textBG");
const scoreOverlay = document.getElementById("scores");


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

	const gamemode = data.gamemode;

	// first of all, things that will always happen on each cycle

	// set the max players depending on singles or doubles
	maxPlayers = gamemode == 1 ? 2 : 4;

	// depending on best of, show or hide some score ticks
	bestOf.update(data.bestOf)

	// now, things that will happen only the first time the html loads
	if (current.startup) {

		//if this isnt a singles match, rearrange stuff
		if (gamemode != 1) {
			changeGM(gamemode);
		}
		//save this variable so we know the next time it gets changed
		gamemodePrev = gamemode;
		

		// this will be used later to sync the animations for all character images
		const charsLoaded = [];
		// now the real part begins
		for (let i = 0; i < maxPlayers; i++) {

			//lets start simple with the player names & tags 
			updatePlayerName(i, player[i].name, player[i].tag, gamemode);

			//fade in the player text
			fadeIn(pWrapper[i], introDelayVs+.3);


			// now lets update all that player info
			updatePlayerInfo(i, player[i]);

			// and gradually fade them in
			fadeIn(pInfoProns[i].parentElement, fadeInTimeVs, introDelayVs+.6);
			fadeIn(pInfoTwitter[i].parentElement, fadeInTimeVs, introDelayVs+.75);
			fadeIn(pInfoTwitch[i].parentElement, fadeInTimeVs, introDelayVs+.9);
			fadeIn(pInfoYt[i].parentElement, fadeInTimeVs, introDelayVs+1.05);


			//change the player's character image, and position it
			charsLoaded.push(updateChar(player[i].vs, i));
			//character will fade in when the image finishes loading

			//save character info so we change them later if different
			pCharPrev[i] = player[i].vs.charImg;


			//set the character backgrounds
			updateBG(pBG[i], player[i].vs.bgVid);
			pBgPrev[i] = player[i].vs.bgVid;

		}
		// now we use that array from earlier to animate all characters at the same time
		Promise.all(charsLoaded).then( (value) => { // when all images are loaded
			for (let i = 0; i < value.length; i++) { // for every character loaded
				charaFadeIn(value[i][0], value[i][1], introDelayVs); // fade it in
			}
		})


		// this will run for each side (so twice)
		for (let i = 0; i < maxSides; i++) {

			//update team names (if gamemode is not set to singles)
			if (gamemode != 1) {
				updateText(teamNames[i], teamName[i], teamSize);
				resizeText(teamNames[i]);
				fadeIn(teamNames[i], fadeInTimeVs, introDelayVs+.15);
			}

			//set the colors
			updateColor(colorBG[i], textBG[i], color[i], i, gamemode);
			colorPrev[i] = color[i].name;

			//initialize the score ticks
			updateScore(i, score[i], color[i]);
			scorePrev[i] = score[i];

		}


		//if the scores for both sides are 0, hide the thing
		if (score[0] == 0 && score[1] == 0) {
			scoreOverlay.style.opacity = 0;
		}


		//set the round text
		roundInfo.updateRound(data.round);
		//set the tournament text
		roundInfo.updateTournament(data.tournamentName);


		// initialize the caster class
		casters.initCasters(data.socialNames);
		// and update them
		casters.updateCasters(data.caster);


		// next time we run this function, it will skip all we just did
		current.startup = false;

	}

	// now things that will happen every other cycle
	else {

		//of course, check if the gamemode has changed
		if (gamemodePrev != gamemode) {
			changeGM(gamemode);	
			//calling updateColor here so the text background gets added
			for (let i = 0; i < maxSides; i++) {
				updateColor(colorBG[i], textBG[i], color[i], i, gamemode);
			}
			gamemodePrev = gamemode;
		}


		for (let i = 0; i < maxSides; i++) {

			//color change, this is up here before char/skin change so it doesnt change the
			//trail to the next one if the character has changed, but it will change its color
			if (colorPrev[i] != color[i].name) {
				updateColor(colorBG[i], textBG[i], color[i], i, gamemode);
				colorTrail(pTrail[i], player[i]);
				//if this is doubles, we also need to change the colors for players 3 and 4
				if (gamemode == 2) {
					colorTrail(pTrail[i+2], player[i+2]);
				}
				updateScore(i, score[i], color[i]);
				colorPrev[i] = color[i].name;
			}

			//check if the scores changed
			if (scorePrev[i] != score[i]) {

				//update the thing
				updateScore(i, score[i], color[i]);

				//if the scores for both sides are 0, hide the thing
				if (score[0] == 0 && score[1] == 0) {
					fadeOut(scoreOverlay, fadeOutTimeVs);
				} else if (window.getComputedStyle(scoreOverlay).getPropertyValue("opacity") == 0) {
					fadeIn(scoreOverlay, fadeInTimeVs);
				}

				scorePrev[i] = score[i];

			}

			//did any of the team names change?
			if (gamemode != 1) {
				if (teamNames[i].textContent != teamName[i]) {
					//hide the text before doing anything
					fadeOut(teamNames[i], fadeOutTimeVs).then( () => {
						//update the text while nobody can see it
						updateText(teamNames[i], teamName[i], teamSize);
						resizeText(teamNames[i]);
						//and fade it back to normal
						fadeIn(teamNames[i], fadeInTimeVs);
					});
				}
			}

		}


		// this will be used later to sync the animations for all character images
		const charsLoaded = [], animsEnded = [];
		for (let i = 0; i < maxPlayers; i++) {

			// players name change, if either name or tag have changed
			if (pName[i].textContent != player[i].name || pTag[i].textContent != player[i].tag) {
				//fade out the player's text
				fadeOut(pWrapper[i], fadeOutTimeVs).then( () => {
					//now that nobody is seeing it, change the content of the texts!
					updatePlayerName(i, player[i].name, player[i].tag, gamemode);
					//and fade the texts back in
					fadeIn(pWrapper[i], fadeInTimeVs, .2);
				});
			};

			// all that player info must be updated!
			if (pInfoProns[i].textContent != player[i].pronouns ||
				pInfoTwitter[i].textContent != player[i].socials.twitter ||
				pInfoTwitch[i].textContent != player[i].socials.twitch ||
				pInfoYt[i].textContent != player[i].socials.yt) {

				// fade all of them out, we only need to wait for one
				fadeOut(pInfoProns[i].parentElement, fadeOutTimeVs);
				fadeOut(pInfoTwitter[i].parentElement, fadeOutTimeVs);
				fadeOut(pInfoTwitch[i].parentElement, fadeOutTimeVs);
				fadeOut(pInfoYt[i].parentElement, fadeOutTimeVs).then( () => {
					// update the texts!
					updatePlayerInfo(i, player[i]);
					// but woudnt it be cool if we faded all of them with progression
					fadeIn(pInfoProns[i].parentElement, fadeInTimeVs, .2);
					fadeIn(pInfoTwitter[i].parentElement, fadeInTimeVs, .35);
					fadeIn(pInfoTwitch[i].parentElement, fadeInTimeVs, .5);
					fadeIn(pInfoYt[i].parentElement, fadeInTimeVs, .65);
				});
				
			}

			// player character change
			if (pCharPrev[i] != player[i].vs.charImg) {
				
				//move and fade out the character
				animsEnded.push(charaFadeOut(pChara[i], pTrail[i]).then( () => {
					//update the character image and trail, and also storing its scale for later
					charsLoaded.push(updateChar(player[i].vs, i));
					//will fade back in when the images load
				}));
				
				pCharPrev[i] = player[i].vs.charImg;

			}

			// background change here!
			if (pBgPrev[i] != player[i].vs.bgVid) {
				//fade it out
				fadeOut(pBG[i], fadeOutTimeVs+.2).then( () => {
					//update the bg vid
					updateBG(pBG[i], player[i].vs.bgVid);
					//fade it back
					fadeIn(pBG[i], .3, fadeInTimeVs, fadeInTimeVs+.2);
				});
				pBgPrev[i] = player[i].vs.bgVid;
			}

		}
		// now we use that array from earlier to animate all characters at the same time
		Promise.all(animsEnded).then( () => { // need to sync somehow
			Promise.all(charsLoaded).then( (value) => { // when all images are loaded
				for (let i = 0; i < value.length; i++) { // for every character loaded
					charaFadeIn(value[i][0], value[i][1]); // fade it in
				}
			})
		})
		

		//update round text
		roundInfo.updateRound(data.round);

		//update tournament text
		roundInfo.updateTournament(data.tournamentName);


		//update caster info
		casters.updateCasters(data.caster);

	}
}


// the gamemode manager
function changeGM(gm) {
	if (gm == 2) {

		//change the white overlay
		document.getElementById("vsOverlay").src = "Resources/Overlay/VS Screen/VS Overlay Dubs.png";

		//make all the extra doubles elements visible
		const dubELs = document.getElementsByClassName("dubEL");
		for (let i = 0; i < dubELs.length; i++) {
			dubELs[i].style.display = "flex";
		}

		//change the positions for the text backgrounds (will now be used for the team names)
		for (let i = 0; i < maxSides; i++) {
			textBG[i].style.bottom = "477px";
		}
		textBG[1].style.right = "-10px";

		//move the match info to the center of the screen
		document.getElementById("roundInfo").style.top = "434px";
		document.getElementById("casterInfo").style.top = "417px";
		document.getElementById("scores").style.top = "415px";

		//reposition the top characters (bot ones are already positioned)
		document.getElementById("topRow").style.top = "-180px";
		//change the clip mask
		document.getElementById("clipP1").classList.remove("singlesClip");
		document.getElementById("clipP1").classList.add("dubsClip");
		document.getElementById("clipP2").classList.remove("singlesClip");
		document.getElementById("clipP2").classList.add("dubsClip");
		
		// lastly, change the positions for the player texts
		for (let i = 0; i < 2; i++) {
			pWrapper[i].classList.remove("wrappersSingles");
			pWrapper[i].classList.add("wrappersDoubles");
			pWrapper[i].classList.remove("p"+(i+1)+"WSingles");
			pWrapper[i].classList.add("p"+(i+1)+"WDub");
			//update the text size and resize it if it overflows
			pName[i].style.fontSize = playerSizeDubs + "px";
			pTag[i].style.fontSize = tagSizeDubs + "px";
			resizeText(pWrapper[i]);
		};

		// player info positions
		const pInfo1 = document.getElementById("playerInfoDivL");
		pInfo1.classList.remove("playerInfoDiv", "playerInfoDivL");
		pInfo1.classList.add("playerInfoDiv2", "playerInfoDivL1");
		const pInfos1 = pInfo1.getElementsByClassName("playerInfo");
		for (let i = 0; i < pInfos1.length; i++) {
			pInfos1[i].classList.add("playerInfo1L");
		};

		const pInfo2 = document.getElementById("playerInfoDivR");
		pInfo2.classList.remove("playerInfoDiv", "playerInfoDivR");
		pInfo2.classList.add("playerInfoDiv2", "playerInfoDivR1");
		const pInfos2 = pInfo2.getElementsByClassName("playerInfo");
		for (let i = 0; i < pInfos2.length; i++) {
			pInfos2[i].classList.add("playerInfo1R");
		};

	} else {

		document.getElementById("vsOverlay").src = "Resources/Overlay/VS Screen/VS Overlay.png";

		//hide the extra elements
		const dubELs = document.getElementsByClassName("dubEL");
		for (let i = 0; i < dubELs.length; i++) {
			dubELs[i].style.display = "none";
		}

		//move everything back to where it was
		for (let i = 0; i < maxSides; i++) {
			textBG[i].style.bottom = "0px";
		}
		textBG[1].style.right = "-2px";
		document.getElementById("roundInfo").style.top = "0px";
		document.getElementById("casterInfo").style.top = "0px";
		document.getElementById("scores").style.top = "0px";
		document.getElementById("topRow").style.top = "0px";
		document.getElementById("clipP1").classList.remove("dubsClip");
		document.getElementById("clipP1").classList.add("singlesClip");
		document.getElementById("clipP2").classList.remove("dubsClip");
		document.getElementById("clipP2").classList.add("singlesClip");
		for (let i = 0; i < 2; i++) {
			pWrapper[i].classList.remove("wrappersDoubles");
			pWrapper[i].classList.add("wrappersSingles");
			pWrapper[i].classList.remove("p"+(i+1)+"WDub");
			pWrapper[i].classList.add("p"+(i+1)+"WSingles");
			updatePlayerName(i, "", "", gm); //resize didnt do anything here for some reason
		}

		const pInfo1 = document.getElementById("playerInfoDivL");
		pInfo1.classList.add("playerInfoDiv", "playerInfoDivL");
		pInfo1.classList.remove("playerInfoDiv2", "playerInfoDivL1");
		const pInfos1 = pInfo1.getElementsByClassName("playerInfo");
		for (let i = 0; i < pInfos1.length; i++) {
			pInfos1[i].classList.remove("playerInfo1L");
		};

		const pInfo2 = document.getElementById("playerInfoDivR");
		pInfo2.classList.add("playerInfoDiv", "playerInfoDivR");
		pInfo2.classList.remove("playerInfoDiv2", "playerInfoDivR1");
		const pInfos2 = pInfo2.getElementsByClassName("playerInfo");
		for (let i = 0; i < pInfos2.length; i++) {
			pInfos2[i].classList.remove("playerInfo1R");
		};
		
	}

}


//score change, pretty simple
function updateScore(side, pScore, pColor) {

	// update the numerical score in case we are showing it
	updateText(scoreNums[side], pScore, 48);
	resizeText(scoreNums[side]);

	//if this is the right side, change the number
	if (side == 1) {
		side = 3;
	}

	if (pScore == 0) {
		scoreImg[side].style.fill = "#414141";
		scoreImg[side+1].style.fill = "#414141";
		scoreImg[side+2].style.fill = "#414141";
	} else if (pScore == 1) {
		scoreImg[side].style.fill = pColor.hex;
		scoreImg[side+1].style.fill = "#414141";
		scoreImg[side+2].style.fill = "#414141";
	} else if (pScore == 2) {
		scoreImg[side].style.fill = pColor.hex;
		scoreImg[side+1].style.fill = pColor.hex;
		scoreImg[side+2].style.fill = "#414141";
	} else if (pScore == 3) {
		scoreImg[side].style.fill = pColor.hex;
		scoreImg[side+1].style.fill = pColor.hex;
		scoreImg[side+2].style.fill = pColor.hex;
	}

}


//color change
function updateColor(gradEL, textBGEL, color, i, gamemode) {

	//change the color gradient image path depending on the color
	gradEL.src = `Resources/Overlay/VS Screen/Grads/${color.name}.png`;

	//same but with the text background
	textBGEL.src = `Resources/Overlay/VS Screen/Text BGs/${gamemode}/${color.name}.png`;
	
	// update the root css color variable
	const r = document.querySelector(':root');
	if (i % 2 == 0) {
		r.style.setProperty("--colorL", color.hex);
	} else {
		r.style.setProperty("--colorR", color.hex);
	}

	// if 2v2, add a background to the name wrapper
	if (gamemode == 2) {
		pWrapper[i].style.backgroundColor = `${color.hex}ff`;
		pWrapper[i+2].style.backgroundColor = `${color.hex}ff`;
	} else {
		pWrapper[i].style.backgroundColor = "";
		pWrapper[i+2].style.backgroundColor = "";
	}

	// change the text shadows for the numerical scores
	scoreNums[i].style.webkitTextStroke = "1px " + color.hex;
	scoreNums[i].style.textShadow = "0px 0px 3px " + color.hex;

}


//background change
function updateBG(vidEL, vidSrc) {
	// well this used to be more complicated than this
	vidEL.src = vidSrc;
}


//player text change
function updatePlayerName(pNum, name, tag, gamemode = 1) {
	if (gamemode == 2) {
		pName[pNum].style.fontSize = playerSizeDubs + "px"; //set original text size
		pTag[pNum].style.fontSize = tagSizeDubs + "px";
	} else {
		pName[pNum].style.fontSize = playerSize + "px";
		pTag[pNum].style.fontSize = tagSize + "px";
	}
	pName[pNum].textContent = name; //change the actual text
	pTag[pNum].textContent = tag;

	resizeText(pWrapper[pNum]); //resize if it overflows
}

// player info change
function updatePlayerInfo(pNum, pInfo) {
	
	pInfoProns[pNum].innerText = pInfo.pronouns;
	pInfoTwitter[pNum].innerText = pInfo.socials.twitter;
	pInfoTwitch[pNum].innerText = pInfo.socials.twitch;
	pInfoYt[pNum].innerText = pInfo.socials.yt;

	// there must be a cleaner way to do this right?
	if (pInfo.pronouns) {
		pInfoProns[pNum].parentElement.style.display = "block";
	} else {
		pInfoProns[pNum].parentElement.style.display = "none";
	}
	if (pInfo.socials.twitter) {
		pInfoTwitter[pNum].parentElement.style.display = "block";
	} else {
		pInfoTwitter[pNum].parentElement.style.display = "none";
	}
	if (pInfo.socials.twitch) {
		pInfoTwitch[pNum].parentElement.style.display = "block";
	} else {
		pInfoTwitch[pNum].parentElement.style.display = "none";
	}
	if (pInfo.socials.yt) {
		pInfoYt[pNum].parentElement.style.display = "block";
	} else {
		pInfoYt[pNum].parentElement.style.display = "none";
	}

}


//fade out for the characters
async function charaFadeOut(charaEL, trailEL) {

	charaEL.style.animation = `charaMoveOut ${fadeOutTimeVs}s both
		,fadeOut ${fadeOutTimeVs}s both`
	;
	// this is only so the animation change gets activated on fade in
	trailEL.parentElement.style.animation = `trailMoveOut 0s both`;

	await new Promise(resolve => setTimeout(resolve, fadeOutTimeVs * 1000));

}

//fade in characters edition
function charaFadeIn(charaEL, trailEL, delay = 0) {
	charaEL.style.animation = `charaMoveIn ${fadeInTimeVs + .1}s ${delay + .2}s both
		, fadeIn ${fadeInTimeVs + .1}s ${delay + .2}s both`
	;
	trailEL.parentElement.style.animation = `trailMoveIn ${fadeInTimeVs + .1}s ${delay + .4}s both
		, fadeIn ${fadeInTimeVs + .1}s ${delay + .4}s both`
	;
}


//character update!
async function updateChar(charInfo, pNum) {

	//store so code looks cleaner later
	const charEL = pChar[pNum];
	const trailEL = pTrail[pNum];

	//change the image path depending on the character and skin
	charEL.src = charInfo.charImg;
	trailEL.src = charInfo.trailImg;

	//to position the character
	const charPos = charInfo.charPos;
	charEL.style.transform = `translate(${charPos[0]}px, ${charPos[1]}px) scale(${charPos[2]})`;
	trailEL.style.transform = `translate(${charPos[0]}px, ${charPos[1]}px) scale(${charPos[2]})`;

	//to decide scalling
	if (charInfo.skin.includes("HD")) {
		charEL.style.imageRendering = "auto"; // default scalling
		trailEL.style.imageRendering = "auto";
	} else {
		charEL.style.imageRendering = "pixelated"; // pixel art scalling
		trailEL.style.imageRendering = "pixelated";
	}

	// here we will store promises to use later
	const charsLoaded = [];
	//this will make the thing wait till the images are fully loaded
	charsLoaded.push(charEL.decode(),
		trailEL.decode().catch( () => {} ) // if no trail, do nothing
	);
	// this function will send a promise when the images finish loading
	await Promise.all(charsLoaded);

	return [pChara[pNum], trailEL];

}

//this gets called just to change the color of a trail
function colorTrail(trailEL, char) {
	trailEL.src = char.vs.trailImg;
}
