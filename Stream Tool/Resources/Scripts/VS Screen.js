//animation stuff
const pCharMove = 30; //distance to move for the character images

const fadeInTime = .4; //(seconds)
const fadeOutTime = .3;
const introDelay = .5; //all animations will get this delay when the html loads (use this so it times with your transition)

//max text sizes (used when resizing back)
const playerSize = '90px';
const tagSize = '50px';
const roundSize = '38px';
const tournamentSize = '28px';
const casterSize = '25px';
const twitterSize = '20px';

//to store the current character info
const pCharInfo = [];

//the characters image file path will change depending if they're workshop or not
let charPath;
const charPathBase = "Resources/Characters/";
const charPathWork = "Resources/Characters/_Workshop/";

//to avoid the code constantly running the same method over and over
const pCharPrev = [], pSkinPrev = [], colorPrev = [];
let prevWorkshop;

//variables for the twitter/twitch constant change
let socialInt1, socialInt2;
let twitter1, twitch1, twitter2, twitch2;
let socialSwitch = true; //true = twitter, false = twitch
const socialInterval = 7000;

//to consider how many loops will we do
const maxPlayers = 2; //will change when doubles comes
const maxSides = 2;

let startup = true;


//next, global variables for the html elements
const pWrapper = document.getElementsByClassName("wrappers");
const pTag = document.getElementsByClassName("tag");
const pName = document.getElementsByClassName("name");
const pChara = document.getElementsByClassName("chara");
const pChar = document.getElementsByClassName("char");
const pTrail = document.getElementsByClassName("trail");
const pBG = document.getElementsByClassName("bgVid");
const colorBG = document.getElementsByClassName("colorBG");
const textBG = document.getElementsByClassName("textBG");
const roundEL = document.getElementById("round");
const tournamentEL = document.getElementById("tournament");
const casterEL = document.getElementsByClassName("caster");
const twitterEL = document.getElementsByClassName("twitter");
const twitterWrEL = document.getElementsByClassName("twitterWrapper");
const twitchEL = document.getElementsByClassName("twitch");
const twitchWrEL = document.getElementsByClassName("twitchWrapper");


/* script begin */
async function mainLoop() {
	const scInfo = await getInfo();
	getData(scInfo);
}

mainLoop();
setInterval( () => { mainLoop() }, 500); //update interval

	
async function getData(scInfo) {

	const player = scInfo['player'];
	//const teamName = scInfo['teamName'];

	const color = scInfo['color'];
	//const score = scInfo['score'];

	//const bestOf = scInfo['bestOf'];
	//const gamemode = scInfo['gamemode'];

	const round = scInfo['round'];
	const tournamentName = scInfo['tournamentName'];

	const caster = scInfo['caster'];
	
	twitter1 = caster[0].twitter;
	twitch1 = caster[0].twitch;
	twitter2 = caster[1].twitter;
	twitch2 = caster[1].twitch;

	const workshop = scInfo['workshop'];

	//check if we are forcing HD skins
	if (scInfo['forceHD']) {
		for (let i = 0; i < maxPlayers; i++) {
			
			//check if we dont want to show the LoA renders
			if (player[i].skin.includes("LoA") && !scInfo['noLoAHD']) {
				player[i].skin = "LoA HD";
			} else {
				player[i].skin = "HD";
			}
			
		}
	}

	//first, things that will happen only the first time the html loads
	if (startup) {

		//first things first, set the current char path
		workshop ? charPath = charPathWork : charPath = charPathBase;
		//save the current workshop status so we know when it changes next time
		prevWorkshop = workshop;
		

		//this is on top of everything else because the await would desync the rest
		for (let i = 0; i < maxPlayers; i++) { //for each available player
			//gets us the character positions for the player
			pCharInfo[i] = await getCharInfo(player[i].character);
		}


		// now the real part begins
		for (let i = 0; i < maxPlayers; i++) {

			//lets start simple with the player names & tags 
			updatePlayerName(i, player[i].name, player[i].tag);

			//fade in the player text
			fadeIn(pWrapper[i], introDelay+.15);


			//change the player's character image, and position it
			updateChar(player[i].character, player[i].skin, color[i], i, pCharInfo[i], startup)
			//character will fade in when the image finishes loading

			//save character info so we change them later if different
			pCharPrev[i] = player[i].character;
			pSkinPrev[i] = player[i].skin;


			//set the character backgrounds
			updateBG(pBG[i], player[i].character, player[i].skin, pCharInfo[i]);	

		}


		// this will run for each side (so twice)
		for (let i = 0; i < maxSides; i++) {

			//set the colors
			updateColor(colorBG[i], textBG[i], color[i]);
			colorPrev[i] = color[i];

		}


		//set the round text
		updateText(roundEL, round, roundSize);
		//set the tournament text
		updateText(tournamentEL, tournamentName, tournamentSize);


		//set the caster info
		for (let i = 0; i < casterEL.length; i++) {
			updateText(casterEL[i], caster[i].name, casterSize);
			updateSocialText(twitterEL[i], caster[i].twitter, twitterSize, twitterWrEL[i]);
			updateSocialText(twitchEL[i], caster[i].twitch, twitterSize, twitchWrEL[i]);
		
			//setup twitter/twitch change
			socialChange1(twitterWrEL[i], twitchWrEL[i]);
		}

		//set an interval to keep changing the names
		socialInt1 = setInterval( () => {
			socialChange1(twitterWrEL[0], twitchWrEL[0]);
		}, socialInterval);
		socialInt2 = setInterval( () => {
			socialChange2(twitterWrEL[1], twitchWrEL[1]);
		}, socialInterval);

		//keep changing this boolean for the previous intervals
		setInterval(() => {
			if (socialSwitch) { //true = twitter, false = twitch
				socialSwitch = false;
			} else {
				socialSwitch = true;
			}
		}, socialInterval);


		startup = false; //next time we run this function, it will skip all we just did
	}

	//now things that will happen constantly
	else {

		//start by setting the correct char path
		if (prevWorkshop != workshop) {
			workshop ? charPath = charPathWork : charPath = charPathBase;
			prevWorkshop = workshop;
		}


		//color change, this is up here before char/skin change so it doesnt change the
		//trail to the next one if the character has changed, but it will change its color
		for (let i = 0; i < maxSides; i++) {
			if (colorPrev[i] != color[i]) {
				updateColor(colorBG[i], textBG[i], color[i]);
				colorTrail(pTrail[i], pCharPrev[i], pSkinPrev[i], color[i], pCharInfo[i]);
				colorPrev[i] = color[i];
			}
		}


		//get the character lists now before we do anything else
		for (let i = 0; i < maxPlayers; i++) {
			//if the character has changed, update the info
			if (pCharPrev[i] != player[i].character) {
				pCharInfo[i] = await getCharInfo(player[i].character);
			}
		}


		for (let i = 0; i < maxPlayers; i++) {

			// players name change, if either name or tag have changed
			if (pName[i].textContent != player[i].name || pTag[i].textContent != player[i].tag) {
				//fade out the player's text
				fadeOut(pWrappers[i], () => {
					//now that nobody is seeing it, change the content of the texts!
					updatePlayerName(i, player[i].name, player[i].tag);
					//and fade the texts back in
					fadeIn(pWrappers[i], .2);
				});
			}


			//player character, skin and background change
			if (pCharPrev[i] != player[i].character || pSkinPrev[i] != player[i].skin) {
				
				//move and fade out the character
				charaFadeOut(pChara[i], () => {
					//update the character image and trail, and also storing its scale for later
					updateChar(player[i].character, player[i].skin, color[i], i, pCharInfo[i]);
					//will fade back in when the images load
				});

				//background change here!
				if (bgChangeLogic(player[i].skin, pSkinPrev[i], player[i].character, pCharPrev[i])) {
					//fade it out
					fadeOut(pBG[i], () => {
						//update the bg vid
						updateBG(pBG[i], player[i].character, player[i].skin, pCharInfo[i]);
						//fade it back
						fadeIn(pBG[i], .3, fadeInTime+.2);
					}, fadeOutTime+.2);
				};
				
				pCharPrev[i] = player[i].character;
				pSkinPrev[i] = player[i].skin;

			}

		}
		

		//update round text
		if (roundEL.textContent != round){
			fadeOut(roundEL, () => {
				updateText(roundEL, round, roundSize);
				fadeIn(roundEL, .2);
			});
		}

		//update tournament text
		if (tournamentEL.textContent != tournamentName){
			fadeOut(tournamentEL, () => {
				updateText(tournamentEL, tournamentName, tournamentSize);
				fadeIn(tournamentEL, .2);
			});
		}


		//update caster info
		for (let i = 0; i < casterEL.length; i++) {
			
			//caster names
			if (casterEL[i].textContent != caster[i].name){
				fadeOut(casterEL[i], () => {
					updateText(casterEL[i], caster[i].name, casterSize);
					fadeIn(casterEL[i], .2);
				});
			}

			//caster twitters
			if (twitterEL[i].textContent != caster[i].twitter){
				updateSocial(caster[i].twitter, twitterEL[i], twitterWrEL[i], caster[i].twitch, twitchWrEL[i]);
			}

			//caster twitchers
			if (twitchEL[i].textContent != caster[i].twitch){
				updateSocial(caster[i].twitch, twitchEL[i], twitchWrEL[i], caster[i].twitter, twitterWrEL[i]);
			}

		}
	}
}



//color change
function updateColor(gradEL, textBGEL, color) {

	//change the color gradient image path depending on the color
	gradEL.src = 'Resources/Overlay/VS Screen/Grad ' + color + '.png';

	//same but with the text background
	textBGEL.src = 'Resources/Overlay/VS Screen/Text BG ' + color + '.png';
	
}


//background change
function updateBG(vidEL, pCharacter, pSkin, charInfo) {

	if (startup) {
		//if the video cant be found, show aethereal gates
		vidEL.addEventListener("error", () => {
			vidEL.src = 'Resources/Backgrounds/Default.webm'
		});
	}

	//change the BG path depending on the character
	if (pSkin.includes("LoA")) {
		vidEL.src = 'Resources/Backgrounds/LoA.webm';
	} else if (pSkin == "Ragnir") { //ragnir shows the default stages in the actual game
		vidEL.src = 'Resources/Backgrounds/Default.webm';
	} else if (pCharacter == "Shovel Knight" && pSkin == "Golden") { //why not
		vidEL.src = 'Resources/Backgrounds/SK Golden.webm';
	} else {
		let vidName;
		if (charInfo != "notFound") { //safety check
			if (charInfo.vsScreen["background"]) { //if the character has a specific BG
				vidName = charInfo.vsScreen["background"];
			} else { //if not, just use the character name
				vidName = pCharacter;
			}
		}
		//actual video path change
		vidEL.src = 'Resources/Backgrounds/' + vidName + '.webm';
	}
}
//it was too long to be in just one 'if'
function bgChangeLogic(pSkin, pSkinPrev, pChar, pCharPrev) {
	//change the background when
	if (pChar != pCharPrev) { //always when changing character
		return true;
	} else if (pSkin == "Ragnir" || pSkinPrev == "Ragnir") { //yes ragnir has a dif bg
		return true;
	} else if (pSkin.includes("LoA") || pSkinPrev.includes("LoA")) { //aether high!
		return true;
	} else if (pChar == "Shovel Knight" && (pSkin == "Golden" || pSkinPrev == "Golden")) { //now we just flexing
		return true;
	}
}


//the logic behind the twitter/twitch constant change
function socialChange1(twitterWrapperEL, twitchWrapperEL) {

	if (startup) {

		//if first time, set initial opacities so we can read them later
		if (!twitter1 && !twitch1) { //if all blank
			twitterWrapperEL.style.opacity = 0;
			twitchWrapperEL.style.opacity = 0;
		} else if (!twitter1 && !!twitch1) { //if twitter blank
			twitterWrapperEL.style.opacity = 0;
			twitchWrapperEL.style.opacity = 1;
		} else {
			twitterWrapperEL.style.opacity = 1;
			twitchWrapperEL.style.opacity = 0;
		}
		

	} else if (!!twitter1 && !!twitch1) {

		if (socialSwitch) {
			fadeOut(twitterWrapperEL, () => {
				fadeIn(twitchWrapperEL, 0);
			});
		} else {
			fadeOut(twitchWrapperEL, () => {
				fadeIn(twitterWrapperEL, 0);
			});
		}

	}
}
//i didnt know how to make it a single function im sorry ;_;
function socialChange2(twitterWrapperEL, twitchWrapperEL) {

	if (startup) {

		if (!twitter2 && !twitch2) {
			twitterWrapperEL.style.opacity = 0;
			twitchWrapperEL.style.opacity = 0;
		} else if (!twitter2 && !!twitch2) {
			twitterWrapperEL.style.opacity = 0;
			twitchWrapperEL.style.opacity = 1;
		} else {
			twitterWrapperEL.style.opacity = 1;
			twitchWrapperEL.style.opacity = 0;
		}

	} else if (!!twitter2 && !!twitch2) {

		if (socialSwitch) {
			fadeOut(twitterWrapperEL, () => {
				fadeIn(twitchWrapperEL, 0);
			});
		} else {
			fadeOut(twitchWrapperEL, () => {
				fadeIn(twitterWrapperEL, 0);
			});
		}

	}
}
//function to decide when to change to what
function updateSocial(mainSocial, mainText, mainWrapper, otherSocial, otherWrapper) {
	//check if this is for twitch or twitter
	let localSwitch = socialSwitch;
	if (mainText == twitchEL[0] || mainText == twitchEL[1]) {
		localSwitch = !localSwitch;
	}
	//check if this is their turn so we fade out the other one
	if (localSwitch) {
		fadeOut(otherWrapper, () => {})
	}

	//now do the classics
	fadeOut(mainWrapper, () => {
		updateSocialText(mainText, mainSocial, twitterSize, mainWrapper);
		//check if its twitter's turn to show up
		if (otherSocial == "" && mainSocial != "") {
			fadeIn(mainWrapper, .2);
		} else if (localSwitch && mainSocial != "") {
			fadeIn(mainWrapper, .2);
		} else if (otherSocial != "") {
			fadeIn(otherWrapper, .2);
		}
	});
}


//player text change
function updatePlayerName(pNum, name, tag) {
	pName[pNum].style.fontSize = playerSize; //set original text size
	pName[pNum].textContent = name; //change the actual text
	pTag[pNum].style.fontSize = tagSize;
	pTag[pNum].textContent = tag;

	resizeText(pWrapper[pNum]); //resize if it overflows
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


//fade out
function fadeOut(itemID, funct = console.log("Hola!"), dur = fadeOutTime) {
	gsap.to(itemID, {opacity: 0, duration: dur, onComplete: funct});
}

//fade in
function fadeIn(itemID, timeDelay, dur = fadeInTime) {
	gsap.to(itemID, {delay: timeDelay, opacity: 1, duration: dur});
}

//fade out for the characters
function charaFadeOut(itemID, funct) {
	gsap.to(itemID, {delay: .2, x: -pCharMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: funct});
}

//fade in characters edition
function charaFadeIn(charaID, trailID, charScale) {
	//move the character
	gsap.to(charaID, {delay: .2, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime+.1});
	//move the trail
	gsap.fromTo(trailID,
		{scale: charScale, x: 0, opacity: 0},
		{delay: .4, x: -pCharMove, opacity: 1, ease: "power2.out", duration: fadeInTime+.1});
}

//initial characters fade in
function initCharaFade(charaID, trailID) {
	//character movement
	gsap.fromTo(charaID,
		{x: -pCharMove, opacity: 0},
		{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
	//trail movement
	gsap.to(trailID, {delay: introDelay+.15, x: -pCharMove, opacity: 1, ease: "power2.out", duration: fadeInTime+.1});
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


//character update!
function updateChar(pCharacter, pSkin, color, pNum, charInfo, startup = false) {

	//store so code looks cleaner later
	const charEL = pChar[pNum];
	const trailEL = pTrail[pNum];

	//change the image path depending on the character and skin
	charEL.src = charPath + pCharacter + '/' + pSkin + '.png';

	//             x, y, scale
	let charPos = [0, 0, 1];
	//now, check if the character or skin exists in the json file we checked earler
	if (charInfo != "notFound") {
		if (charInfo.vsScreen[pSkin]) { //if the skin has a specific position
			charPos[0] = charInfo.vsScreen[pSkin].x;
			charPos[1] = charInfo.vsScreen[pSkin].y;
			charPos[2] = charInfo.vsScreen[pSkin].scale;
			trailEL.src = charPath + pCharacter + '/Trails/' + color + ' ' + pSkin + '.png';
		} else { //if not, use a default position
			charPos[0] = charInfo.vsScreen.neutral.x;
			charPos[1] = charInfo.vsScreen.neutral.y;
			charPos[2] = charInfo.vsScreen.neutral.scale;
			trailEL.src = charPath + pCharacter + '/Trails/' + color + '.png';
		}
	} else { //if the character isnt on the database, set positions for the "?" image
		//this condition is used just to position images well on both sides
		if (charEL == document.getElementById("charP1")) {
			charPos[0] = -475;
		} else {
			charPos[0] = -500;
		}
		charPos[1] = 0; charPos[2] = .8;
		trailEL.src = charPath + pCharacter + '/Trails/' + color + '.png';
	}

	//to position the character
	charEL.style.left = charPos[0] + "px";
	charEL.style.top = charPos[1] + "px";
	charEL.style.transform = "scale(" + charPos[2] + ")";
	trailEL.style.left = charPos[0] + "px";
	trailEL.style.top = charPos[1] + "px";
	trailEL.style.transform = "scale(" + charPos[2] + ")";

	//to decide scalling
	if (pSkin.includes("HD")) {
		charEL.style.imageRendering = "auto"; //default scalling
		trailEL.style.imageRendering = "auto";
	} else {
		charEL.style.imageRendering = "pixelated"; //sharp scalling
		trailEL.style.imageRendering = "pixelated";
	}

	//this will make the thing wait till the images are fully loaded
	charEL.decode().then( () => {
		trailEL.decode().then( () => {
			//when both char and trail load, fade them in
			if (startup) {
				initCharaFade(pChara[pNum], trailEL);
			} else {
				charaFadeIn(pChara[pNum], trailEL, charPos[2]);
			}
		})
	}).catch( () => {
		//if the image fails to load, we will use a placeholder
		charEL.src = charPathBase + 'Random/P'+((pNum%2)+1)+'.png';
		if (startup) {
			initCharaFade(pChara[pNum], trailEL);
		} else {
			charaFadeIn(pChara[pNum], trailEL, charPos[2]);
		}
	})

}

//this gets called just to change the color of a trail
function colorTrail(trailEL, pCharacter, pSkin, color, charInfo) {
	if (charInfo != "notFound") {
		if (charInfo.vsScreen[pSkin]) { //if the skin positions are not the default ones
			trailEL.src = charPath + pCharacter + '/Trails/' + color + ' ' + pSkin + '.png';
		} else {
			trailEL.src = charPath + pCharacter + '/Trails/' + color + '.png';
		}
	}
}
