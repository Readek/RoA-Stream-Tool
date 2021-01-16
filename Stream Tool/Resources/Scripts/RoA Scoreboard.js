//animation stuff
const pMove = 50; //distance to move for the player names (pixels)
const pCharMove = 20; //distance to move for the character icons

const fadeInTime = .3; //(seconds)
const fadeOutTime = .2;
let introDelay = .8; //all animations will get this delay when the html loads (use this so it times with your transition)

//the characters image file path will change depending if they're workshop or not
let charPath;
const charPathBase = "Resources/Characters/";
const charPathWork = "Resources/Characters/_Workshop/";

//color list will be stored here on startup
let colorList;

//to avoid the code constantly running the same method over and over
let p1CharacterPrev, p1SkinPrev, p1ScorePrev, p1ColorPrev, p1wlPrev;
let p2CharacterPrev, p2SkinPrev, p2ScorePrev, p2ColorPrev, p2wlPrev;
let bestOfPrev, workshopPrev, mainMenuPrev;

let startup = true;


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


	//first, things that will happen only the first time the html loads
	if (startup) {

		//of course, we have to start with the cool intro stuff
		if (scInfo['allowIntro']) {

			//lets see that intro
			document.getElementById('overlayIntro').style.opacity = 1;

			//this vid is just the bars moving (todo: maybe do it through javascript?)
			setTimeout(() => { 
				const introVid = document.getElementById('introVid');
				introVid.setAttribute('src', 'Resources/Overlay/Scoreboard/Intro.webm');
				introVid.play();
			}, 0); //if you need it to start later, change that 0 (and also update the introDelay)

			if (score[1] + score[2] == 0) { //if this is the first game, introduce players

				const p1IntroEL = document.getElementById('p1Intro');
				const p2IntroEL = document.getElementById('p2Intro');

				//update players intro text
				if (gamemode == 1) {
					p1IntroEL.textContent = player[1].name;
					p2IntroEL.textContent = player[2].name;
				} else {
					p1IntroEL.textContent = teamName[1];
					p2IntroEL.textContent = teamName[2];
				}
				p1IntroEL.style.fontSize = '85px'; //resize the font to its max size
				resizeText(p1IntroEL); //resize the text if its too large
				p2IntroEL.style.fontSize = '85px';
				resizeText(p2IntroEL);

				//initialize the colors list
				//(text shadows is the only place where actual hex codes are used, this may change in future releases)
				colorList = await getColorInfo();
				//change the color of the player text shadows
				p1IntroEL.style.textShadow = '0px 0px 20px ' + getHexColor(color[1]);
				p2IntroEL.style.textShadow = '0px 0px 20px ' + getHexColor(color[2]);

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
				if ((score[1] + score[2]) != 4) { //if its not the last game of a bo5

					//just show the game count in the intro
					midTextEL.textContent = "Game " + (score[1] + score[2] + 1);

				} else { //if game 5

					if ((round.toUpperCase() == "True Finals".toUpperCase())) { //if true finals

						midTextEL.textContent = "True Final Game"; //i mean shit gets serious here
						
					} else {

						midTextEL.textContent = "Final Game";
						
						//if GF, we dont know if its the last game or not, right?
						if (round.toLocaleUpperCase() == "Grand Finals".toLocaleUpperCase() && !(wl[1] == "L" && wl[2] == "L")) {
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
		
		//now lets start with player 1 first, update player name and team name texts
		updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', player[1].name, player[1].tag);
		//sets the starting position for the player text, then fades in and moves the p1 text to the next keyframe
		gsap.fromTo("#p1Wrapper", 
			{x: -pMove}, //from
			{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); //to

		//set the character image for the player
		await updateChar(player[1].character, player[1].skin, 'p1Character', mainMenu);
		//when the image finishes loading, fade-in-move the character icon to the overlay
		initCharaFade("#p1Character");
		//save the character/skin so we run the character change code only when this doesnt equal to the next
		p1CharacterPrev = player[1].character;
		p1SkinPrev = player[1].skin;

		//if its grands, we need to show the [W] and/or the [L] on the players
		updateWL(wl[1], "1");
		gsap.fromTo("#wlP1",
			{y: -pMove}, //set starting position some pixels up (it will be covered by the overlay)
			{delay: introDelay+.5, y: 0, ease: "power2.out", duration: .5}); //move down to its default position
		//save for later so the animation doesn't repeat over and over
		p1wlPrev = wl[1];

		//set the current score
		updateScore('p1Score', score[1], bestOf, "p1ScoreUp", color[1], false);
		p1ScorePrev = score[1];

		//set the color
		updateColor('p1Color', color[1]);
		p1ColorPrev = color[1];


		//took notes from player 1? well, this is exactly the same!
		updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', player[2].name, player[2].tag);
		gsap.fromTo("#p2Wrapper", 
			{x: pMove},
			{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});

		await updateChar(player[2].character, player[2].skin, 'p2Character', mainMenu);
		initCharaFade("#p2Character");
		p2CharacterPrev = player[2].character;
		p2SkinPrev = player[2].skin;

		updateWL(wl[2], "2");
		gsap.fromTo("#wlP2",
			{y: -pMove},
			{delay: introDelay+.5, y: 0, ease: "power2.out", duration: .5});
		p2wlPrev = wl[2];

		updateScore('p2Score', score[2], bestOf, "p2ScoreUp", color[2], false);
		p2ScorePrev = score[2];

		updateColor('p2Color', color[2]);
		p2ColorPrev = color[2];


		//update the round text
		updateRound(round);
		//fade it in
		gsap.to("#overlayRound", {delay: introDelay, opacity: 1, ease: "power2.out", duration: fadeInTime+.2});


		//check if the team has a logo we can place on the overlay
		updateTeamLogo("teamLogoP1", player[1].tag, "1");
		updateTeamLogo("teamLogoP2", player[2].tag, "2");


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


		//player 1 time!
		if (document.getElementById('p1Name').textContent != player[1].name ||
			document.getElementById('p1Team').textContent != player[1].tag) {
			//move and fade out the player 1's text
			fadeOutMove("#p1Wrapper", -pMove, () => {
				//now that nobody is seeing it, quick, change the text's content!
				updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', player[1].name, player[1].tag);
				//fade the name back in with a sick movement
				fadeInMove("#p1Wrapper");
			});
		}

		//player 1's character icon change
		if (p1CharacterPrev != player[1].character || p1SkinPrev != player[1].skin || mainMenuPrev != mainMenu) {
			//fade out the image while also moving it because that always looks cool
			fadeOutMove("#p1Character", -pCharMove, async () => {
				//now that nobody can see it, lets change the image!
				const charScale = await updateChar(player[1].character, player[1].skin, 'p1Character', mainMenu); //will return scale
				//and now, fade it in
				fadeInChara("#p1Character", charScale);
			});
			p1CharacterPrev = player[1].character;
			p1SkinPrev = player[1].skin;
		}

		//the [W] and [L] status for grand finals
		if (p1wlPrev != wl[1]) {
			//move it away!
			gsap.to("#wlP1", {y: -pMove, ease: "power1.in", duration: .5, onComplete: pwlMoved});
			function pwlMoved() {
				//change the thing!
				updateWL(wl[1], "1");
				//move it back!
				gsap.to("#wlP1", {delay: .1, y: 0, ease: "power2.out", duration: .5});
			}
			p1wlPrev = wl[1];
		}

		//score check
		if (p1ScorePrev != score[1]) {
			updateScore('p1Score', score[1], bestOf, "p1ScoreUp", color[1], true);
			p1ScorePrev = score[1];
		}

		//change the player background colors
		if (p1ColorPrev != color[1]) {
			fadeOut('#p1Color', () => {
				updateColor('p1Color', color[1]);
				fadeIn('#p1Color');
			})
			p1ColorPrev = color[1];
		}

		//check if the team has a logo we can place on the overlay
		if (document.getElementById('p1Team').textContent != player[1].tag) {
			fadeOut("#teamLogoP1", () => {
				updateTeamLogo("teamLogoP1", player[1].tag, "1");
				fadeIn("#teamLogoP1");
			});
		}


		//did you pay attention earlier? Well, this is the same as player 1!
		if (document.getElementById('p2Name').textContent != player[2].name ||
			document.getElementById('p2Team').textContent != player[2].tag){
			fadeOutMove("#p2Wrapper", pMove, () => {
				updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', player[2].name, player[2].tag);
				fadeInMove("#p2Wrapper");
			});
		}

		if (p2CharacterPrev != player[2].character || p2SkinPrev != player[2].skin || mainMenuPrev != mainMenu) {
			fadeOutMove("#p2Character", -pCharMove, async () => {
				const charScale = await updateChar(player[2].character, player[2].skin, 'p2Character', mainMenu); //will return scale
				fadeInChara("#p2Character", charScale);
			});
			p2CharacterPrev = player[2].character;
			p2SkinPrev = player[2].skin;
		}

		if (p2wlPrev != wl[2]) {
			gsap.to("#wlP2", {y: -pMove, ease: "power1.in", duration: .5, onComplete: pwlMoved});
			function pwlMoved() {
				updateWL(wl[2], "2");
				gsap.to("#wlP2", {delay: .1, y: 0, ease: "power2.out", duration: .5});
			}
			p2wlPrev = wl[2];
		}

		if (p2ScorePrev != score[2]) {
			updateScore('p2Score', score[2], bestOf, "p2ScoreUp", color[2], true);
			p2ScorePrev = score[2];
		}

		if (p2ColorPrev != color[2]) {
			fadeOut('#p2Color', () => {
				updateColor('p2Color', color[2]);
				fadeIn('#p2Color');
			})
			p2ColorPrev = color[2];
		}

		if (document.getElementById('p2Team').textContent != player[2].tag) {
			fadeOut("#teamLogoP2", () => {
				updateTeamLogo("teamLogoP2", player[2].tag, "2");
				fadeIn("#teamLogoP2");
			});
		}


		//we place this one here so both characters can be updated in one go
		mainMenuPrev = mainMenu;


		//change border depending of the Best Of status
		if (bestOfPrev != bestOf) {
			updateBorder(bestOf); //update the border
			//update the score ticks so they fit the bestOf border
			updateScore('p1Score', score[1], bestOf, "p1ScoreUp", color[1], false);
			updateScore('p2Score', score[2], bestOf, "p2ScoreUp", color[2], false);
		}

		
		//and finally, update the round text
		if (document.getElementById('round').textContent != round){
			fadeOut("#round", () => {
				updateRound(round);
				fadeIn("#round");
			});
		}
	}
}


//did an image fail to load? this will be used to show nothing
function showNothing(itemEL) {
	itemEL.setAttribute('src', 'Resources/Literally Nothing.png');
}

//score change
function updateScore(scoreID, pScore, bestOf, scoreUpID, pColor, playAnim) {
	let delay = 0;
	if (playAnim) { //do we want to play the score up animation?
		//depending on the "bestOf" and the color, change the clip
		const scoreUpEL = document.getElementById(scoreUpID);
		scoreUpEL.setAttribute('src', 'Resources/Overlay/Scoreboard/Score/ScoreUp ' + bestOf + '/' + pColor + '.webm');
		scoreUpEL.play();
		delay = 200; //add a bit of delay so the score change fits with the vid
	}
	const scoreEL = document.getElementById(scoreID);
	//set timeout to the actual image change so it fits with the animation (if it played)
	setTimeout(() => {
		//change the image depending on the bestOf status and, of course, the current score
		scoreEL.setAttribute('src', 'Resources/Overlay/Scoreboard/Score/Win Tick ' + bestOf + ' ' + pScore + '.png')
	}, delay);
	//nothing will show if the score is set to 3 which is intended
	if (startup) {scoreEL.addEventListener("error", () => {showNothing(scoreEL)})}
}

function updateColor(colorID, pColor) {
	const colorEL = document.getElementById(colorID);
	colorEL.setAttribute('src', 'Resources/Overlay/Scoreboard/Colors/' + pColor + '.png');
	if (startup) {colorEL.addEventListener("error", () => {showNothing(colorEL)})}
}

function updateBorder(bestOf) {
	document.getElementById('borderP1').setAttribute('src', 'Resources/Overlay/Scoreboard/Border ' + bestOf + '.png');
	document.getElementById('borderP2').setAttribute('src', 'Resources/Overlay/Scoreboard/Border ' + bestOf + '.png');
	bestOfPrev = bestOf
}

//team logo change
function updateTeamLogo(logoID, pTeam, playerNum) {
	//search for an image with the team name
	const logoEL = document.getElementById(logoID);
	logoEL.setAttribute('src', 'Resources/TeamLogos/' + pTeam + ' P' + playerNum + '.png');
	//no image? show nothing
	if (startup) {logoEL.addEventListener("error", () => {showNothing(logoEL)})}
}

//player text change
function updatePlayerName(wrapperID, nameID, teamID, pName, pTeam) {
	const nameEL = document.getElementById(nameID);
	nameEL.style.fontSize = '30px'; //set original text size
	nameEL.textContent = pName; //change the actual text
	const teamEL = document.getElementById(teamID);
	teamEL.style.fontSize = '20px';
	teamEL.textContent = pTeam;
	resizeText(document.getElementById(wrapperID)); //resize if it overflows
}

//round change
function updateRound(round) {
	const roundEL = document.getElementById('round');
	roundEL.style.fontSize = '19px'; //set original text size
	roundEL.textContent = round; //change the actual text
	resizeText(roundEL); //resize it if it overflows
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
function fadeIn(itemID) {
	gsap.to(itemID, {delay: .2, opacity: 1, duration: fadeInTime});
}

//fade in but with movement
function fadeInMove(itemID) {
	gsap.to(itemID, {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
}

//fade in but for the character image
function fadeInChara(itemID, charScale) {
	gsap.fromTo(itemID,
		{scale: charScale}, //set scale keyframe so it doesnt scale while transitioning
		{delay: .2, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}
	);
}

//fade in for the characters when first loading
function initCharaFade(charaID) {
	gsap.fromTo(charaID,
		{x: -pCharMove},
		{delay: introDelay+.25, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
}

//check if winning or losing in a GF, then change image
function updateWL(pWL, playerNum) {
	const pWLEL = document.getElementById('wlP' + playerNum);
	if (pWL == "W") {
		pWLEL.setAttribute('src', 'Resources/Overlay/Scoreboard/Winners P' + playerNum + '.png')
	} else if (pWL == "L") {
		pWLEL.setAttribute('src', 'Resources/Overlay/Scoreboard/Losers P' + playerNum + '.png')
	} else if (pWL == "Nada") {
		pWLEL.setAttribute('src', 'Resources/Literally nothing.png')
	}

	if (startup) {pWLEL.addEventListener("error", () => {showNothing(pWLEL)})}
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
async function updateChar(pCharacter, pSkin, charID, mainMenu) {

	//store so code looks cleaner later
	const charEL = document.getElementById(charID);

	//if the image fails to load, we will put a placeholder
	if (startup) {charEL.addEventListener("error", () => {
		//simple check to see if we are updating P1 or P2
		const pNum = charEL == document.getElementById("p1Character") ? 1 : 2;

		charEL.setAttribute('src', 'Resources/Characters/Random/P'+pNum+'.png');
	})}

	//change the image path depending on the character and skin
	charEL.setAttribute('src', charPath + pCharacter + '/' + pSkin + '.png');

	//get the character positions
	const charInfo = await getCharInfo(pCharacter);
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
			charEL.setAttribute('src', charPath + pCharacter + '/MainMenu/Default.png');
		} else { //if none of the above, use a default position
			charPos[0] = charInfo.scoreboard.neutral.x;
			charPos[1] = charInfo.scoreboard.neutral.y;
			charPos[2] = charInfo.scoreboard.neutral.scale;
		}
	} else { //if the character isnt on the database, set positions for the "?" image
		//this condition is used just to position images well on both sides
		if (charEL == document.getElementById("p1Character")) {
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

	return charPos[2]; //we need this one to set scale keyframe when fading back
}