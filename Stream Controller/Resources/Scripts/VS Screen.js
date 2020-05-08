window.onload = init;

function init() {
	var xhr = new XMLHttpRequest();
	var scoreboardInfo = 'Resources/Texts/ScoreboardInfo.json';
	var scObj;
	var startup = true;
	var cBust = 0;

	//animation stuff
	var pCharMove = 30; //distance to move for the character images

	var fadeInTime = .4; //(seconds)
	var fadeOutTime = .3;
	var introDelay = .5; //all animations will get this delay when the html loads (use this so it times with your transition)

	//max text sizes (used when resizing back)
	var roundSize = '38px';
	var tournamentSize = '28px';
	var casterSize = '25px';
	var twitterSize = '20px';

	//to avoid the code constantly running the same method over and over
	var p1CharacterPrev, p1SkinPrev, p1ColorPrev;
	var p2CharacterPrev, p2SkinPrev, p2ColorPrev;


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
			scoreboard();
		}
	}
	
	function scoreboard() {
		if (startup) {
			getData();
			startup = false;
		}
		else {
			getData();
		}
	}

	function getData() {
		var p1Name = scObj['p1Name'];
		var p1Team = scObj['p1Team'];
		var p1Color = scObj['p1Color'];
		var p1Character = scObj['p1Character'];
		var p1Skin = scObj['p1Skin'];
		
		var p2Name = scObj['p2Name'];
		var p2Team = scObj['p2Team'];
		var p2Color = scObj['p2Color'];
		var p2Character = scObj['p2Character'];
		var p2Skin = scObj['p2Skin'];

		var round = scObj['round'];
		var tournamentName = scObj['tournamentName'];

		var caster1 = scObj['caster1Name'];
		var twitter1 = scObj['caster1Twitter'];
		var caster2 = scObj['caster2Name'];
		var twitter2 = scObj['caster2Twitter'];

		//first, things that will happen only the first time the html loads
		if (startup) {
			//starting with the player 1 name
			updatePlayerName('#p1Wrapper', '#p1Name', '#p1Team', p1Name, p1Team);
			//fade in the player text
			fadeIn("#p1Wrapper", introDelay+.15);

			//same for player 2
			updatePlayerName('#p2Wrapper', '#p2Name', '#p2Team', p2Name, p2Team);
			fadeIn("#p2Wrapper", introDelay+.15);


			//set p1 character
			updateChar(p1Character, p1Skin, p1Color, '#charP1', '#trailP1');
			//character movement
			gsap.fromTo("#charaP1",
				{x: -pCharMove, opacity: 0},
				{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
			//trail movement
			gsap.to("#trailP1", {delay: introDelay+.15, x: -pCharMove, opacity: 1, ease: "power2.out", duration: fadeInTime+.1});
			//save character info so we change them later if different
			p1CharacterPrev = p1Character;
			p1SkinPrev = p1Skin;

			//same for p2
			updateChar(p2Character, p2Skin, p2Color, '#charP2', '#trailP2');
			gsap.fromTo("#charaP2",
				{x: -pCharMove, opacity: 0},
				{delay: introDelay, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime});
			gsap.to("#trailP2", {delay: introDelay+.15, x: -pCharMove, opacity: 1, ease: "power2.out", duration: fadeInTime+.1});
			p2CharacterPrev = p2Character;
			p2SkinPrev = p2Skin;

			
			//set the character backgrounds
			updateBG('#vidBGP1', p1Character, p1Skin);
			updateBG('#vidBGP2', p2Character, p2Skin);


			//set the colors
			updateColor('#colorBGP1', '#textBGP1', p1Color);
			updateColor('#colorBGP2', '#textBGP2', p2Color);
			p1ColorPrev = p1Color;
			p2ColorPrev = p2Color;


			//set the round text
			updateText("#round", round, roundSize);

			//set the tournament text
			updateText("#tournament", tournamentName, tournamentSize);

			//set the caster info
			updateText("#caster1", caster1, casterSize);
			updateText("#caster2", caster2, casterSize);
			updateText("#twitter1", twitter1, twitterSize);
			updateText("#twitter2", twitter2, twitterSize);
		}

		//now things that will happen constantly
		else {
			//player 1 name change
			if ($('#p1Name').text() != p1Name || $('#p1Team').text() != p1Team) {
				//fade out player 1 text
				fadeOut("#p1Wrapper", function(){
					//now that nobody is seeing it, change the text content!
					updatePlayerName('#p1Wrapper', '#p1Name', '#p1Team', p1Name, p1Team);
					//and fade the name back in
					fadeIn("#p1Wrapper", .2);
				});
			}

			//same for player 2
			if($('#p2Name').text() != p2Name || $('#p2Team').text() != p2Team){
				fadeOut("#p2Wrapper", function(){
					updatePlayerName('#p2Wrapper', '#p2Name', '#p2Team', p2Name, p2Team);
					fadeIn("#p2Wrapper", .2);
				});
			}


			//player 1 character, skin and background change
			if (p1CharacterPrev != p1Character || p1SkinPrev != p1Skin) {

				//move and fade out the character
				gsap.to("#charaP1", {delay: .2, x: -pCharMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: charMoved});
				function charMoved() {
					//update the character image and trail, and also storing its scale for later
					charScale = updateChar(p1Character, p1Skin, p1Color, '#charP1', '#trailP1');
					//move and fade it back
					gsap.to("#charaP1", {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime+.1});
					//dont forget to move the trail!
					gsap.fromTo("#trailP1",
						{scale: charScale, x: 0, opacity: 0},
						{delay: .5, x: -pCharMove, opacity: 1, ease: "power2.out", duration: fadeInTime+.1});
				}

				//background change here!
				if (p1CharacterPrev != p1Character || p1Skin == "Ragnir" || p1SkinPrev == "Ragnir") { //only when different character or ragnir
					//fade it out
					gsap.to("#vidBGP1", {opacity: 0, ease: "power1.in", duration: fadeOutTime+.2, onComplete: bgFaded});
					function bgFaded() { //when faded
						updateBG('#vidBGP1', p1Character, p1Skin); //update the bg vid
						gsap.to("#vidBGP1", {delay: .3, opacity: 1, ease: "power2.out", duration: fadeInTime+.2}); //fade in
					}
				}
				
				p1CharacterPrev = p1Character;
				p1SkinPrev = p1Skin;
			}

			//same for player 2
			if (p2CharacterPrev != p2Character || p2SkinPrev != p2Skin) {
				
				gsap.to("#charaP2", {delay: .2, x: -pCharMove, opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: charMoved});
				function charMoved() {
					charScale = updateChar(p2Character, p2Skin, p2Color, '#charP2', '#trailP2');
					gsap.to("#charaP2", {delay: .3, x: 0, opacity: 1, ease: "power2.out", duration: fadeInTime+.1});
					gsap.fromTo("#trailP2",
						{scale: charScale, x: 0, opacity: 0},
						{delay: .5, x: -pCharMove, opacity: 1, ease: "power2.out", duration: fadeInTime+.1});
				}
				
				if (p2CharacterPrev != p2Character || p2Skin == "Ragnir" || p2SkinPrev == "Ragnir") {
					gsap.to("#vidBGP2", {opacity: 0, ease: "power1.in", duration: fadeOutTime+.2, onComplete: bgFaded});
					function bgFaded() {
						updateBG('#vidBGP2', p2Character, p2Skin);
						gsap.to("#vidBGP2", {delay: .3, opacity: 1, ease: "power2.out", duration: fadeInTime+.2});
					}
				}
			
				p2CharacterPrev = p2Character;
				p2SkinPrev = p2Skin;
			}

			
			//color change
			if (p1ColorPrev != p1Color) {
				updateColor('#colorBGP1', '#textBGP1', p1Color);
				colorTrail('#trailP1', p1Character, p1Skin, p1Color);
				p1ColorPrev = p1Color;
			}

			if (p2ColorPrev != p2Color) {
				updateColor('#colorBGP2', '#textBGP2', p2Color);
				colorTrail('#trailP2', p2Character, p2Skin, p2Color);
				p2ColorPrev = p2Color;
			}


			//update round text
			if ($('#round').text() != round){
				fadeOut("#round", function(){
					updateText("#round", round, roundSize);
					fadeIn("#round", .2);
				});
			}

			//update tournament text
			if ($('#tournament').text() != tournamentName){
				fadeOut("#tournament", function(){
					updateText("#tournament", tournamentName, tournamentSize);
					fadeIn("#tournament", .2);
				});
			}


			//same but with caster info
			if ($('#caster1').text() != caster1){
				fadeOut("#caster1", function(){
					updateText("#caster1", caster1, casterSize);
					fadeIn("#caster1", .2);
				});
			}
			if ($('#caster2').text() != caster2){
				fadeOut("#caster2", function(){
					updateText("#caster2", caster2, casterSize);
					fadeIn("#caster2", .2);
				});
			}
			if ($('#twitter1').text() != twitter1){
				fadeOut("#twitter1", function(){
					updateText("#twitter1", twitter1, twitterSize);
					fadeIn("#twitter1", .2);
				});
			}
			if ($('#twitter2').text() != twitter2){
				fadeOut("#twitter2", function(){
					updateText("#twitter2", twitter2, twitterSize);
					fadeIn("#twitter2", .2);
				});
			}
		}
	}

	
	function updateColor(gradID, textBGID, color) {
		//change the color gradient image path depending on the color
		$(gradID).attr('src', 'Resources/Overlay/VS Screen/Grad ' + color + '.png').on("error",function () {
			$(charID).attr('src', 'Resources/Literally Nothing.png') //safety check if the img is not found
		});

		//same as before but with the text background
		$(textBGID).attr('src', 'Resources/Overlay/VS Screen/Text BG ' + color + '.png').on("error",function () {
			$(textBGID).attr('src', 'Resources/Literally Nothing.png') //safety check if the img is not found
		});
	}


	//background change
	function updateBG(vidID, pCharacter, pSkin) {
		//change the BG path depending on the character
		if (pSkin == "Ragnir") { //yes, ragnir is the only skin that changes bg
			$(vidID).attr('src', 'Resources/Backgrounds/Default.webm');
		} else {
			var pCharNoSpaces = pCharacter.replace(/ /g, ""); //remove spaces just in case
			if (window[pCharNoSpaces]["vid"]) { //if the character has an specific BG
				vidName = window[pCharNoSpaces]["vid"];
			} else { //if not, just use the character name
				vidName = pCharacter;
			}
			
			$(vidID).attr('src', 'Resources/Backgrounds/' + vidName + '.webm').on("error",function () {
				$(vidID).attr('src', 'Resources/Backgrounds/Default.webm') //if the character doesnt have a BG
			});
		}
	}

	//player text change
	function updatePlayerName(wrapperID, nameID, teamID, pName, pTeam) {
		$(nameID).css('font-size', '90px'); //set original text size
		$(teamID).css('font-size', '50px');
		$(nameID).html(pName); //update player name
		$(teamID).html(pTeam); //update player team
		resizePlayers(wrapperID, nameID, teamID); //resize if it overflows
	}

	//generic text changer
	function updateText(textID, textToType, maxSize) {
		$(textID).css('font-size', maxSize); //set original text size
		$(textID).html(textToType); //change the actual text
		resizeText(textID); //resize it if it overflows
	}

	//text resize, keeps making the text smaller until it fits
	function resizeText(text) {
		$(text).each(function(i, text) {
			while (text.scrollWidth > text.offsetWidth || text.scrollHeight > text.offsetHeight) {
				var newFontSize = (parseFloat($(text).css('font-size').slice(0,-2)) * .95) + 'px';
				$(text).css('font-size', newFontSize);
			};
		});
	}

	//text resize but for the players, so team keeps staying smaller than name
	function resizePlayers(wrap, pName, pTeam) {
		$(wrap).each(function(i, wrap) {
			while (wrap.scrollWidth > wrap.offsetWidth || wrap.scrollHeight > wrap.offsetHeight) {
				var newFontSize = (parseFloat($(pName).css('font-size').slice(0,-2)) * .95) + 'px';
				$(pName).css('font-size', newFontSize);
				newFontSize = (parseFloat($(pTeam).css('font-size').slice(0,-2)) * .95) + 'px';
				$(pTeam).css('font-size', newFontSize);
			};
		});
	}

	//fade out
	function fadeOut(itemID, funct) {
		gsap.to(itemID, {opacity: 0, duration: fadeOutTime, onComplete: funct});
	}

	//fade in
	function fadeIn(itemID, timeDelay) {
		gsap.to(itemID, {delay: timeDelay, opacity: 1, duration: fadeInTime});
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
		neutral: [-30, 200, 1]
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
	Valkyrie = {
		neutral: [-50, 0, 1]
	}
	Yoyo = {
		neutral: [0, 100, 1]
	}
	ZettaAshikaga = {
		neutral: [-50, 100, 1.1]
	}


	//character update!
	function updateChar(pCharacter, pSkin, color, charID, trailID) {

		//if using an Alt skin, just use the normal version
		if (pSkin.startsWith("Alt ")) {
			pSkin = pSkin.substring(4); //removes "Alt " from string
		}

		//change the image path depending on the character and skin
		$(charID).attr('src', 'Resources/Characters/' + pCharacter + '/' + pSkin + '.png').on("error",function () {
			$(charID).attr('src', 'Resources/Literally Nothing.png') //safety check if the img is not found
		});

		//this is so characters with spaces on their names also work
		var pCharNoSpaces = pCharacter.replace(/ /g, "");
		//             x, y, scale
		var charPos = [0, 0, 1];
		//now, check if the character and skin exist in the database up there
		if (window[pCharNoSpaces]) {
			if (window[pCharNoSpaces][pSkin]) { //if the skin has a specific position
				charPos[0] = window[pCharNoSpaces][pSkin][0];
				charPos[1] = window[pCharNoSpaces][pSkin][1];
				charPos[2] = window[pCharNoSpaces][pSkin][2];

				$(trailID).attr('src', 'Resources/Trails/' + pCharacter + '/' + color + ' ' + pSkin + '.png').on("error",function () {
					$(trailID).attr('src', 'Resources/Literally Nothing.png');
				});
			} else { //else, use a default position
				charPos[0] = window[pCharNoSpaces].neutral[0];
				charPos[1] = window[pCharNoSpaces].neutral[1];
				charPos[2] = window[pCharNoSpaces].neutral[2];

				$(trailID).attr('src', 'Resources/Trails/' + pCharacter + '/' + color + '.png').on("error",function () {
					$(trailID).attr('src', 'Resources/Literally Nothing.png');
				});
			}
		} else { //if theres no data, at least make it look half good
			charPos[0] = 0;
			charPos[1] = 0;
			charPos[2] = 1;

			$(trailID).attr('src', 'Resources/Trails/' + pCharacter + '/' + color + '.png').on("error",function () {
				$(trailID).attr('src', 'Resources/Literally Nothing.png');
			});
		}

		//to position the character
		$(charID).css('object-position', charPos[0] + "px " + charPos[1] + "px");
		$(trailID).css('object-position', charPos[0] + "px " + charPos[1] + "px");
		$(charID).css('transform', "scale(" + charPos[2] + ")");
		$(trailID).css('transform', "scale(" + charPos[2] + ")");

		//to decide scalling
		if (pSkin == "HD" || pSkin == "LoA") {
			$(charID).css('image-rendering', "auto"); //default scalling
			$(trailID).css('image-rendering', "auto");
		}
		else
		{
			$(charID).css('image-rendering', "pixelated"); //sharp scalling
			$(trailID).css('image-rendering', "pixelated");
		}

		return charPos[2]; //we need this one to set scale keyframe when fading back
	}


	//this gets called just to change the color of a trail
	function colorTrail(trailID, pCharacter, pSkin, color) {
		var pCharNoSpaces = pCharacter.replace(/ /g, "");
		if (window[pCharNoSpaces]) {
			if (window[pCharNoSpaces][pSkin]) {
				$(trailID).attr('src', 'Resources/Trails/' + pCharacter + '/' + color + ' ' + pSkin + '.png').on("error",function () {
					$(trailID).attr('src', 'Resources/Literally Nothing.png');
				});
			} else {
				$(trailID).attr('src', 'Resources/Trails/' + pCharacter + '/' + color + '.png').on("error",function () {
					$(trailID).attr('src', 'Resources/Literally Nothing.png');
				});
			}
		}
	}
}