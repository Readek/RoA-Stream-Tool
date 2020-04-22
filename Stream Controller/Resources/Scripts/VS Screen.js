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
	var introDelay = .3; //all animations will get this delay when the html loads (use this so it times with your transition)

	//to resize the texts if they are too large
	var p1Wrap = $('#p1Wrapper'); 
	var p2Wrap = $('#p2Wrapper');
	var rdResize = $('#round');
	var tourneyResize = $('#tournament');

	//max text sizes (used when resizing back)
	var nameSize = '90px';
	var roundSize = '30px';
	var tournamentSize = '25px';

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
		

		//first, things that will happen only the first time the html loads
		if (startup) {
			//starting with the player 1 name
			$('#p1Name').html(p1Name);
			$('#p1Team').html(p1Team);
			//resize the text so it doesnt get out of the overlay if its too long
			resizeText(p1Wrap);
			//fades in the player text
			gsap.to("#p1Wrapper", {delay: introDelay, opacity: 1, duration: fadeInTime});

			//same for player 2
			$('#p2Name').html(p2Name);
			$('#p2Team').html(p2Team);
			resizeText(p2Wrap);
			gsap.to("#p2Wrapper", {delay: introDelay, opacity: 1, duration: fadeInTime});


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
			$('#round').html(round);
			//resize if it overflows
			resizeText(rdResize);

			
			//set the tournament text
			$('#tournament').html(tournamentName);
			//resize if it overflows
			resizeText(tourneyResize);
		}

		//now things that will happen constantly
		else {
			//player 1 name change
			if ($('#p1Name').text() != p1Name || $('#p1Team').text() != p1Team) {
				//fade out player 1 text
				gsap.to("#p1Wrapper", {opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: pNameMoved});
				function pNameMoved() { //this gets called when the previous animation ends
					//now that nobody is seeing it, change the text content!
					$('#p1Wrapper').css('font-size',nameSize);
					$('#p1Name').html(p1Name);
					$('#p1Team').html(p1Team);
					//resize the text if its too big
					resizeText(p1Wrap);
					//and fade the name back in
					gsap.to("#p1Wrapper", {delay: .3, opacity: 1, ease: "power2.out", duration: fadeInTime});
				}
			}

			//same for player 2
			if($('#p2Name').text() != p2Name || $('#p2Team').text() != p2Team){
				gsap.to("#p2Wrapper", {opacity: 0, ease: "power1.in", duration: fadeOutTime, onComplete: pNameMoved});
				function pNameMoved() {
					$('#p2Wrapper').css('font-size',nameSize);
					$('#p2Name').html(p2Name);
					$('#p2Team').html(p2Team);
					resizeText(p2Wrap);
					gsap.to("#p2Wrapper", {delay: .3, opacity: 1, ease: "power2.out", duration: fadeInTime});
				}
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
				gsap.to("#round", {opacity: 0, duration: fadeOutTime, onComplete: roundMoved});
				function roundMoved() {
					$('#round').css('font-size',roundSize);
					$('#round').html(round);					
					resizeText(rdResize);
					gsap.to("#round", {delay: .2, opacity: 1, duration: fadeInTime});
				}
			}


			//update tournament text
			if ($('#tournament').text() != tournamentName){
				gsap.to("#tournament", {opacity: 0, duration: fadeOutTime, onComplete: tournamentMoved});
				function tournamentMoved() {
					$('#tournament').css('font-size',tournamentSize);
					$('#tournament').html(tournamentName);					
					resizeText(tourneyResize);
					gsap.to("#tournament", {delay: .2, opacity: 1, duration: fadeInTime});
				}
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
			$(vidID).attr('src', 'Resources/Backgrounds/' + pCharacter + '.webm').on("error",function () {
				$(vidID).attr('src', 'Resources/Backgrounds/Default.webm') //if the character doesnt have a BG
			});
		}
	}

	//text resize (not fancy i know), keeps making the text smaller until it fits
	function resizeText(text) {
		text.each(function(i, text) {
			while (text.scrollWidth > text.offsetWidth || text.scrollHeight > text.offsetHeight) {
				var newFontSize = (parseFloat($(text).css('font-size').slice(0,-2)) * .95) + 'px';
				$(text).css('font-size', newFontSize);
			};
		});
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

	//workshop characters NOT DONE YET


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