'use strict';

//animation stuff
const pMove = 50; //distance to move for the player names (pixels)
const pCharMove = 20; //distance to move for the character icons

const fadeInTime = .3; //(seconds)
const fadeOutTime = .2;
let introDelay = .8; //all animations will get this delay when the html loads (use this so it times with your transition)

//max text sizes (used when resizing back)
const introSize = "85px";
const nameSize = "24px";
const tagSize = "17px";
const nameSizeDubs = "22px";
const tagSizeDubs = "15px";
const roundSize = "19px";

//to store the current character info
const pCharInfo = [];

//the characters image file path will change depending if they're workshop or not
let charPath;
const charPathBase = "Resources/Characters/";
const charPathWork = "Resources/Characters/_Workshop/";

//color list will be stored here on startup
let colorList;

//to avoid the code constantly running the same method over and over
const pCharPrev = [], pSkinPrev = [], scorePrev = [], colorPrev = [], wlPrev = [];
let bestOfPrev, workshopPrev, mainMenuPrev, gamemodePrev;

//to consider how many loops will we do
let maxPlayers = 2;
const maxSides = 2;

let startup = true;


//next, global variables for the html elements
const pWrapper = document.getElementsByClassName("wrappers");
const pTag = document.getElementsByClassName("tags");
const pName = document.getElementsByClassName("names");
const teamNames = document.getElementsByClassName("teamName");
const charImg = document.getElementsByClassName("pCharacter");
const colorImg = document.getElementsByClassName("colors");
const wlGroup = document.getElementsByClassName("wlGroup");
const wlText = document.getElementsByClassName("wlText");
const scoreImg = document.getElementsByClassName("scoreImgs");
const scoreAnim = document.getElementsByClassName("scoreVid");
const tLogoImg = document.getElementsByClassName("tLogos");
const overlayRound = document.getElementById("overlayRound");
const textRound = document.getElementById('round');
const borderImg = document.getElementsByClassName('border');


/* script begin */
async function mainLoop() {
	const scInfo = await getInfo();
	getData(scInfo);
}
mainLoop();
setInterval( () => { mainLoop(); }, 500); //update interval

async function getData(scInfo) {

	const player = scInfo['player'];
	const teamName = scInfo['teamName'];

	const color = scInfo['color'];
	const score = scInfo['score'];
	const wl = scInfo['wl'];

	const bestOf = scInfo['bestOf'];
	const gamemode = scInfo['gamemode'];

	const round = scInfo['round'];

	const workshop = scInfo['workshop'];

	const mainMenu = scInfo['forceMM'];

	// if there is no team name, just display "[Color] Team"
	for (let i = 0; i < maxSides; i++) {
		if (!teamName[i]) teamName[i] = color[i] + " Team";
	}


	//first, things that will happen only once, when the html loads
	if (startup) {

		//first things first, initialize the colors list
		colorList = await getColorInfo();		

		//of course, we have to start with the cool intro stuff
		if (scInfo['allowIntro']) {

			//lets see that intro
			document.getElementById('overlayIntro').style.opacity = 1;

			//this vid is just the bars moving (todo: maybe do it through javascript?)
			setTimeout(() => { 
				const introVid = document.getElementById('introVid');
				introVid.src = 'Resources/Overlay/Scoreboard/Intro.webm';
				introVid.play();
			}, 0); //if you need it to start later, change that 0 (and also update the introDelay)

			if (score[0] + score[1] == 0) { //if this is the first game, introduce players

				for (let i = 0; i < maxSides; i++) {
					const pIntroEL = document.getElementById('p'+(i+1)+'Intro');

					//update players intro text
					if (gamemode == 1) { //if singles, show player 1 and 2 names
						pIntroEL.textContent = player[i].name;
					} else { //if doubles
						if (teamName[i] == color[i] + " Team") { //if theres no team name, show player names
							pIntroEL.textContent = player[i].name + " & " + player[i+2].name;
						} else { //else, show the team name
							pIntroEL.textContent = teamName[i];
						}
					}

					pIntroEL.style.fontSize = introSize; //resize the font to its max size
					resizeText(pIntroEL); //resize the text if its too large

					//change the color of the player text shadows
					pIntroEL.style.textShadow = '0px 0px 20px ' + getHexColor(color[i]);
					
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

					if ((round.toUpperCase() == "True Finals".toUpperCase())) { //if true finals

						midTextEL.textContent = "True Final Game"; //i mean shit gets serious here
						
					} else {

						midTextEL.textContent = "Final Game";
						
						//if GF, we dont know if its the last game or not, right?
						if (round.toLocaleUpperCase() == "Grand Finals".toLocaleUpperCase() && !(wl[0] == "L" && wl[1] == "L")) {
							fadeIn(document.getElementById("superCoolInterrogation"), introDelay+.5, 1.5);
						}

					}
				}
			}

			document.getElementById('roundIntro').textContent = round;
			document.getElementById('tNameIntro').textContent = scInfo['tournamentName'];
			
			//round, tournament and VS/GameX text fade in
			document.querySelectorAll(".textIntro").forEach(el => {
				fadeIn(el, introDelay-.2, fadeInTime);
			});

			//aaaaand fade out everything
			fadeOut(document.getElementById("overlayIntro"), fadeInTime+.2, introDelay+1.6)

			//lets delay everything that comes after this so it shows after the intro
			introDelay = 2.6;
		}

		
		//finally out of the intro, first things first, set the current char path
		workshop ? charPath = charPathWork : charPath = charPathBase;
		//save the current workshop status so we know when it changes next time
		workshopPrev = workshop;


		//if this isnt a singles match, rearrange stuff
		if (gamemode != 1) {
			changeGM(gamemode);
		}
		gamemodePrev = gamemode;


		//this is on top of everything else because the await would desync the rest
		for (let i = 0; i < maxPlayers; i++) { //for each available player
			//gets us the character positions for the player
			pCharInfo[i] = await getCharInfo(player[i].character);
		}


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
				fadeIn(pWrapper[i], introDelay+.15)
			}
			

			//set the character image for the player
			charsLoaded.push(updateChar(player[i].character, player[i].skin, i, pCharInfo[i], mainMenu));
			//the animation will be fired below, when the image finishes loading

			//save the character/skin so we run the character change code only when this doesnt equal to the next
			pCharPrev[i] = player[i].character;
			pSkinPrev[i] = player[i].skin;

		}

		// now we use that array from earlier to animate all characters at the same time
		Promise.all(charsLoaded).then( (value) => { // when all images are loaded
			for (let i = 0; i < value.length; i++) { // for every character loaded
				fadeInMove(value[i], introDelay+.25, true); // fade it in
			}
		})

		// this will run for each side (so twice)
		for (let i = 0; i < maxSides; i++) {

			//set the team names if not singles
			if (gamemode != 1) {
				updateText(teamNames[i], teamName[i], nameSize);
				const side = (i % 2 == 0) ? true : false;
				fadeInMove(teamNames[i], introDelay, null, side);
			}
			
			//if its grands, we need to show the [W] and/or the [L] on the players
			updateWL(wl[i], i, gamemode);
			fadeInWL(wlGroup[i], gamemode, i, introDelay+.5);
			
			//save for later so the animation doesn't repeat over and over
			wlPrev[i] = wl[i];

			//set the current score
			updateScore(score[i], bestOf, color[i], i, gamemode, false);
			scorePrev[i] = score[i];

			//set the color
			updateColor(colorImg[i], color[i]);
			colorPrev[i] = color[i];

			//check if we have a logo we can place on the overlay
			if (gamemode == 1) { //if this is singles, check the player tag
				updateLogo(tLogoImg[i], player[i].tag, i, gamemode);
			} else { //if doubles, check the team name
				updateLogo(tLogoImg[i], teamName[i], i, gamemode);
			}
			
		}


		//update the round text	and fade it in
		updateText(textRound, round, roundSize);
		fadeIn(overlayRound, introDelay);


		//dont forget to update the border if its Bo3 or Bo5!
		updateBorder(bestOf, gamemode);


		//set this for later
		mainMenuPrev = mainMenu;


		startup = false; //next time we run this function, it will skip all we just did
	}

	//now things that will happen constantly
	else {

		//start by setting the correct char path
		if (workshopPrev != workshop) {
			workshop ? charPath = charPathWork : charPath = charPathBase;
			workshopPrev = workshop;
		}

		//of course, check if the gamemode has changed
		if (gamemodePrev != gamemode) {
			changeGM(gamemode);
			updateBorder(bestOf, gamemode);
			for (let i = 0; i < maxSides; i++) {
				updateWL(wl[i], i, gamemode);
				if (gamemode == 1) {
					updateLogo(tLogoImg[i], player[i].tag, i, gamemode);
				} else {
					updateLogo(tLogoImg[i], teamName[i], i, gamemode);
				}
			}			
			gamemodePrev = gamemode;
		}
		

		//get the character lists now before we do anything else
		for (let i = 0; i < maxPlayers; i++) {
			//if the character has changed, update the info
			if (pCharPrev[i] != player[i].character) {
				pCharInfo[i] = await getCharInfo(player[i].character);
			}
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
					fadeOut(pWrapper[i]).then( () => {
						updatePlayerName(i, player[i].name, player[i].tag, gamemode);
						fadeIn(pWrapper[i]);
					}); 
				}
				
			}

			//player characters and skins
			if (pCharPrev[i] != player[i].character || pSkinPrev[i] != player[i].skin || mainMenuPrev != mainMenu) {

				//fade out the image while also moving it because that always looks cool
				animsEnded.push(fadeOutMove(charImg[i], true, null).then( () => {
					//now that nobody can see it, lets change the image!
					charsLoaded.push(updateChar(player[i].character, player[i].skin, i, pCharInfo[i], mainMenu));
					//will fade in when image finishes loading
				}));
				pCharPrev[i] = player[i].character;
				pSkinPrev[i] = player[i].skin;
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
						updateText(teamNames[i], teamName[i], nameSize);
						fadeInMove(teamNames[i], 0, null, side);
					});
				}
			}
			
			//the [W] and [L] status for grand finals
			if (wlPrev[i] != wl[i]) {
				//move it away!
				fadeOutWL(wlGroup[i], gamemode, i).then( () => {
					//change the thing!
					updateWL(wl[i], i, gamemode);
					//move it back!
					fadeInWL(wlGroup[i], gamemode, i)
				});
				wlPrev[i] = wl[i];
			}

			//score check
			if (scorePrev[i] != score[i]) {
				updateScore(score[i], bestOf, color[i], i, gamemode, true); //if true, animation will play
				scorePrev[i] = score[i];
			}

			//change the player background colors
			if (colorPrev[i] != color[i]) {
				updateColor(colorImg[i], color[i]);
				colorPrev[i] = color[i];
			}

			//check if we have a logo we can place on the overlay
			if (gamemode == 1) { //if this is singles, check the player tag
				if (pTag[i].textContent != player[i].tag) {
					fadeOut(tLogoImg[i]).then( () => {
						updateLogo(tLogoImg[i], player[i].tag, i, gamemode);
						fadeIn(tLogoImg[i]);
					});
				}
			} else { //if doubles, check the team name
				if (teamNames[i].textContent != teamName[i]) {
					fadeOut(tLogoImg[i]).then( () => {
						updateLogo(tLogoImg[i], teamName[i], i, gamemode);
						fadeIn(tLogoImg[i]);
					});
				}
			}


		}


		//we place this one here so both characters can be updated in one go
		mainMenuPrev = mainMenu;


		//change border depending of the Best Of status
		if (bestOfPrev != bestOf) {
			updateBorder(bestOf, gamemode); //update the border
			//update the score ticks so they fit the bestOf border
			updateScore(score[0], bestOf, color[0], 0, gamemode, false);
			updateScore(score[1], bestOf, color[1], 1, gamemode, false);
		}

		
		//and finally, update the round text
		if (textRound.textContent != round){
			fadeOut(textRound).then( () => {
				updateText(textRound, round, roundSize);
				fadeIn(textRound);
			});
		}

	}
}


// the gamemode manager
function changeGM(gm) {
			
	if (gm == 2) {

		maxPlayers = 4;

		//change the positions for the character images
		const charTop = document.getElementsByClassName("charTop");
		for (let i = 0; i < charTop.length; i++) {
			charTop[i].parentElement.classList.remove("maskSingles");
			charTop[i].parentElement.classList.add("maskDubs");
			charTop[i].style.top = "-15px"
		}

		//change the positions for the player texts
		for (let i = 0; i < 2; i++) {
			pWrapper[i].classList.remove("wrappersSingles");
			pWrapper[i].classList.add("wrappersDubs");
			pWrapper[i].style.top = "-5px";
			//update the text size and resize it if it overflows
			pName[i].style.fontSize = nameSizeDubs;
			pTag[i].style.fontSize = tagSizeDubs;
			resizeText(pWrapper[i]);
		}
		pWrapper[0].style.left = "155px";
		pWrapper[1].style.right = "155px";

		//show all hidden elements
		const dubELs = document.getElementsByClassName("dubEL");
		for (let i = 0; i < dubELs.length; i++) {
			dubELs[i].style.display = "block";
		}

	} else {

		maxPlayers = 2

		const charTop = document.getElementsByClassName("charTop");
		for (let i = 0; i < charTop.length; i++) {
			charTop[i].parentElement.classList.remove("maskDubs");
			charTop[i].parentElement.classList.add("maskSingles");
			charTop[i].style.top = "0px"
		}

		for (let i = 0; i < 2; i++) {
			pWrapper[i].classList.remove("wrappersDubs");
			pWrapper[i].classList.add("wrappersSingles");
			pWrapper[i].style.top = "0px";
			pName[i].style.fontSize = nameSize;
			pTag[i].style.fontSize = tagSize;
			resizeText(pWrapper[i]);
		}
		pWrapper[0].style.left = "158px";
		pWrapper[1].style.right = "158px";

		const dubELs = document.getElementsByClassName("dubEL");
		for (let i = 0; i < dubELs.length; i++) {
			dubELs[i].style.display = "none";
		}
		
	}

}


// update functions
async function updateScore(pScore, bestOf, pColor, pNum, gamemode, playAnim) {

	if (playAnim) { //do we want to play the score up animation?
		// depending on the color, change the clip
		scoreAnim[pNum].src = 'Resources/Overlay/Scoreboard/Score/' + gamemode + "/" + '/' + pColor + '.webm';
		scoreAnim[pNum].play();
	} 
	// change the score image with the new values
	scoreImg[pNum].src = 'Resources/Overlay/Scoreboard/Score/Win Tick ' + bestOf + ' ' + pScore + '.png';

}

function updateColor(colorEL, pColor) {
	colorEL.src = "Resources/Overlay/Scoreboard/Colors/" + pColor + ".png";
}

function updateBorder(bestOf, gamemode) {
	for (let i = 0; i < borderImg.length; i++) {
		borderImg[i].src = 'Resources/Overlay/Scoreboard/Borders/Border ' + gamemode + " " + bestOf + '.png';
	}
	bestOfPrev = bestOf
}

function updateLogo(logoEL, nameLogo, side, gamemode) {
	const mode = gamemode==1 ? "Singles" : "Doubles";
	const actualSide = side ? "Right" : "Left";
	logoEL.src = 'Resources/Logos/' + mode + '/' + actualSide + '/' + nameLogo + '.png';
}

function updatePlayerName(pNum, name, tag, gamemode) {
	if (gamemode == 2) {
		pName[pNum].style.fontSize = nameSizeDubs; //set original text size
		pTag[pNum].style.fontSize = tagSizeDubs;
	} else {
		pName[pNum].style.fontSize = nameSize;
		pTag[pNum].style.fontSize = tagSize;
	}
	pName[pNum].textContent = name; //change the actual text
	pTag[pNum].textContent = tag;
	resizeText(pWrapper[pNum]); //resize if it overflows
}

//generic text changer
function updateText(textEL, textToType, maxSize) {
	textEL.style.fontSize = maxSize; //set original text size
	textEL.textContent = textToType; //change the actual text
	resizeText(textEL); //resize it if it overflows
}

function updateWL(pWL, pNum, gamemode) {
	//check if winning or losing in a GF, then change image
	if (pWL == "W") {
		wlText[pNum].textContent = "WINNERS";
		wlText[pNum].style.color = "#76a276";
		wlGroup[pNum].style.display = "block";
	} else if (pWL == "L") {
		wlText[pNum].textContent = "LOSERS";
		wlText[pNum].style.color = "#a27677";
		wlGroup[pNum].style.display = "block";
	} else {
		wlText[pNum].textContent = ' ';
		wlGroup[pNum].style.display = "none";
	}
}


//fade out
async function fadeOut(itemID, dur = fadeOutTime, delay = 0) {
	// actual animation
	itemID.style.animation = `fadeOut ${dur}s ${delay}s both`;
	// this function will return a promise when the animation ends
	await new Promise(resolve => setTimeout(resolve, dur * 1000)); // translate to miliseconds
}

//fade out but with movement
async function fadeOutMove(itemID, chara, side) {

	if (chara) {
		// we need to target a different element since chromium
		// does not support idependent transforms on css yet
		itemID.parentElement.style.animation = `charaMoveOut ${fadeOutTime}s both
			,fadeOut ${fadeOutTime}s both`
		;
	} else {
		if (side) {
			itemID.style.animation = `moveOutLeft ${fadeOutTime}s both
				,fadeOut ${fadeOutTime}s both`
			;
		} else {
			itemID.style.animation = `moveOutRight ${fadeOutTime}s both
				,fadeOut ${fadeOutTime}s both`
			;
		}
		
	}
	
	await new Promise(resolve => setTimeout(resolve, fadeOutTime * 1000));

}

//fade in
function fadeIn(itemID, delay = 0, dur = fadeInTime) {
	itemID.style.animation = `fadeIn ${dur}s ${delay}s both`;
}

//fade in but with movement
function fadeInMove(itemID, delay = 0, chara, side) {
	if (chara) {
		itemID.parentElement.style.animation = `charaMoveIn ${fadeOutTime}s ${delay}s both
			, fadeIn ${fadeOutTime}s ${delay}s both`
		;
	} else {
		if (side) {
			itemID.style.animation = `moveInLeft ${fadeInTime}s ${delay}s both
				, fadeIn ${fadeInTime}s ${delay}s both`
			;
		} else {
			itemID.style.animation = `moveInRight ${fadeInTime}s ${delay}s both
				, fadeIn ${fadeInTime}s ${delay}s both`
			;
		}
	}
}

//movement for the [W]/[L] images
async function fadeOutWL(wlEL, gamemode, side) {
	if (gamemode == 1) { //if singles, move it vertically
		wlEL.style.animation = `wl1MoveOut .4s both`;
	} else { // doubles, horizontal movement
		if (side) {
			wlEL.style.animation = `wl2MoveOutRight .5s both`;
		} else {
			wlEL.style.animation = `wl2MoveOutLeft .5s both`;
		}
	}
	await new Promise(resolve => setTimeout(resolve, 400));
}
function fadeInWL(wlEL, gamemode, side, delay = 0) {
	if (gamemode == 1) {
		wlEL.style.animation = `wl1MoveIn .4s ${delay}s both`;
	} else {
		if (side) {
			wlEL.style.animation = `wl2MoveInRight .5s ${delay}s both`;
		} else {
			wlEL.style.animation = `wl2MoveInLeft .5s ${delay}s both`;
		}
	}
}


//text resize, keeps making the text smaller until it fits
function resizeText(textEL) {
	const childrens = textEL.children;
	while (textEL.scrollWidth > textEL.offsetWidth || textEL.scrollHeight > textEL.offsetHeight) {
		if (childrens.length > 0) { //for tag+player texts
			Array.from(childrens).forEach(function (child) {
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

//so we can get the exact color used by the game!
function getHexColor(color) {
	for (let i = 0; i < colorList.length; i++) {
		if (colorList[i].name == color) {
			return colorList[i].hex;
		}
	}
}

//searches for the main json file
function getInfo() {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", 'Resources/Texts/ScoreboardInfo.json');
		oReq.send();

		//will trigger when file loads
		function reqListener () {
			resolve(JSON.parse(oReq.responseText))
		}
	})
	//i would gladly have used fetch, but OBS local files wont support that :(
}

//searches for the colors list json file
function getColorInfo() {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", 'Resources/Texts/Color Slots.json');
		oReq.send();

		function reqListener () {
			resolve(JSON.parse(oReq.responseText))
		}
	})
}

//searches for a json file with character data
function getCharInfo(pCharacter) {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.onerror = () => {resolve(null)}; //for obs local file browser sources
		oReq.open("GET", charPath + pCharacter + '/_Info.json');
		oReq.send();

		function reqListener () {
			try {resolve(JSON.parse(oReq.responseText))}
			catch {resolve(null)} //for live servers
		}
	})
}

//now the complicated "change character image" function!
async function updateChar(pCharacter, pSkin, pNum, charInfo, mainMenu) {

	//store so code looks cleaner
	const charEL = charImg[pNum];

	//change the image path depending on the character and skin
	charEL.src = charPath + pCharacter + '/' + pSkin + '.png';

	//               x, y, scale
	const charPos = [0, 0, 1];
	//now, check if the character and skin exist in the database down there
	if (charInfo) {
		if (charInfo.scoreboard[pSkin]) { //if the skin has a specific position
			charPos[0] = charInfo.scoreboard[pSkin].x;
			charPos[1] = charInfo.scoreboard[pSkin].y;
			charPos[2] = charInfo.scoreboard[pSkin].scale;
		} else if (mainMenu && charInfo.scoreboard.mainMenu) { //for the main menu renders, or some extras for workshop characters
			charPos[0] = charInfo.scoreboard.mainMenu.x;
			charPos[1] = charInfo.scoreboard.mainMenu.y;
			charPos[2] = charInfo.scoreboard.mainMenu.scale;
			charEL.src = charPath + pCharacter + '/MainMenu/'+pSkin+'.png';
		} else { //if none of the above, use a default position
			charPos[0] = charInfo.scoreboard.neutral.x;
			charPos[1] = charInfo.scoreboard.neutral.y;
			charPos[2] = charInfo.scoreboard.neutral.scale;
		}
	} else { //if the character isnt on the database, set positions for the "?" image
		//this condition is used just to position images well on both sides
		if (pNum % 2 == 0) {
			charPos[0] = 35;
		} else {
			charPos[0] = 30;
		}
		charPos[1] = -10;
		charPos[2] = 1.2;
	}
	
	//to position the character
	charEL.style.transform = `translate(${charPos[0]}px, ${charPos[1]}px) scale(${charPos[2]})`;

	// this will make the thing wait till the image is fully loaded
	await charEL.decode().catch( () => {
		// if the image fails to load, we will use a placeholder
		/* for whatever reason, catch doesnt work properly on firefox */
		/* add an extra timeout before decode to fix */
		charEL.src = charPathBase + 'Random/P'+((pNum%2)+1)+'.png';
	});

	return charImg[pNum];

}
