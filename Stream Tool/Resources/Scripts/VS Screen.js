'use strict';

// this is a weird way to have file svg's that can be recolored by css
customElements.define("load-svg", class extends HTMLElement {
    async connectedCallback(
      shadowRoot = this.shadowRoot || this.attachShadow({mode:"open"})
    ) {
      shadowRoot.innerHTML = await (await fetch(this.getAttribute("src"))).text()
    }
})

//animation stuff
const fadeInTime = .4; //(seconds)
const fadeOutTime = .3;
const introDelay = .05; //all animations will get this delay when the html loads (use this so it times with your transition)

//max text sizes (used when resizing back)
const playerSize = '90px';
const tagSize = '50px';
const playerSizeDubs = "45px";
const tagSizeDubs = "25px";
const teamSize = '72px';
const roundSize = '38px';
const tournamentSize = '28px';
const casterSize = '25px';
const cSocialSize = '20px';

//to avoid the code constantly running the same method over and over
const pCharPrev = [], pBgPrev = [], scorePrev = [], colorPrev = [];
let bestOfPrev, gamemodePrev;

// groups of classes
const casters = [];

// variables for the commentator social info constant change
let sTurn = 0;
const socialInterval = 7000; // time in miliseconds for each change

//to consider how many loops will we do
let maxPlayers = 2; //will change when doubles comes
const maxSides = 2;

let startup = true;


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
const scoreBorder = document.getElementById("scoreBorder");
const roundEL = document.getElementById("round");
const tournamentEL = document.getElementById("tournament");


// commentator class (more classes may be crated on future releases maybe?)
class Caster {

	constructor(num, data) {

		this.cName = document.getElementById("caster"+num);
		this.cTwitter = document.getElementById("twitter"+num);
		this.cTwitch = document.getElementById("twitch"+num);
		this.cYt = document.getElementById("yt"+num);

		// set all the texts on startup
		this.setName(data.name);
		this.setTwitter(data.twitter);
		this.setTwitch(data.twitch);
		this.setYt(data.yt);

	}

	getName() {
		return this.cName.innerHTML;
	}
	getTwitter() {
		return this.cTwitter.innerHTML;
	}
	getTwitch() {
		return this.cTwitch.innerHTML;
	}
	getYt() {
		return this.cYt.innerHTML;
	}
	
	setName(text) {
		updateText(this.cName, text, casterSize);
	}
	setTwitter(text) {
		updateSocialText(this.cTwitter, text, cSocialSize, this.cTwitter.parentElement);
	}
	setTwitch(text) {
		updateSocialText(this.cTwitch, text, cSocialSize, this.cTwitch.parentElement);
	}
	setYt(text) {
		updateSocialText(this.cYt, text, cSocialSize, this.cYt.parentElement);
	}

	update(data) {

		// caster name is simple enough
		if (this.getName() != data.name) {
			fadeOut(this.cName).then( () => {
				this.setName(data.name);
				fadeIn(this.cName, .2);
			});
		}

		// but for the rest
		if (this.getTwitter() != data.twitter) {
			// only animate the change if its visible
			if (window.getComputedStyle(this.cTwitter.parentElement).getPropertyValue("opacity") == 1) {
				fadeOut(this.cTwitter.parentElement).then( () => {
					this.setTwitter(data.twitter);
					fadeIn(this.cTwitter.parentElement, .2);
				});
			} else {
				this.setTwitter(data.twitter);
			}
		}
		if (this.getTwitch() != data.twitch) {
			if (window.getComputedStyle(this.cTwitch.parentElement).getPropertyValue("opacity") == 1) {
				fadeOut(this.cTwitch.parentElement).then( () => {
					this.setTwitch(data.twitch);
					fadeIn(this.cTwitch.parentElement, .2);
				});
			} else {
				this.setTwitch(data.twitch);
			}
		}
		if (this.getYt() != data.yt) {
			if (window.getComputedStyle(this.cYt.parentElement).getPropertyValue("opacity") == 1) {
				fadeOut(this.cYt.parentElement).then( () => {
					this.setYt(data.yt);
					fadeIn(this.cYt.parentElement, .2);
				});
			} else {
				this.setYt(data.yt);
			}
		}

	}

}


// first we will start by connecting with the GUI with a websocket
startWebsocket();
function startWebsocket() {

	// change this to the IP of where the GUI is being used for remote control
	const webSocket = new WebSocket("ws://localhost:8080?id=gameData");
	webSocket.onopen = () => { // if it connects successfully
		// everything will update everytime we get data from the server (the GUI)
		webSocket.onmessage = function (event) {
			updateData(JSON.parse(event.data));
		}
		// hide error message in case it was up
		document.getElementById('connErrorDiv').style.display = 'none';
	}

	// if the GUI closes, wait for it to reopen
	webSocket.onclose = () => {errorWebsocket()}
	// if connection fails for any reason
	webSocket.onerror = () => {errorWebsocket()}

}
function errorWebsocket() {

	// show error message
	document.getElementById('connErrorDiv').style.display = 'flex';
	// we will attempt to reconect every 5 seconds
	setTimeout(() => {
		startWebsocket();
	}, 5000);

}


async function updateData(scInfo) {

	const player = scInfo.player;
	const teamName = scInfo.teamName;

	const color = scInfo.color;
	const score = scInfo.score;

	const bestOf = scInfo.bestOf;
	const gamemode = scInfo.gamemode;

	const round = scInfo.round;
	const tournamentName = scInfo.tournamentName;

	const caster = scInfo.caster;


	// first of all, things that will always happen on each cycle

	// set the max players depending on singles or doubles
	maxPlayers = gamemode == 1 ? 2 : 4;

	// depending on best of, show or hide some score ticks
	if (bestOfPrev != bestOf) {
		updateBo(bestOf);
		bestOfPrev = bestOf;
	}

	// now, things that will happen only the first time the html loads
	if (startup) {

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
			fadeIn(pWrapper[i], introDelay+.3);


			// now lets update all that player info
			updatePlayerInfo(i, player[i]);

			// and gradually fade them in
			fadeIn(pInfoProns[i].parentElement, introDelay+.6);
			fadeIn(pInfoTwitter[i].parentElement, introDelay+.75);
			fadeIn(pInfoTwitch[i].parentElement, introDelay+.9);
			fadeIn(pInfoYt[i].parentElement, introDelay+1.05);


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
				charaFadeIn(value[i][0], value[i][1], introDelay); // fade it in
			}
		})


		// this will run for each side (so twice)
		for (let i = 0; i < maxSides; i++) {

			//update team names (if gamemode is not set to singles)
			if (gamemode != 1) {
				updateText(teamNames[i], teamName[i], teamSize);
				fadeIn(teamNames[i], introDelay+.15);
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
		updateText(roundEL, round, roundSize);
		//set the tournament text
		updateText(tournamentEL, tournamentName, tournamentSize);


		//set the caster info
		for (let i = 0; i < caster.length; i++) {

			// add all casters found to the array, all info will initialize there
			casters.push(new Caster(i+1, caster[i]));

		}

		// random number so we start with a random social tag each time
		sTurn = Math.floor(Math.random() * (3 - 1 + 1) ) + 1;
		// set an interval to keep changing the commentator social info
		setInterval(() => {
			fadeOutSocials();
		}, socialInterval);
		// fade in the first batch
		fadeInSocials();


		startup = false; //next time we run this function, it will skip all we just did
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
					fadeOut(scoreOverlay);
				} else if (window.getComputedStyle(scoreOverlay).getPropertyValue("opacity") == 0) {
					fadeIn(scoreOverlay);
				}

				scorePrev[i] = score[i];

			}

			//did any of the team names change?
			if (gamemode != 1) {
				if (teamNames[i].textContent != teamName[i]) {
					//hide the text before doing anything
					fadeOut(teamNames[i]).then( () => {
						//update the text while nobody can see it
						updateText(teamNames[i], teamName[i], teamSize);
						//and fade it back to normal
						fadeIn(teamNames[i]);
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
				fadeOut(pWrapper[i]).then( () => {
					//now that nobody is seeing it, change the content of the texts!
					updatePlayerName(i, player[i].name, player[i].tag, gamemode);
					//and fade the texts back in
					fadeIn(pWrapper[i], .2);
				});
			};

			// all that player info must be updated!
			if (pInfoProns[i].textContent != player[i].pronouns ||
				pInfoTwitter[i].textContent != player[i].twitter ||
				pInfoTwitch[i].textContent != player[i].twitch ||
				pInfoYt[i].textContent != player[i].yt) {

				// fade all of them out, we only need to wait for one
				fadeOut(pInfoProns[i].parentElement);
				fadeOut(pInfoTwitter[i].parentElement);
				fadeOut(pInfoTwitch[i].parentElement);
				fadeOut(pInfoYt[i].parentElement).then( () => {
					// update the texts!
					updatePlayerInfo(i, player[i]);
					// but woudnt it be cool if we faded all of them with progression
					fadeIn(pInfoProns[i].parentElement, .2);
					fadeIn(pInfoTwitter[i].parentElement, .35);
					fadeIn(pInfoTwitch[i].parentElement, .5);
					fadeIn(pInfoYt[i].parentElement, .65);
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
				fadeOut(pBG[i], fadeOutTime+.2).then( () => {
					//update the bg vid
					updateBG(pBG[i], player[i].vs.bgVid);
					//fade it back
					fadeIn(pBG[i], .3, fadeInTime+.2);
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
		if (roundEL.textContent != round){
			fadeOut(roundEL).then( () => {
				updateText(roundEL, round, roundSize);
				fadeIn(roundEL, .2);
			});
		}

		//update tournament text
		if (tournamentEL.textContent != tournamentName){
			fadeOut(tournamentEL).then( () => {
				updateText(tournamentEL, tournamentName, tournamentSize);
				fadeIn(tournamentEL, .2);
			});
		}


		//update caster info
		for (let i = 0; i < caster.length; i++) {
			
			// with the magic of javascript classes, we will just do this:
			casters[i].update(caster[i]);

		}
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
			pName[i].style.fontSize = playerSizeDubs;
			pTag[i].style.fontSize = tagSizeDubs;
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
	updateText(scoreNums[side], pScore, "48px");

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


// to hide some score ticks and change score border
function updateBo(bestOf) {

	const scoreTicks = document.getElementById("scoreTicks");
	const scoreNumerical = document.getElementById("scoreNumerical");

	if (bestOf == 5) {
		scoreTicks.style.display = "block";
		scoreNumerical.style.display = "none";
		scoreImg[2].style.opacity = 1;
		scoreImg[5].style.opacity = 1;
		scoreBorder.src = "Resources/Overlay/VS Screen/Score Border Bo5.png";
	} else if (bestOf == 3) {
		scoreTicks.style.display = "block";
		scoreNumerical.style.display = "none";
		scoreImg[2].style.opacity = 0;
		scoreImg[5].style.opacity = 0;
		scoreBorder.src = "Resources/Overlay/VS Screen/Score Border Bo3.png";
	} else if (bestOf == "X") {
		scoreTicks.style.display = "none";
		scoreNumerical.style.display = "flex";		
	}
}


// the logic bechind the commentator social info constant change
function fadeOutSocials() {

	if (sTurn == 0) { // if there were no available texts on last check
		
		// simply fade in
		sTurn++;
		fadeInSocials();

	} else {

		let theresText; // to know if theres... text

		// for all the current casters stored
		for (let i = 0; i < casters.length; i++) {
			
			if (sTurn != 1) { // twitter turn
				if (casters[i].getTwitter() != "-") {
					theresText = true;
				}
			}
			if (sTurn != 2) { // twitch turn
				if (casters[i].getTwitch() != "-") {
					theresText = true;
				}
			}
			if (sTurn != 3) { // youtube turn
				if (casters[i].getYt() != "-") {
					theresText = true;
				}
			}
			
		}

		// if theres any text to show, its time to fade it in
		if (theresText) {
			
			for (let i = 0; i < casters.length; i++) {
				if (sTurn == 1) {
					fadeOut(casters[i].cTwitter.parentElement);
				} else if (sTurn == 2) {
					fadeOut(casters[i].cTwitch.parentElement);
				} else if (sTurn == 3) {
					fadeOut(casters[i].cYt.parentElement);
				}
			}

			// wait for the animations to finish
			setTimeout(() => {
				sTurn++;
				if (sTurn == 4) {sTurn = 1}
				fadeInSocials();
			}, fadeOutTime*1000);

		}

	}
	
}
function fadeInSocials(repeated) {
	
	if (sTurn == 1) { // twitter turn

		let theresText;
		
		// check all existing commentators
		for (let i = 0; i < casters.length; i++) {

			// if a commentator has text, set the flag
			if (casters[i].getTwitter() != "-") {
				theresText = true;
			}
			
		}

		// if text was found on at least one caster
		if (theresText) {
			// fade in all caster twitter info
			for (let i = 0; i < casters.length; i++) {
				fadeIn(casters[i].cTwitter.parentElement);
			}
			return; // dont activate the rest of the function
		} else {
			sTurn++;
		}

	}
	if (sTurn == 2) { // twitch turn
		// same as before
		let theresText;
		for (let i = 0; i < casters.length; i++) {
			if (casters[i].getTwitch() != "-") {
				theresText = true;
			}
		}
		if (theresText) {
			for (let i = 0; i < casters.length; i++) {
				fadeIn(casters[i].cTwitch.parentElement);
			}
			return;
		} else {
			sTurn++;
		}
	}
	if (sTurn == 3) { // youtube turn
		let theresText;
		for (let i = 0; i < casters.length; i++) {
			if (casters[i].getYt() != "-") {
				theresText = true;
			}
		}
		if (theresText) {
			for (let i = 0; i < casters.length; i++) {
				fadeIn(casters[i].cYt.parentElement);
			}
			return;
		} else {
			sTurn++;
		}
	}

	// if nothing had text, set it to 1
	sTurn = 1;

	// if this is the first time, do another round
	if (!repeated) {
		fadeInSocials(true);
	} else {
		sTurn = 0;
	}

}


//player text change
function updatePlayerName(pNum, name, tag, gamemode = 1) {
	if (gamemode == 2) {
		pName[pNum].style.fontSize = playerSizeDubs; //set original text size
		pTag[pNum].style.fontSize = tagSizeDubs;
	} else {
		pName[pNum].style.fontSize = playerSize;
		pTag[pNum].style.fontSize = tagSize;
	}
	pName[pNum].textContent = name; //change the actual text
	pTag[pNum].textContent = tag;

	resizeText(pWrapper[pNum]); //resize if it overflows
}

// player info change
function updatePlayerInfo(pNum, pInfo) {
	
	pInfoProns[pNum].innerText = pInfo.pronouns;
	pInfoTwitter[pNum].innerText = pInfo.twitter;
	pInfoTwitch[pNum].innerText = pInfo.twitch;
	pInfoYt[pNum].innerText = pInfo.yt;

	// there must be a cleaner way to do this right?
	if (pInfo.pronouns) {
		pInfoProns[pNum].parentElement.style.display = "block";
	} else {
		pInfoProns[pNum].parentElement.style.display = "none";
	}
	if (pInfo.twitter) {
		pInfoTwitter[pNum].parentElement.style.display = "block";
	} else {
		pInfoTwitter[pNum].parentElement.style.display = "none";
	}
	if (pInfo.twitch) {
		pInfoTwitch[pNum].parentElement.style.display = "block";
	} else {
		pInfoTwitch[pNum].parentElement.style.display = "none";
	}
	if (pInfo.yt) {
		pInfoYt[pNum].parentElement.style.display = "block";
	} else {
		pInfoYt[pNum].parentElement.style.display = "none";
	}

}

//generic text changer
function updateText(textEL, textToType, maxSize) {
	textEL.style.fontSize = maxSize; //set original text size
	textEL.textContent = textToType; //change the actual text
	resizeText(textEL); //resize it if it overflows
}
//social text changer
function updateSocialText(textEL, textToType, maxSize, wrapperEL) {
	textEL.style.fontSize = maxSize; //set original text size
	textEL.textContent = textToType; //change the actual text
	resizeText(wrapperEL); //resize it if it overflows
}

//text resize, keeps making the text smaller until it fits
function resizeText(textEL) {
	const childrens = textEL.children;
	while (textEL.scrollWidth > textEL.offsetWidth) {
		if (childrens.length > 0) { //for tag+player texts
			Array.from(childrens).forEach((child) => {
				child.style.fontSize = getFontSize(child);
			});
		} else {
			textEL.style.fontSize = getFontSize(textEL);
		}
	}
}
//returns a smaller fontSize for the given element
function getFontSize(textElement) {
	return (parseFloat(textElement.style.fontSize.slice(0, -2)) * .90) + 'px';
}


//fade out
async function fadeOut(itemID, dur = fadeOutTime) {
	itemID.style.animation = `fadeOut ${dur}s both`;
	// this function will return a promise when the animation ends
	await new Promise(resolve => setTimeout(resolve, dur * 1000)); // translate to miliseconds
}

//fade in
function fadeIn(itemID, delay = 0, dur = fadeInTime) {
	itemID.style.animation = `fadeIn ${dur}s ${delay}s both`;
}

//fade out for the characters
async function charaFadeOut(charaEL, trailEL) {

	charaEL.style.animation = `charaMoveOut ${fadeOutTime}s both
		,fadeOut ${fadeOutTime}s both`
	;
	// this is only so the animation change gets activated on fade in
	trailEL.parentElement.style.animation = `trailMoveOut 0s both`;

	await new Promise(resolve => setTimeout(resolve, fadeOutTime * 1000));

}

//fade in characters edition
function charaFadeIn(charaEL, trailEL, delay = 0) {
	charaEL.style.animation = `charaMoveIn ${fadeInTime + .1}s ${delay + .2}s both
		, fadeIn ${fadeInTime + .1}s ${delay + .2}s both`
	;
	trailEL.parentElement.style.animation = `trailMoveIn ${fadeInTime + .1}s ${delay + .4}s both
		, fadeIn ${fadeInTime + .1}s ${delay + .4}s both`
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
	if (charInfo.charImg.includes("HD")) {
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
