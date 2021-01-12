//animation stuff
const pCharMove = 30; //distance to move for the character images

const fadeInTime = .4; //(seconds)
const fadeOutTime = .3;
const introDelay = .5; //all animations will get this delay when the html loads (use this so it times with your transition)

//max text sizes (used when resizing back)
const playerSize = '90px';
const teamSize = '50px';
const roundSize = '38px';
const tournamentSize = '28px';
const casterSize = '25px';
const twitterSize = '20px';

//to store the current character info
let p1CharInfo, p2CharInfo;

//the characters image file path will change depending if they're workshop or not
let charPath;
const charPathBase = "Resources/Characters/";
const charPathWork = "Resources/Characters/_Workshop/";

//to avoid the code constantly running the same method over and over
let p1CharacterPrev, p1SkinPrev, p1ColorPrev;
let p2CharacterPrev, p2SkinPrev, p2ColorPrev;
let prevWorkshop;


//variables for the twitter/twitch constant change
let socialInt1, socialInt2;
let twitter1, twitch1, twitter2, twitch2;
let socialSwitch = true; //true = twitter, false = twitch
const socialInterval = 7000;

let startup = true;


/* script begin */
async function mainLoop() {
	const scInfo = await getInfo();
	getData(scInfo);
}

mainLoop();
setInterval( () => { mainLoop() }, 500); //update interval

	
async function getData(scInfo) {

	const player = scInfo['player'];
	const teamName = scInfo['teamName'];

	const color = scInfo['color'];
	const score = scInfo['score'];

	const bestOf = scInfo['bestOf'];
	const gamemode = scInfo['gamemode'];

	const round = scInfo['round'];
	const tournamentName = scInfo['tournamentName'];

	const caster = scInfo['caster'];
	
	twitter1 = caster[1].twitter;
	twitch1 = caster[1].twitch;
	twitter2 = caster[2].twitter;
	twitch2 = caster[2].twitch;

	const workshop = scInfo['workshop'];

	//check if we are forcing HD skins
	if (scInfo['forceHD']) {
		if (player[1].skin.includes("LoA") && !scInfo['noLoAHD']) {
			player[1].skin = "LoA HD"
		} else {
			player[1].skin = "HD";
		}

		if (player[2].skin.includes("LoA") && !scInfo['noLoAHD']) {
			player[2].skin = "LoA HD"
		} else {
			player[2].skin = "HD";
		}
	}

	//first, things that will happen only the first time the html loads
	if (startup) {

		//first things first, set the current char path
		workshop ? charPath = charPathWork : charPath = charPathBase;
		//save the current workshop status so we know when it changes next time
		prevWorkshop = workshop;
		

		//let's set player 1's name
		updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', player[1].name, player[1].tag);
		//fade in the player text
		fadeIn("#p1Wrapper", introDelay+.15);

		//same for player 2
		updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', player[2].name, player[2].tag);
		fadeIn("#p2Wrapper", introDelay+.15);


		//set the character info for p1
		p1CharInfo = await getCharInfo(player[1].character);
		//set p1 character
		updateChar(player[1].character, player[1].skin, color[1], 'charP1', 'trailP1', p1CharInfo);
		//move the character
		initCharaFade("#charaP1", "#trailP1");
		//save character info so we change them later if different
		p1CharacterPrev = player[1].character;
		p1SkinPrev = player[1].skin;

		//same for p2
		p2CharInfo = await getCharInfo(player[2].character);
		updateChar(player[2].character, player[2].skin, color[2], 'charP2', 'trailP2', p2CharInfo);
		initCharaFade("#charaP2", "#trailP2");
		p2CharacterPrev = player[2].character;
		p2SkinPrev = player[2].skin;

		
		//set the character backgrounds
		updateBG('vidBGP1', player[1].character, player[1].skin, p1CharInfo);
		updateBG('vidBGP2', player[2].character, player[2].skin, p2CharInfo);


		//set the colors
		updateColor('colorBGP1', 'textBGP1', color[1]);
		updateColor('colorBGP2', 'textBGP2', color[2]);
		p1ColorPrev = color[1];
		p2ColorPrev = color[2];


		//set the round text
		updateText("round", round, roundSize);

		//set the tournament text
		updateText("tournament", tournamentName, tournamentSize);

		//set the caster info
		updateText("caster1", caster[1].name, casterSize);
		updateSocialText("twitter1", caster[1].twitter, twitterSize, "twitter1Wrapper");
		updateSocialText("twitch1", caster[1].twitch, twitterSize, "twitch1Wrapper");
		updateText("caster2", caster[2].name, casterSize);
		updateSocialText("twitter2", caster[2].twitter, twitterSize, "twitter2Wrapper");
		updateSocialText("twitch2", caster[2].twitch, twitterSize, "twitch2Wrapper");

		//setup twitter/twitch change
		socialChange1("twitter1Wrapper", "twitch1Wrapper");
		socialChange2("twitter2Wrapper", "twitch2Wrapper");
		//set an interval to keep changing the names
		socialInt1 = setInterval( () => {
			socialChange1("twitter1Wrapper", "twitch1Wrapper");
		}, socialInterval);
		socialInt2 = setInterval( () => {
			socialChange2("twitter2Wrapper", "twitch2Wrapper");
		}, socialInterval);

		//keep changing this boolean for the previous intervals ()
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
		if (p1ColorPrev != color[1]) {
			updateColor('colorBGP1', 'textBGP1', color[1]);
			colorTrail('trailP1', p1CharacterPrev, p1SkinPrev, color[1], p1CharInfo);
			p1ColorPrev = color[1];
		}

		if (p2ColorPrev != color[2]) {
			updateColor('colorBGP2', 'textBGP2', color[2]);
			colorTrail('trailP2', p2CharacterPrev, p2SkinPrev, color[2], p2CharInfo);
			p2ColorPrev = color[2];
		}


		//player 1 name change
		if (document.getElementById('p1Name').textContent != player[1].name ||
			document.getElementById('p1Team').textContent != player[1].tag) {
			//fade out player 1 text
			fadeOut("#p1Wrapper", () => {
				//now that nobody is seeing it, change the text content!
				updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', player[1].name, player[1].tag);
				//and fade the name back in
				fadeIn("#p1Wrapper", .2);
			});
		}

		//same for player 2
		if (document.getElementById('p2Name').textContent != player[2].name ||
			document.getElementById('p2Team').textContent != player[2].tag){
			fadeOut("#p2Wrapper", () => {
				updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', player[2].name, player[2].tag);
				fadeIn("#p2Wrapper", .2);
			});
		}


		//player 1 character, skin and background change
		if (p1CharacterPrev != player[1].character || p1SkinPrev != player[1].skin) {

			//if the character has changed, update the info
			if (p1CharacterPrev != player[1].character) {
				p1CharInfo = await getCharInfo(player[1].character);
			}

			//move and fade out the character
			charaFadeOut("#charaP1", () => {
				//update the character image and trail, and also storing its scale for later
				const charScale = updateChar(player[1].character, player[1].skin, color[1], 'charP1', 'trailP1', p1CharInfo);
				//move and fade them back
				charaFadeIn("#charaP1", "#trailP1", charScale);
			});

			//background change here!
			if (bgChangeLogic(player[1].skin, p1SkinPrev, player[1].character, p1CharacterPrev)) {
				//fade it out
				fadeOut("#vidBGP1", () => {
					//update the bg vid
					updateBG('vidBGP1', player[1].character, player[1].skin, p1CharInfo);
					//fade it back
					fadeIn("#vidBGP1", .3, fadeInTime+.2);
				}, fadeOutTime+.2);
			};
			
			p1CharacterPrev = player[1].character;
			p1SkinPrev = player[1].skin;
		}

		//same for player 2
		if (p2CharacterPrev != player[2].character || p2SkinPrev != player[2].skin) {

			if (p2CharacterPrev != player[2].character) {
				p2CharInfo = await getCharInfo(player[2].character);
			}

			charaFadeOut("#charaP2", () => {
				const charScale = updateChar(player[2].character, player[2].skin, color[2], 'charP2', 'trailP2', p2CharInfo);
				charaFadeIn("#charaP2", "#trailP2", charScale);
			});
			
			if (bgChangeLogic(player[2].skin, p2SkinPrev, player[2].character, p2CharacterPrev)) {
				fadeOut("#vidBGP2", () => {
					updateBG('vidBGP2', player[2].character, player[2].skin, p2CharInfo);
					fadeIn("#vidBGP2", .3, fadeInTime+.2);
				}, fadeOutTime+.2);
			};
		
			p2CharacterPrev = player[2].character;
			p2SkinPrev = player[2].skin;
		}


		//update round text
		if (document.getElementById('round').textContent != round){
			fadeOut("#round", () => {
				updateText("round", round, roundSize);
				fadeIn("#round", .2);
			});
		}

		//update tournament text
		if (document.getElementById('tournament').textContent != tournamentName){
			fadeOut("#tournament", () => {
				updateText("tournament", tournamentName, tournamentSize);
				fadeIn("#tournament", .2);
			});
		}


		//update caster 1 info
		if (document.getElementById('caster1').textContent != caster[1].name){
			fadeOut("#caster1", () => {
				updateText("caster1", caster[1].name, casterSize);
				fadeIn("#caster1", .2);
			});
		}
		//caster 1's twitter
		if (document.getElementById('twitter1').textContent != caster[1].twitter){
			updateSocial(caster[1].twitter, "twitter1", "twitter1Wrapper", caster[1].twitch, "twitch1Wrapper");
		}
		//caster 2's twitch (same as above)
		if (document.getElementById('twitch1').textContent != caster[1].twitch){
			updateSocial(caster[1].twitch, "twitch1", "twitch1Wrapper", caster[1].twitter, "twitter1Wrapper");
		}

		//caster 2, same as above
		if (document.getElementById('caster2').textContent != caster[2].name){
			fadeOut("#caster2", () => {
				updateText("caster2", caster[2].name, casterSize);
				fadeIn("#caster2", .2);
			});
		}
		if (document.getElementById('twitter2').textContent != caster[2].twitter){
			updateSocial(caster[2].twitter, "twitter2", "twitter2Wrapper", caster[2].twitch, "twitch2Wrapper");
		}

		if (document.getElementById('twitch2').textContent != caster[2].twitch){
			updateSocial(caster[2].twitch, "twitch2", "twitch2Wrapper", caster[2].twitter, "twitter2Wrapper");
		}
	}
}


//did an image fail to load? this will be used to show nothing
function showNothing(itemEL) {
	itemEL.setAttribute('src', 'Resources/Literally Nothing.png');
}


//color change
function updateColor(gradID, textBGID, color) {
	const gradEL = document.getElementById(gradID);
	//change the color gradient image path depending on the color
	gradEL.setAttribute('src', 'Resources/Overlay/VS Screen/Grad ' + color + '.png');
	//did that path not work? show absolutely nothing
	if (startup) {gradEL.addEventListener("error", () => {showNothing(gradEL)})}

	//same but with the text background
	const textBGEL = document.getElementById(textBGID);
	textBGEL.setAttribute('src', 'Resources/Overlay/VS Screen/Text BG ' + color + '.png');
	if (startup) {textBGEL.addEventListener("error", () => {showNothing(textBGEL)})}
}


//background change
function updateBG(vidID, pCharacter, pSkin, charInfo) {
	const vidEL = document.getElementById(vidID);

	if (startup) {
		//if the video cant be found, show aethereal gates
		vidEL.addEventListener("error", () => {
			vidEL.setAttribute('src', 'Resources/Backgrounds/Default.webm')
		});
	}

	//change the BG path depending on the character
	if (pSkin.includes("LoA")) {
		vidEL.setAttribute('src', 'Resources/Backgrounds/LoA.webm');
	} else if (pSkin == "Ragnir") { //ragnir shows the default stages in the actual game
		vidEL.setAttribute('src', 'Resources/Backgrounds/Default.webm');
	} else if (pCharacter == "Shovel Knight" && pSkin == "Golden") { //why not
		vidEL.setAttribute('src', 'Resources/Backgrounds/SK Golden.webm');
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
		vidEL.setAttribute('src', 'Resources/Backgrounds/' + vidName + '.webm');
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
function socialChange1(twitterWrapperID, twitchWrapperID) {

	const twitterWrapperEL = document.getElementById(twitterWrapperID);
	const twitchWrapperEL = document.getElementById(twitchWrapperID);

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
function socialChange2(twitterWrapperID, twitchWrapperID) {

	const twitterWrapperEL = document.getElementById(twitterWrapperID);
	const twitchWrapperEL = document.getElementById(twitchWrapperID);

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
	if (mainText == "twitch1" || mainText == "twitch2") {
		localSwitch = !localSwitch;
	}
	//check if this is their turn so we fade out the other one
	if (localSwitch) {
		fadeOut("#"+otherWrapper, () => {})
	}

	//now do the classics
	fadeOut("#"+mainWrapper, () => {
		updateSocialText(mainText, mainSocial, twitterSize, mainWrapper);
		//check if its twitter's turn to show up
		if (otherSocial == "" && mainSocial != "") {
			fadeIn("#"+mainWrapper, .2);
		} else if (localSwitch && mainSocial != "") {
			fadeIn("#"+mainWrapper, .2);
		} else if (otherSocial != "") {
			fadeIn("#"+otherWrapper, .2);
		}
	});
}


//player text change
function updatePlayerName(wrapperID, nameID, teamID, pName, pTeam) {
	const nameEL = document.getElementById(nameID);
	nameEL.style.fontSize = playerSize; //set original text size
	nameEL.textContent = pName; //change the actual text
	const teamEL = document.getElementById(teamID);
	teamEL.style.fontSize = teamSize;
	teamEL.textContent = pTeam;

	resizeText(document.getElementById(wrapperID)); //resize if it overflows
}

//generic text changer
function updateText(textID, textToType, maxSize) {
	const textEL = document.getElementById(textID);
	textEL.style.fontSize = maxSize; //set original text size
	textEL.textContent = textToType; //change the actual text
	resizeText(textEL); //resize it if it overflows
}
//social text changer
function updateSocialText(textID, textToType, maxSize, wrapper) {
	const textEL = document.getElementById(textID);
	textEL.style.fontSize = maxSize; //set original text size
	textEL.textContent = textToType; //change the actual text
	const wrapperEL = document.getElementById(wrapper)
	resizeText(wrapperEL); //resize it if it overflows
}

//text resize, keeps making the text smaller until it fits
function resizeText(textEL) {
	const childrens = textEL.children;
	while (textEL.scrollWidth > textEL.offsetWidth || textEL.scrollHeight > textEL.offsetHeight) {
		if (childrens.length > 0) { //for team+player texts
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
	gsap.to(charaID, {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime+.1});
	//move the trail
	gsap.fromTo(trailID,
		{scale: charScale, x: 0, opacity: 0},
		{delay: .5, x: -pCharMove, opacity: 1, ease: "power2.out", duration: fadeInTime+.1});
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
function updateChar(pCharacter, pSkin, color, charID, trailID, charInfo) {

	//store so code looks cleaner later
	const charEL = document.getElementById(charID);
	const trailEL = document.getElementById(trailID);

	//this will trigger whenever the image loaded cant be found
	if (startup) {
		//if the image fails to load, we will put a placeholder
		charEL.addEventListener("error", () => {

			//simple check to see if we are updating P1 or P2
			const pNum = charEL == document.getElementById("charP1") ? 1 : 2;

			charEL.setAttribute('src', charPathBase + 'Random/P'+pNum+'.png');
		})
		//trail will just show nothing
		trailEL.addEventListener("error", () => {showNothing(trailEL)})
	}

	//change the image path depending on the character and skin
	charEL.setAttribute('src', charPath + pCharacter + '/' + pSkin + '.png');

	//             x, y, scale
	let charPos = [0, 0, 1];
	//now, check if the character or skin exists in the json file we checked earler
	if (charInfo != "notFound") {
		if (charInfo.vsScreen[pSkin]) { //if the skin has a specific position
			charPos[0] = charInfo.vsScreen[pSkin].x;
			charPos[1] = charInfo.vsScreen[pSkin].y;
			charPos[2] = charInfo.vsScreen[pSkin].scale;
			trailEL.setAttribute('src', charPath + pCharacter + '/Trails/' + color + ' ' + pSkin + '.png');
		} else { //if not, use a default position
			charPos[0] = charInfo.vsScreen.neutral.x;
			charPos[1] = charInfo.vsScreen.neutral.y;
			charPos[2] = charInfo.vsScreen.neutral.scale;
			trailEL.setAttribute('src', charPath + pCharacter + '/Trails/' + color + '.png');
		}
	} else { //if the character isnt on the database, set positions for the "?" image
		//this condition is used just to position images well on both sides
		if (charEL == document.getElementById("charP1")) {
			charPos[0] = -475;
		} else {
			charPos[0] = -500;
		}
		charPos[1] = 0; charPos[2] = .8;
		trailEL.setAttribute('src', charPath + pCharacter + '/Trails/' + color + '.png');
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

	return charPos[2]; //we need this one to set scale keyframe when fading back
}

//this gets called just to change the color of a trail
function colorTrail(trailID, pCharacter, pSkin, color, charInfo) {
	const trailEL = document.getElementById(trailID);
	if (charInfo != "notFound") {
		if (charInfo.vsScreen[pSkin]) { //if the skin positions are not the default ones
			trailEL.setAttribute('src', charPath + pCharacter + '/Trails/' + color + ' ' + pSkin + '.png');
		} else {
			trailEL.setAttribute('src', charPath + pCharacter + '/Trails/' + color + '.png');
		}
	}
}
