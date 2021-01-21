//animation stuff
const pMove = 50; //distance to move for the player names (pixels)
const pCharMove = 20; //distance to move for the character icons

const fadeInTime = .3; //(seconds)
const fadeOutTime = .2;
let introDelay = .8; //all animations will get this delay when the html loads (use this so it times with your transition)

//max text sizes (used when resizing back)
const introSize = "85px";
const nameSize = "30px";
const tagSize = "20px";
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
let bestOfPrev, workshopPrev, mainMenuPrev;

//to consider how many loops will we do
const maxPlayers = 2; //will change when doubles comes
const maxSides = 2;

let startup = true;


//next, global variables for the html elements
const pWrapper = document.getElementsByClassName("wrappers");
const pTag = document.getElementsByClassName("tags");
const pName = document.getElementsByClassName("names");
const charImg = document.getElementsByClassName("pCharacter");
const colorImg = document.getElementsByClassName("colors");
const wlImg = document.getElementsByClassName("wlImg");
const scoreImg = document.getElementsByClassName("scoreImgs");
const scoreAnim = document.getElementsByClassName("scoreVid");
const tLogoImg = document.getElementsByClassName("tLogos");
const overlayRound = document.getElementById("overlayRound");
const textRound = document.getElementById('round');


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


	//first, things that will happen only once, when the html loads
	if (startup) {

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

				//initialize the colors list
				//(text shadows are the only place where actual hex codes are used, this may change in future releases)
				colorList = await getColorInfo();

				for (let i = 0; i < maxSides; i++) {
					const pIntroEL = document.getElementById('p'+(i+1)+'Intro');

					//update players intro text
					if (gamemode == 1) { //if singles, show player 1 and 2 names
						pIntroEL.textContent = player[i].name;
					} else { //if doubles
						if (teamName[i]) { //if theres a team name, show it
							pIntroEL.textContent = teamName[i];
						} else { //else, show "p1 & p3" / "p2 & p4"
							pIntroEL.textContent = player[i].name + " & " + player[i+2].name;
						}
					}

					pIntroEL.style.fontSize = introSize; //resize the font to its max size
					resizeText(pIntroEL); //resize the text if its too large

					//change the color of the player text shadows
					pIntroEL.style.textShadow = '0px 0px 20px ' + getHexColor(color[i]);
					
				};

				//player 1 name fade in
				gsap.fromTo("#p1Intro",
					{x: -pMove}, //from
					{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); //to

				//same for player 2
				gsap.fromTo("#p2Intro",
					{x: pMove},
					{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});

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
							gsap.to("#superCoolInterrogation", {delay: introDelay+.5, opacity: 1, ease: "power2.out", duration: 1.5});
						}

					}
				}
			}

			document.getElementById('roundIntro').textContent = round;
			document.getElementById('tNameIntro').textContent = scInfo['tournamentName'];
			
			//round, tournament and VS/GameX text fade in
			gsap.to(".textIntro", {delay: introDelay-.2, opacity: 1, ease: "power2.out", duration: fadeInTime});

			//aaaaand fade out everything
			gsap.to("#overlayIntro", {delay: introDelay+1.6, opacity: 0, ease: "power2.out", duration: fadeInTime+.2});

			//lets delay everything that comes after this so it shows after the intro
			introDelay = 2.6;
		}

		
		//finally out of the intro, first things first, set the current char path
		workshop ? charPath = charPathWork : charPath = charPathBase;
		//save the current workshop status so we know when it changes next time
		workshopPrev = workshop;


		//this is on top of everything else because the await would desync the rest
		for (let i = 0; i < maxPlayers; i++) { //for each available player
			//gets us the character positions for the player
			pCharInfo[i] = await getCharInfo(player[i].character);
		}


		// now for the actual initialization of players
		for (let i = 0; i < maxPlayers; i++) {
			
			//lets start with the player names and tags
			updatePlayerName(i, player[i].name, player[i].tag);
			//set the starting position for the player text, then fade in and move the text to the next keyframe
			if (i % 2 == 0) { //check side so we know the direction
				gsap.fromTo(pWrapper[i], 
					{x: -pMove}, //from
					{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); //to
			} else {
				gsap.fromTo(pWrapper[i], 
					{x: pMove},
					{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
			}

			//set the character image for the player
			updateChar(player[i].character, player[i].skin, i, pCharInfo[i], mainMenu, startup);
			//when the image finishes loading, it will fade in (coded in updateChar())

			//save the character/skin so we run the character change code only when this doesnt equal to the next
			pCharPrev[i] = player[i].character;
			pSkinPrev[i] = player[i].skin;

		}

		// this will run for each side (so twice)
		for (let i = 0; i < maxSides; i++) {
			
			//if its grands, we need to show the [W] and/or the [L] on the players
			updateWL(wl[i], i);
			gsap.fromTo(wlImg[i],
				{y: -pMove}, //set starting position some pixels up (it will be covered by the overlay)
				{delay: introDelay+.5, y: 0, ease: "power2.out", duration: .5}); //move down to its default position
			//save for later so the animation doesn't repeat over and over
			wlPrev[i] = wl[i];

			//set the current score
			updateScore(score[i], bestOf, color[i], i, false);
			scorePrev[i] = score[i];

			//set the color
			updateColor(colorImg[i], color[i]);
			colorPrev[i] = color[i];

			//check if the tag has a logo we can place on the overlay
			//this will only check the first 2 players
			updateTagLogo(tLogoImg[i], player[i].tag, (i+1));
			
		}


		//update the round text	and fade it in
		updateRound(round);
		fadeIn(overlayRound, introDelay);


		//dont forget to update the border if its Bo3 or Bo5!
		updateBorder(bestOf);


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


		//get the character lists now before we do anything else
		for (let i = 0; i < maxPlayers; i++) {
			//if the character has changed, update the info
			if (pCharPrev[i] != player[i].character) {
				pCharInfo[i] = await getCharInfo(player[i].character);
			}
		}


		//lets check each player
		for (let i = 0; i < maxPlayers; i++) {
			
			//player names and tags
			if (pName[i].textContent != player[i].name || pTag[i].textContent != player[i].tag) {

				//check the player's side so we know the direction of the movement
				const movement = i % 2 == 0 ? -pMove : pMove;

				//move and fade out the player 1's text
				fadeOutMove(pWrapper[i], movement, () => {
					//now that nobody is seeing it, quick, change the text's content!
					updatePlayerName(i, player[i].name, player[i].tag);
					//fade the name back in with a sick movement
					fadeInMove(pWrapper[i]);
				});
			}

			//player characters and skins
			if (pCharPrev[i] != player[i].character || pSkinPrev[i] != player[i].skin || mainMenuPrev != mainMenu) {

				//fade out the image while also moving it because that always looks cool
				fadeOutMove(charImg[i], -pCharMove, () => {
					//now that nobody can see it, lets change the image!
					updateChar(player[i].character, player[i].skin, i, pCharInfo[i], mainMenu);
					//will fade in when image finishes loading
				});
				pCharPrev[i] = player[i].character;
				pSkinPrev[i] = player[i].skin;
			}
		}


		//now let's check stuff from each side
		for (let i = 0; i < maxSides; i++) {
			
			//the [W] and [L] status for grand finals
			if (wlPrev[i] != wl[i]) {
				//move it away!
				gsap.to(wlImg[i], {y: -pMove, ease: "power1.in", duration: .5, onComplete: () => {
					//change the thing!
					updateWL(wl[i], i);
					//move it back!
					gsap.to(wlImg[i], {delay: .1, y: 0, ease: "power2.out", duration: .5});
				}});
				wlPrev[i] = wl[i];
			}

			//score check
			if (scorePrev[i] != score[i]) {
				updateScore(score[i], bestOf, color[i], i, true); //if true, animation will play
				scorePrev[i] = score[i];
			}

			//change the player background colors
			if (colorPrev[i] != color[i]) {
				fadeOut(colorImg[i], () => {
					updateColor(colorImg[i], color[i]);
					fadeIn(colorImg[i]);
				})
				colorPrev[i] = color[i];
			}

			//check if the tag has a logo we can place on the overlay
			if (pTag[i].textContent != player[i].tag) {
				fadeOut(tLogoImg[i], () => {
					updateTagLogo(tLogoImg[i], player[i].tag, (i+1));
					fadeIn(tLogoImg[i]);
				});
			}

		}


		//we place this one here so both characters can be updated in one go
		mainMenuPrev = mainMenu;


		//change border depending of the Best Of status
		if (bestOfPrev != bestOf) {
			updateBorder(bestOf); //update the border
			//update the score ticks so they fit the bestOf border
			updateScore(score[0], bestOf, color[0], 0, false);
			updateScore(score[1], bestOf, color[1], 1, false);
		}

		
		//and finally, update the round text
		if (textRound.textContent != round){
			fadeOut(textRound, () => {
				updateRound(round);
				fadeIn(textRound);
			});
		}

	}
}


// update functions
function updateScore(pScore, bestOf, pColor, pNum, playAnim) {

	let delay = 0;
	if (playAnim) { //do we want to play the score up animation?
		//depending on the "bestOf" and the color, change the clip
		scoreAnim[pNum].src = 'Resources/Overlay/Scoreboard/Score/ScoreUp ' + bestOf + '/' + pColor + '.webm';
		scoreAnim[pNum].play();
		delay = 200; //add a bit of delay so the score change fits with the vid
	}

	//set timeout to the actual image change so it fits with the animation (if it played)
	setTimeout(() => {
		//change the image depending on the bestOf status and, of course, the current score
		scoreImg[pNum].src = 'Resources/Overlay/Scoreboard/Score/Win Tick ' + bestOf + ' ' + pScore + '.png';
	}, delay);

}

function updateColor(colorEL, pColor) {
	colorEL.src = 'Resources/Overlay/Scoreboard/Colors/' + pColor + '.png';
}

function updateBorder(bestOf) {
	document.getElementById('borderP1').src = 'Resources/Overlay/Scoreboard/Border ' + bestOf + '.png';
	document.getElementById('borderP2').src = 'Resources/Overlay/Scoreboard/Border ' + bestOf + '.png';
	bestOfPrev = bestOf
}

function updateTagLogo(logoEL, pTag, pNum) {
	//search for an image with the tag name
	logoEL.src = 'Resources/TagLogos/' + pTag + ' P' + pNum + '.png';
}

function updatePlayerName(pNum, name, tag) {
	pName[pNum].style.fontSize = nameSize; //set original text size
	pName[pNum].textContent = name; //change the actual text
	pTag[pNum].style.fontSize = tagSize;
	pTag[pNum].textContent = tag;
	resizeText(pWrapper[pNum]); //resize if it overflows
}

function updateRound(round) {
	textRound.style.fontSize = roundSize; //set original text size
	textRound.textContent = round; //change the actual text
	resizeText(textRound); //resize it if it overflows
}

function updateWL(pWL, pNum) {
	//check if winning or losing in a GF, then change image
	if (pWL == "W") {
		wlImg[pNum].src = 'Resources/Overlay/Scoreboard/Winners P' + (pNum+1) + '.png';
	} else if (pWL == "L") {
		wlImg[pNum].src = 'Resources/Overlay/Scoreboard/Losers P' + (pNum+1) + '.png';
	} else if (pWL == "Nada") {
		wlImg[pNum].src = 'Literally nothing.png';
	}
}


//fade out
function fadeOut(itemID, funct) {
	gsap.to(itemID, {opacity: 0, duration: fadeOutTime, onComplete: funct});
}

//fade out but with movement
function fadeOutMove(itemID, move, funct) {
	gsap.to(itemID, {x: move, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: funct});
}

//fade in
function fadeIn(itemID, delayTime = .2) {
	gsap.to(itemID, {delay: delayTime, opacity: 1, duration: fadeInTime});
}

//fade in but with movement
function fadeInMove(itemID) {
	gsap.to(itemID, {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
}

//fade in but for the character image
function fadeInChara(charaEL, charScale, startup) {
	if (startup) {
		gsap.fromTo(charaEL,
			{x: -pCharMove},
			{delay: introDelay+.20, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
	} else {
		gsap.fromTo(charaEL,
			{scale: charScale}, //set scale keyframe so it doesnt scale while transitioning
			{delay: .2, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}
		);
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
		oReq.onerror = () => {resolve("notFound")}; //for obs local file browser sources
		oReq.open("GET", charPath + pCharacter + '/_Info.json');
		oReq.send();

		function reqListener () {
			try {resolve(JSON.parse(oReq.responseText))}
			catch {resolve("notFound")} //for live servers
		}
	})
}

//now the complicated "change character image" function!
async function updateChar(pCharacter, pSkin, pNum, charInfo, mainMenu, startup = false) {

	//store so code looks cleaner
	const charEL = charImg[pNum];

	//change the image path depending on the character and skin
	charEL.src = charPath + pCharacter + '/' + pSkin + '.png';

	//             x, y, scale
	let charPos = [0, 0, 1];
	//now, check if the character and skin exist in the database down there
	if (charInfo != "notFound") {
		if (charInfo.scoreboard[pSkin]) { //if the skin has a specific position
			charPos[0] = charInfo.scoreboard[pSkin].x;
			charPos[1] = charInfo.scoreboard[pSkin].y;
			charPos[2] = charInfo.scoreboard[pSkin].scale;
		} else if (mainMenu && charInfo.scoreboard.mainMenu) { //for the main menu renders, or some extras for workshop characters
			charPos[0] = charInfo.scoreboard.mainMenu.x;
			charPos[1] = charInfo.scoreboard.mainMenu.y;
			charPos[2] = charInfo.scoreboard.mainMenu.scale;
			//((main menu renders set to default till all skin pngs are done))
			charEL.src = charPath + pCharacter + '/MainMenu/Default.png';
		} else { //if none of the above, use a default position
			charPos[0] = charInfo.scoreboard.neutral.x;
			charPos[1] = charInfo.scoreboard.neutral.y;
			charPos[2] = charInfo.scoreboard.neutral.scale;
		}
	} else { //if the character isnt on the database, set positions for the "?" image
		//this condition is used just to position images well on both sides
		if (pNum % 2 == 0) {
			charPos[0] = 29;
		} else {
			charPos[0] = 15;
		}
		charPos[1] = -14;
		charPos[2] = 1.5;
	}
	
	//to position the character
	charEL.style.left = charPos[0] + "px";
	charEL.style.top = charPos[1] + "px";
	charEL.style.transform = "scale(" + charPos[2] + ")";


	//this will make the thing wait till the image is fully loaded
	charEL.decode().then(
		//when the image loads, fade it in
		fadeInChara(charImg[pNum], charPos[2], startup)
	).catch( () => {
		//if the image fails to load, we will use a placeholder
		charEL.src = charPathBase + 'Random/P'+((pNum%2)+1)+'.png';
		fadeInChara(charImg[pNum], charPos[2], startup);
	})

}
