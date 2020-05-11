window.onload = init;

function init() {
	let xhr = new XMLHttpRequest();
	let scoreboardInfo = 'Resources/Texts/ScoreboardInfo.json';
	let scObj;
	let startup = true;
	let cBust = 0;

	//animation stuff
	let pCharMove = 30; //distance to move for the character images

	let fadeInTime = .4; //(seconds)
	let fadeOutTime = .3;
	let introDelay = .5; //all animations will get this delay when the html loads (use this so it times with your transition)

	//max text sizes (used when resizing back)
	let roundSize = '38px';
	let tournamentSize = '28px';
	let casterSize = '25px';
	let twitterSize = '20px';

	//to avoid the code constantly running the same method over and over
	let p1CharacterPrev, p1SkinPrev, p1ColorPrev;
	let p2CharacterPrev, p2SkinPrev, p2ColorPrev;


	xhr.overrideMimeType('application/json');

	function getInfo() {
		xhr.open('GET', scoreboardInfo + '?v=' + cBust, true);
		xhr.send();
		cBust++;
	}

	getInfo();
	setInterval(function () { getInfo(); }, 500); //update interval

	xhr.onreadystatechange = parseJSON;

	function parseJSON() {
		if (xhr.readyState === 4) {
			scObj = JSON.parse(xhr.responseText);
			getData();
		}
	}

	
	function getData() {
		let p1Name = scObj['p1Name'];
		let p1Team = scObj['p1Team'];
		let p1Color = scObj['p1Color'];
		let p1Character = scObj['p1Character'];
		let p1Skin = scObj['p1Skin'];
		
		let p2Name = scObj['p2Name'];
		let p2Team = scObj['p2Team'];
		let p2Color = scObj['p2Color'];
		let p2Character = scObj['p2Character'];
		let p2Skin = scObj['p2Skin'];

		let round = scObj['round'];
		let tournamentName = scObj['tournamentName'];

		let caster1 = scObj['caster1Name'];
		let twitter1 = scObj['caster1Twitter'];
		let caster2 = scObj['caster2Name'];
		let twitter2 = scObj['caster2Twitter'];

		//first, things that will happen only the first time the html loads
		if (startup) {
			//starting with the player 1 name
			updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', p1Name, p1Team);
			//fade in the player text
			fadeIn("#p1Wrapper", introDelay+.15);

			//same for player 2
			updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', p2Name, p2Team);
			fadeIn("#p2Wrapper", introDelay+.15);


			//set p1 character
			updateChar(p1Character, p1Skin, p1Color, 'charP1', 'trailP1');
			//move the character
			initCharaFade("#charaP1", "#trailP1");
			//save character info so we change them later if different
			p1CharacterPrev = p1Character;
			p1SkinPrev = p1Skin;

			//same for p2
			updateChar(p2Character, p2Skin, p2Color, 'charP2', 'trailP2');
			initCharaFade("#charaP2", "#trailP2");
			p2CharacterPrev = p2Character;
			p2SkinPrev = p2Skin;

			
			//set the character backgrounds
			updateBG('vidBGP1', p1Character, p1Skin);
			updateBG('vidBGP2', p2Character, p2Skin);


			//set the colors
			updateColor('colorBGP1', 'textBGP1', p1Color);
			updateColor('colorBGP2', 'textBGP2', p2Color);
			p1ColorPrev = p1Color;
			p2ColorPrev = p2Color;


			//set the round text
			updateText("round", round, roundSize);

			//set the tournament text
			updateText("tournament", tournamentName, tournamentSize);

			//set the caster info
			updateText("caster1", caster1, casterSize);
			updateText("caster2", caster2, casterSize);
			updateText("twitter1", twitter1, twitterSize);
			updateText("twitter2", twitter2, twitterSize);


			startup = false; //next time we run this function, it will skip all we just did
		}

		//now things that will happen constantly
		else {

			//color change, this is up here before everything else so it doesnt change the
			//trail to the next one if the character has changed, but it will change its color
			if (p1ColorPrev != p1Color) {
				updateColor('colorBGP1', 'textBGP1', p1Color);
				colorTrail('trailP1', p1CharacterPrev, p1SkinPrev, p1Color);
				p1ColorPrev = p1Color;
			}

			if (p2ColorPrev != p2Color) {
				updateColor('colorBGP2', 'textBGP2', p2Color);
				colorTrail('trailP2', p2CharacterPrev, p2SkinPrev, p2Color);
				p2ColorPrev = p2Color;
			}

			//player 1 name change
			if (document.getElementById('p1Name').textContent != p1Name ||
				document.getElementById('p1Team').textContent != p1Team) {
				//fade out player 1 text
				fadeOut("#p1Wrapper", function(){
					//now that nobody is seeing it, change the text content!
					updatePlayerName('p1Wrapper', 'p1Name', 'p1Team', p1Name, p1Team);
					//and fade the name back in
					fadeIn("#p1Wrapper", .2);
				});
			}

			//same for player 2
			if (document.getElementById('p2Name').textContent != p2Name ||
				document.getElementById('p2Team').textContent != p2Team){
				fadeOut("#p2Wrapper", function(){
					updatePlayerName('p2Wrapper', 'p2Name', 'p2Team', p2Name, p2Team);
					fadeIn("#p2Wrapper", .2);
				});
			}


			//player 1 character, skin and background change
			if (p1CharacterPrev != p1Character || p1SkinPrev != p1Skin) {

				//move and fade out the character
				charaFadeOut("#charaP1", function(){
					//update the character image and trail, and also storing its scale for later
					charScale = updateChar(p1Character, p1Skin, p1Color, 'charP1', 'trailP1');
					//move and fade them back
					charaFadeIn("#charaP1", "#trailP1");
				});

				//background change here!
				if (p1CharacterPrev != p1Character || p1Skin == "Ragnir" || p1SkinPrev == "Ragnir") { //only when different character or ragnir
					//fade it out
					fadeOut("#vidBGP1", function(){
						//update the bg vid
						updateBG('vidBGP1', p1Character, p1Skin);
						//fade it back
						fadeIn("#vidBGP1", .3, fadeInTime+.2);
					}, fadeOutTime+.2);
				};
				
				p1CharacterPrev = p1Character;
				p1SkinPrev = p1Skin;
			}

			//same for player 2
			if (p2CharacterPrev != p2Character || p2SkinPrev != p2Skin) {
				charaFadeOut("#charaP2", function(){
					charScale = updateChar(p2Character, p2Skin, p2Color, 'charP2', 'trailP2');
					charaFadeIn("#charaP2", "#trailP2");
				});
				
				if (p2CharacterPrev != p2Character || p2Skin == "Ragnir" || p2SkinPrev == "Ragnir") {
					fadeOut("#vidBGP2", function(){
						updateBG('vidBGP2', p2Character, p2Skin); //update the bg vid
						fadeIn("#vidBGP2", .3, fadeInTime+.2);
					}, fadeOutTime+.2);
				};
			
				p2CharacterPrev = p2Character;
				p2SkinPrev = p2Skin;
			}


			//update round text
			if (document.getElementById('round').textContent != round){
				fadeOut("#round", function(){
					updateText("round", round, roundSize);
					fadeIn("#round", .2);
				});
			}

			//update tournament text
			if (document.getElementById('tournament').textContent != tournamentName){
				fadeOut("#tournament", function(){
					updateText("tournament", tournamentName, tournamentSize);
					fadeIn("#tournament", .2);
				});
			}


			//same but with caster info
			if (document.getElementById('caster1').textContent != caster1){
				fadeOut("#caster1", function(){
					updateText("caster1", caster1, casterSize);
					fadeIn("#caster1", .2);
				});
			}
			if (document.getElementById('caster2').textContent != caster2){
				fadeOut("#caster2", function(){
					updateText("caster2", caster2, casterSize);
					fadeIn("#caster2", .2);
				});
			}
			if (document.getElementById('twitter1').textContent != twitter1){
				fadeOut("#twitter1", function(){
					updateText("twitter1", twitter1, twitterSize);
					fadeIn("#twitter1", .2);
				});
			}
			if (document.getElementById('twitter2').textContent != twitter2){
				fadeOut("#twitter2", function(){
					updateText("twitter2", twitter2, twitterSize);
					fadeIn("#twitter2", .2);
				});
			}
		}
	}


	//did an image fail to load? this will be used to show nothing
	function showNothing(itemEL) {
		itemEL.setAttribute('src', 'Resources/Literally Nothing.png');
	}

	//color change
	function updateColor(gradID, textBGID, color) {
		let gradEL = document.getElementById(gradID);
		//change the color gradient image path depending on the color
		gradEL.setAttribute('src', 'Resources/Overlay/VS Screen/Grad ' + color + '.png');
		//did that path not work? show absolutely nothing
		if (startup) {gradEL.addEventListener("error", function(){showNothing(gradEL)})}

		//same but with the text background
		let textBGEL = document.getElementById(textBGID);
		textBGEL.setAttribute('src', 'Resources/Overlay/VS Screen/Text BG ' + color + '.png');
		if (startup) {textBGEL.addEventListener("error", function(){showNothing(textBGEL)})}
	}

	//background change
	function updateBG(vidID, pCharacter, pSkin) {
		let vidEL = document.getElementById(vidID);
		//change the BG path depending on the character
		if (pSkin == "Ragnir") { //yes, ragnir is the only skin that changes bg
			vidEL.setAttribute('src', 'Resources/Backgrounds/Default.webm');
		} else {
			let pCharNoSpaces = pCharacter.replace(/ /g, ""); //remove spaces just in case
			let vidName;

			if (window[pCharNoSpaces]) { //safety check
				if (window[pCharNoSpaces]["vid"]) { //if the character has an specific BG
					vidName = window[pCharNoSpaces]["vid"];
				} else { //if not, just use the character name
					vidName = pCharacter;
				}
			}

			//actual video path change
			vidEL.setAttribute('src', 'Resources/Backgrounds/' + vidName + '.webm');

			if (startup) {
				//if the character doesnt have a vid, show aethereal gates
				vidEL.addEventListener("error", function(){
					vidEL.setAttribute('src', 'Resources/Backgrounds/Default.webm')
				});
			}
		}
	}

	//player text change
	function updatePlayerName(wrapperID, nameID, teamID, pName, pTeam) {
		let nameEL = document.getElementById(nameID);
		nameEL.style.fontSize = '90px'; //set original text size
		nameEL.textContent = pName; //change the actual text
		let teamEL = document.getElementById(teamID);
		teamEL.style.fontSize = '50px';
		teamEL.textContent = pTeam;

		resizeText(document.getElementById(wrapperID)); //resize if it overflows
	}

	//generic text changer
	function updateText(textID, textToType, maxSize) {
		let textEL = document.getElementById(textID);
		textEL.style.fontSize = maxSize; //set original text size
		textEL.textContent = textToType; //change the actual text
		resizeText(textEL); //resize it if it overflows
	}

	//text resize, keeps making the text smaller until it fits
	function resizeText(textEL) {
		let childrens = textEL.children;
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
	function fadeOut(itemID, funct, dur = fadeOutTime) {
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
	function charaFadeIn(charaID, trailID) {
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


	//character update!
	function updateChar(pCharacter, pSkin, color, charID, trailID) {

		//store so code looks cleaner later
		let charEL = document.getElementById(charID);
		let trailEL = document.getElementById(trailID);

		//if using an Alt skin, just use the normal version
		if (pSkin.startsWith("Alt ")) {
			pSkin = pSkin.substring(4); //removes "Alt " from string
		}

		//change the image path depending on the character and skin
		charEL.setAttribute('src', 'Resources/Characters/' + pCharacter + '/' + pSkin + '.png');

		//this is so characters with spaces on their names also work
		let pCharNoSpaces = pCharacter.replace(/ /g, "");
		//             x, y, scale
		let charPos = [0, 0, 1];
		//now, check if the character and skin exist in the database down there
		if (window[pCharNoSpaces]) {
			if (window[pCharNoSpaces][pSkin]) { //if the skin has a specific position
				charPos[0] = window[pCharNoSpaces][pSkin][0];
				charPos[1] = window[pCharNoSpaces][pSkin][1];
				charPos[2] = window[pCharNoSpaces][pSkin][2];
				trailEL.setAttribute('src', 'Resources/Trails/' + pCharacter + '/' + color + ' ' + pSkin + '.png');
			} else { //else, use a default position
				charPos[0] = window[pCharNoSpaces].neutral[0];
				charPos[1] = window[pCharNoSpaces].neutral[1];
				charPos[2] = window[pCharNoSpaces].neutral[2];
				trailEL.setAttribute('src', 'Resources/Trails/' + pCharacter + '/' + color + '.png');
			}
		} else { //if theres no data, at least make it look half good
			charPos[0] = 0;
			charPos[1] = 0;
			charPos[2] = 1;
			trailEL.setAttribute('src', 'Resources/Trails/' + pCharacter + '/' + color + '.png');
		}

		//to position the character
		charEL.style.objectPosition =  charPos[0] + "px " + charPos[1] + "px";
		charEL.style.transform = "scale(" + charPos[2] + ")";
		trailEL.style.objectPosition =  charPos[0] + "px " + charPos[1] + "px";
		trailEL.style.transform = "scale(" + charPos[2] + ")";

		//to decide scalling
		if (pSkin == "HD" || pSkin == "LoA") {
			charEL.style.imageRendering = "auto"; //default scalling
			trailEL.style.imageRendering = "auto";
		} else {
			charEL.style.imageRendering = "pixelated"; //sharp scalling
			trailEL.style.imageRendering = "pixelated";
		}

		//this will trigger whenever the image loaded cant be found
		if (startup) {
			charEL.addEventListener("error", function(){showNothing(charEL)})
			trailEL.addEventListener("error", function(){showNothing(trailEL)})
		}

		return charPos[2]; //we need this one to set scale keyframe when fading back
	}


	//this gets called just to change the color of a trail
	function colorTrail(trailID, pCharacter, pSkin, color) {
		let trailEL = document.getElementById(trailID);
		let pCharNoSpaces = pCharacter.replace(/ /g, "");
		if (window[pCharNoSpaces]) {
			if (window[pCharNoSpaces][pSkin]) {
				trailEL.setAttribute('src', 'Resources/Trails/' + pCharacter + '/' + color + ' ' + pSkin + '.png');
			} else {
				trailEL.setAttribute('src', 'Resources/Trails/' + pCharacter + '/' + color + '.png');
			}
		}
	}


	//positions database starts here! scale cant be lower than 1
	Absa = {
		neutral: [55, 133, 1.35],
		LoA: [410, 175, 1.5],
		HD: [45, 125, 1.3]
	};
	Clairen = {
		neutral: [-400, 170, 1.17],
		LoA: [370, 180, 1.4],
		HD: [-550, 125, 1.07]
	};
	Elliana = {
		neutral: [-280, 160, 1.22],
		LoA: [-270, 125, 1.1],
		HD: [-250, 140, 1.34]
	};
	Etalus = {
		neutral: [-340, 160, 1.05],
		Panda: [-340, 160, 1.05],	//same as neutral, just here so trail shows up
		LoA: [235, 220, 1.4],
		HD: [-470, 155, 1]
	};
	Forsburn = {
		neutral: [-125, 130, 1.25],
		LoA: [265, 170, 1.35],
		HD: [-293, 25, 1.27]
	};
	Kragg = {
		neutral: [-260, 20, 1.03],
		LoA: [-110, 2, 1.1],
		HD: [20, -130, 1.4]
	};
	Maypul = {
		neutral: [-260, 225, 1],
		LoA: [280, 200, 1.3],
		Ragnir: [-240, 5, 1.15],
		HD: [-295, 40, 1.12]
	};
	Orcane = {
		neutral: [-305, 135, 1.02],
		LoA: [-150, 120, 1.1],
		HD: [-0, 50, 1.1]
	};
	OriandSein = { //characters with spaces on their name must have them removed
		neutral: [-50, 100, 1.1],
		HD: [-280, 35, 1.08]
	};
	Ranno = {
		neutral: [140, 145, 1.3],
		LoA: [270, 180, 1.2],
		Tuxedo: [140, 145, 1.3], //same as neutral, just here so trail shows up
		HD: [120, 155, 1.27]
	};
	ShovelKnight = {
		neutral: [-5, 100, 1.15],
		HD: [15, 100, 1.15]
	};
	Sylvanos = {
		neutral: [-400, 50, 1.1],
		LoA: [150, 130, 1.2],
		HD: [-440, 30, 1.04]
	};
	Wrastor = {
		neutral: [-175, 155, 1.19],
		LoA: [275, 150, 1.2],
		HD: [-60, 140, 1.19]
	};
	Zetterburn = {
		neutral: [-50, 10, 1.35],
		LoA: [170, 100, 1.2],
		HD: [-170, -20, 1.25]
	};

	//workshop characters:
	AcidRainbows = {
		neutral: [200, 200, 1.2]
	};
	Archen = {
		neutral: [-50, 0, 1]
	};
	Astra = {
		neutral: [65, 100, 1],
		vid: "Valkyrie" //this is to use a BG belonging to other character
	};
	BirdGuy = {
		neutral: [-20, 0, 1]
	};
	Epinel = {
		neutral: [100, 140, 1.1],
		vid: "Kragg"
	};
	Falco = {
		neutral: [100, 175, 1.1]
	};
	Fox = {
		neutral: [90, 140, 1.1]
	};
	Guadua = {
		neutral: [-240, 60, 1.1]
	};
	HimeDaisho = {
		neutral: [150, 25, 1.15]
	};
	Kirby = {
		neutral: [-80, 170, 1]
	};
	Kris = {
		neutral: [75, 125, 1.1]
	};
	Liz = {
		neutral: [140, 125, 1.05]
	};
	MayuAshikaga = {
		neutral: [0, 100, 1.1],
		vid: "Zetta Ashikaga"
	};
	Mollo = {
		neutral: [-20, 120, 1.22],
		vid: "Clairen"
	};
	Mycolich = {
		neutral: [-120, 25, 1.05],
		vid: "Sylvanos"
	};
	Olympia = {
		neutral: [20, 120, 1.1]
	};
	Otto = {
		neutral: [-100, 75, 1]
	}
	Pomme = {
		neutral: [225, 125, 1.15]
	}
	R_00 = { //this should have "-" but it would break :(
		neutral: [-100, 75, 1],
		vid: "Clairen"
	}
	Sandbert = {
		neutral: [100, 175, 1],
		vid: "Absa"
	}
	TrummelandAlto = {
		neutral: [-100, 100, 1]
	}
	UzaCkater = {
		neutral: [-125, 55, 1]
	};
	Valkyrie = {
		neutral: [-50, 0, 1]
	}
	Yoyo = {
		neutral: [0, 100, 1]
	}
	ZettaAshikaga = {
		neutral: [-50, 100, 1.1]
	}
}