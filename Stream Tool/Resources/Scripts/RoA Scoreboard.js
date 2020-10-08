//animation stuff
const pMove = 50; //distance to move for the player names (pixels)
const pCharMove = 20; //distance to move for the character icons

const fadeInTime = .3; //(seconds)
const fadeOutTime = .2;
let introDelay = .8; //all animations will get this delay when the html loads (use this so it times with your transition)

//to avoid the code constantly running the same method over and over
let p1CharacterPrev, p1SkinPrev, p1ScorePrev, p1ColorPrev, p1wlPrev;
let p2CharacterPrev, p2SkinPrev, p2ScorePrev, p2ColorPrev, p2wlPrev;
let bestOfPrev;

let startup = true;

window.onload = init;

function init() {
	async function mainLoop() {
		const scInfo = await getInfo();
		getData(scInfo);
	}

	mainLoop();
	setInterval( () => { mainLoop(); }, 500); //update interval
}

async function getData(scInfo) {
	const p1Name = scInfo['p1Name'];
	const p1Team = scInfo['p1Team'];
	const p1Score = scInfo['p1Score'];
	const p1Color = scInfo['p1Color'];
	const p1Character = scInfo['p1Character'];
	const p1Skin = scInfo['p1Skin'];
	const p1WL = scInfo['p1WL'];
	
	const p2Name = scInfo['p2Name'];
	const p2Team = scInfo['p2Team'];
	const p2Score = scInfo['p2Score'];
	const p2Color = scInfo['p2Color'];
	const p2Character = scInfo['p2Character'];
	const p2Skin = scInfo['p2Skin'];
	const p2WL = scInfo['p2WL'];

	const round = scInfo['round'];
	const bestOf = scInfo['bestOf'];


	//first, things that will happen only the first time the html loads
	if (startup) {
		//of course, we have to start with the cool intro stuff
		if (scInfo['allowIntro']) {

			//lets see that intro
			document.getElementById('overlayIntro').style.opacity = 1;

			//this vid is just the bars moving (todo: maybe do it through javascript?)
			setTimeout(() => { 
				document.getElementById('introVid').setAttribute('src', 'Resources/Webms/Intro.webm');
				document.getElementById('introVid').play();
			}, 0); //if you need it to start later, change that 0 (and also update the introDelay)

			if (p1Score + p2Score == 0) { //if this is the first game, introduce players

				const p1IntroEL = document.getElementById('p1Intro');
				const p2IntroEL = document.getElementById('p2Intro');

				p1IntroEL.textContent = p1Name; //update player 1 intro text
				p1IntroEL.style.fontSize = '85px'; //resize the font to its max size
				resizeText(p1IntroEL); //resize the text if its too large
				p2IntroEL.style.fontSize = '85px';
				p2IntroEL.textContent = p2Name; //p2
				resizeText(p2IntroEL);

				//change the color of the player text shadows
				p1IntroEL.style.textShadow = '0px 0px 20px ' + getHexColor(p1Color);
				p2IntroEL.style.textShadow = '0px 0px 20px ' + getHexColor(p2Color);

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
				if ((p1Score + p2Score) != 4) { //if its not the last game of a bo5

					//just show the game count in the intro
					midTextEL.textContent = "Game " + (p1Score + p2Score + 1);

				} else { //if game 5

					if ((round.toUpperCase() == "True Finals".toUpperCase())) { //if true finals

						midTextEL.textContent = "True Final Game"; //i mean shit gets serious here
						
					} else {

						midTextEL.textContent = "Final Game";
						
						//if GF, we dont know if its the last game or not, right?
						if (round.toLocaleUpperCase() == "Grand Finals".toLocaleUpperCase() && !(p1WL == "L" && p2WL == "L")) {
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

		//finally out of the intro, now lets start with player 1 first
		//update player name and team name texts
		updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', p1Name, p1Team);
		//sets the starting position for the player text, then fades in and moves the p1 text to the next keyframe
		gsap.fromTo("#p1Wrapper", 
			{x: -pMove}, //from
			{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime}); //to

		//set the character image for the player
		await updateChar(p1Character, p1Skin, 'p1Character');
		//when the image finishes loading, fade-in-move the character icon to the overlay
		initCharaFade("#p1Character");
		//save the character/skin so we run the character change code only when this doesnt equal to the next
		p1CharacterPrev = p1Character;
		p1SkinPrev = p1Skin;

		//if its grands, we need to show the [W] and/or the [L] on the players
		updateWL(p1WL, "1");
		gsap.fromTo("#wlP1",
			{y: -pMove}, //set starting position some pixels up (it will be covered by the overlay)
			{delay: introDelay+.5, y: 0, ease: "power2.out", duration: .5}); //move down to its default position
		//save for later so the animation doesn't repeat over and over
		p1wlPrev = p1WL;

		//set the current score
		updateScore('p1Score', p1Score, bestOf, "p1ScoreUp", p1Color, false);
		p1ScorePrev = p1Score;

		//set the color
		updateColor('p1Color', p1Color);
		p1ColorPrev = p1Color;


		//took notes from player 1? well, this is exactly the same!
		updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', p2Name, p2Team);
		gsap.fromTo("#p2Wrapper", 
			{x: pMove},
			{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});

		await updateChar(p2Character, p2Skin, 'p2Character');
		initCharaFade("#p2Character");
		p2CharacterPrev = p2Character;
		p2SkinPrev = p2Skin;

		updateWL(p2WL, "2");
		gsap.fromTo("#wlP2",
			{y: -pMove},
			{delay: introDelay+.5, y: 0, ease: "power2.out", duration: .5});
		p2wlPrev = p2WL;

		updateScore('p2Score', p2Score, bestOf, "p2ScoreUp", p2Color, false);
		p2ScorePrev = p2Score;

		updateColor('p2Color', p2Color);
		p2ColorPrev = p2Color;


		//update the round text
		updateRound(round);
		//fade it in
		gsap.to("#overlayRound", {delay: introDelay, opacity: 1, ease: "power2.out", duration: fadeInTime+.2});


		//check if the team has a logo we can place on the overlay
		updateTeamLogo("teamLogoP1", p1Team, "1");
		updateTeamLogo("teamLogoP2", p2Team, "2");

		//dont forget to update the border if its Bo3 or Bo5!
		updateBorder(bestOf);

		startup = false; //next time we run this function, it will skip all we just did
	}

	//now things that will happen constantly
	else {

		//player 1 time!
		if (document.getElementById('p1Name').textContent != p1Name ||
			document.getElementById('p1Team').textContent != p1Team) {
			//move and fade out the player 1's text
			fadeOutMove("#p1Wrapper", -pMove, () => {
				//now that nobody is seeing it, quick, change the text's content!
				updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', p1Name, p1Team);
				//fade the name back in with a sick movement
				fadeInMove("#p1Wrapper");
			});
		}

		//player 1's character icon change
		if (p1CharacterPrev != p1Character || p1SkinPrev != p1Skin) {
			//fade out the image while also moving it because that always looks cool
			fadeOutMove("#p1Character", -pCharMove, async () => {
				//now that nobody can see it, lets change the image!
				const charScale = await updateChar(p1Character, p1Skin, 'p1Character'); //will return scale
				//and now, fade it in
				fadeInChara("#p1Character", charScale);
			});
			p1CharacterPrev = p1Character;
			p1SkinPrev = p1Skin;
		}

		//the [W] and [L] status for grand finals
		if (p1wlPrev != p1WL) {
			//move it away!
			gsap.to("#wlP1", {y: -pMove, ease: "power1.in", duration: .5, onComplete: pwlMoved});
			function pwlMoved() {
				//change the thing!
				updateWL(p1WL, "1");
				//move it back!
				gsap.to("#wlP1", {delay: .1, y: 0, ease: "power2.out", duration: .5});
			}
			p1wlPrev = p1WL;
		}

		//score check
		if (p1ScorePrev != p1Score) {
			updateScore('p1Score', p1Score, bestOf, "p1ScoreUp", p1Color, true);
			p1ScorePrev = p1Score;
		}

		//change the player background colors
		if (p1ColorPrev != p1Color) {
			fadeOut('#p1Color', () => {
				updateColor('p1Color', p1Color);
				fadeIn('#p1Color');
			})
			p1ColorPrev = p1Color;
		}

		document.getElementById('borderP2').setAttribute('src', 'Resources/Overlay/Border ' + bestOf + '.png');

		//check if the team has a logo we can place on the overlay
		if (document.getElementById('p1Team').textContent != p1Team) {
			fadeOut("#teamLogoP1", () => {
				updateTeamLogo("teamLogoP1", p1Team, "1");
				fadeIn("#teamLogoP1");
			});
		}


		//did you pay attention earlier? Well, this is the same as player 1!
		if (document.getElementById('p2Name').textContent != p2Name ||
			document.getElementById('p2Team').textContent != p2Team){
			fadeOutMove("#p2Wrapper", pMove, () => {
				updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', p2Name, p2Team);
				fadeInMove("#p2Wrapper");
			});
		}

		if (p2CharacterPrev != p2Character || p2SkinPrev != p2Skin) {
			fadeOutMove("#p2Character", -pCharMove, async () => {
				const charScale = await updateChar(p2Character, p2Skin, 'p2Character'); //will return scale
				fadeInChara("#p2Character", charScale);
			});
			p2CharacterPrev = p2Character;
			p2SkinPrev = p2Skin;
		}

		if (p2wlPrev != p2WL) {
			gsap.to("#wlP2", {y: -pMove, ease: "power1.in", duration: .5, onComplete: pwlMoved});
			function pwlMoved() {
				updateWL(p2WL, "2");
				gsap.to("#wlP2", {delay: .1, y: 0, ease: "power2.out", duration: .5});
			}
			p2wlPrev = p2WL;
		}

		if (p2ScorePrev != p2Score) {
			updateScore('p2Score', p2Score, bestOf, "p2ScoreUp", p2Color, true);
			p2ScorePrev = p2Score;
		}

		if (p2ColorPrev != p2Color) {
			fadeOut('#p2Color', () => {
				updateColor('p2Color', p2Color);
				fadeIn('#p2Color');
			})
			p2ColorPrev = p2Color;
		}

		if (document.getElementById('p2Team').textContent != p2Team) {
			fadeOut("#teamLogoP2", () => {
				updateTeamLogo("teamLogoP2", p2Team, "2");
				fadeIn("#teamLogoP2");
			});
		}


		//change border depending of the Best Of status
		if (bestOfPrev != bestOf) {
			updateBorder(bestOf); //update the border
			//update the score ticks so they fit the bestOf border
			updateScore('p1Score', p1Score, bestOf, "p1ScoreUp", p1Color, false);
			updateScore('p2Score', p2Score, bestOf, "p2ScoreUp", p2Color, false);
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
		scoreUpEL.setAttribute('src', 'Resources/Overlay/Score/ScoreUp ' + bestOf + '/' + pColor + '.webm');
		scoreUpEL.play();
		delay = 200; //add a bit of delay so the score change fits with the vid
	}
	const scoreEL = document.getElementById(scoreID);
	//set timeout to the actual image change so it fits with the animation (if it played)
	setTimeout(() => {
		//change the image depending on the bestOf status and, of course, the current score
		scoreEL.setAttribute('src', 'Resources/Overlay/Score/Win Tick ' + bestOf + ' ' + pScore + '.png')
	}, delay);
	//nothing will show if the score is set to 3 which is intended
	if (startup) {scoreEL.addEventListener("error", () => {showNothing(scoreEL)})}
}

function updateColor(colorID, pColor) {
	const colorEL = document.getElementById(colorID);
	colorEL.setAttribute('src', 'Resources/Overlay/Colors/' + pColor + '.png');
	if (startup) {colorEL.addEventListener("error", () => {showNothing(colorEL)})}
}

function updateBorder(bestOf) {
	document.getElementById('borderP1').setAttribute('src', 'Resources/Overlay/Border ' + bestOf + '.png');
	document.getElementById('borderP2').setAttribute('src', 'Resources/Overlay/Border ' + bestOf + '.png');
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
		pWLEL.setAttribute('src', 'Resources/Overlay/Winners P' + playerNum + '.png')
	} else if (pWL == "L") {
		pWLEL.setAttribute('src', 'Resources/Overlay/Losers P' + playerNum + '.png')
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
	switch (color) {
		case "Red":
			return "#ed1c24";
		case "Blue":
			return "#00b7ef";
		case "Pink":
			return "#ffa3b1";
		case "Green":
			return "#a8e61d";
		case "NetGreen":
			return "#42e564";
		case "Purple":
			return "#846ae9";
		case "Magenta":
			return "#ee1c8f";
		case "Yellow":
			return "#dc8c00";
		case "CPU":
			return "#808080";
		default:
			break;
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

//searches for a json file with character data
function getCharInfo(pCharacter) {
	return new Promise(function (resolve) {
		const oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.onerror = () => {resolve("notFound")}; //for obs local file browser sources
		oReq.open("GET", 'Resources/Texts/Character Info/' + pCharacter + '.json');
		oReq.send();

		function reqListener () {
			try {resolve(JSON.parse(oReq.responseText))}
			catch {resolve("notFound")} //for live servers
		}
	})
}

//now the complicated "change character image" function!
async function updateChar(pCharacter, pSkin, charID) {

	//store so code looks cleaner later
	const charEL = document.getElementById(charID);

	//if the image fails to load, we will put a placeholder
	if (startup) {charEL.addEventListener("error", () => {
		//simple check to see if we are updating P1 or P2
		const pNum = charEL == document.getElementById("p1Character") ? 1 : 2;

		charEL.setAttribute('src', 'Resources/Characters/Random/P'+pNum+'.png');
	})}

	//change the image path depending on the character and skin
	charEL.setAttribute('src', 'Resources/Characters/' + pCharacter + '/' + pSkin + '.png');

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
		} else if (pSkin.startsWith("Alt ")) { //for a group of imgs that have a specific position
			charPos[0] = charInfo.scoreboard.alt.x;
			charPos[1] = charInfo.scoreboard.alt.y;
			charPos[2] = charInfo.scoreboard.alt.scale;
		} else { //if none of the above, use a default position
			charPos[0] = charInfo.scoreboard.neutral.x;
			charPos[1] = charInfo.scoreboard.neutral.y;
			charPos[2] = charInfo.scoreboard.neutral.scale;
		}
	} else { //if the character isnt on the database, set positions for the "?" image
		//this condition is used just to position images well on both sides
		if (charEL == document.getElementById("p1Character")) {
			charPos[0] = 18;
		} else {
			charPos[0] = 12;
		}
		charPos[1] = 3; charPos[2] = 1.5;
	}
	
	//to position the character
	charEL.style.objectPosition =  charPos[0] + "px " + charPos[1] + "px";
	charEL.style.transform = "scale(" + charPos[2] + ")";

	return charPos[2]; //we need this one to set scale keyframe when fading back
}