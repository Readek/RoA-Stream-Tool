![preview](https://cdn.discordapp.com/attachments/574303886869790730/749570123701944390/unknown.png)
# RoA Stream Tool
*Also available for [Melee](https://github.com/Readek/Melee-Stream-Tool) and [Rushdown Revolt](https://github.com/Readek/Rushdown-Revolt-Stream-Tool)!*

So you want to do a Rivals of Aether stream, huh? Well, today is your lucky day, because I have done tons of work so you don’t have to! With this tool, you will be able to set up a RoA tournament stream in no time.

---

## Features
- [Easy and fast setup](https://gfycat.com/entireinconsequentialafricangroundhornbill) using a browser source. Drag and drop!
- [Handy interface](https://gfycat.com/thirstyripeeyra) to quickly change everything you need, like player names, characters, scores, round, casters...
- Customizable [Player Presets](https://gfycat.com/melodicwearybuzzard) to setup your match in no time!
- Every single skin the game has to offer is [supported](https://gfycat.com/sandyinsignificantdodobird) (more than 300 different skins!), including high quality renders.
- Some **Workshop** characters are also [supported](https://gfycat.com/leadingancienthumpbackwhale)!
- Now with [2v2 support](https://gfycat.com/wigglyshamelessindianpalmsquirrel)!
- [Dynamic, optional intro](https://gfycat.com/revolvingsmarteuropeanpolecat) to be played when changing to the game scene.
- A "[VS Screen](https://gfycat.com/peacefulelatedblowfish)" to be displayed when waiting for the next game.
- All the content on the GUI combo boxes can be edited at will. You can quickly change which characters or skins your tournament is going to be using.
- Easy to customize! Add your own skins, workshop characters, custom overlays or even dive into the code if you're brave enough!
- This is **not** a [Stream Control](http://farpnut.net/StreamControl) clone. It doesn't have anything to do with it, everything is custom made.

---

## How to setup
These are instructions for regular OBS Studio, but I imagine you can do the same with other streaming software:
- Get the [latest release](https://github.com/Readek/RoA-Stream-Control/releases).
- Extract somewhere.
- Drag and drop `RoA Scoreboard.htlm` into OBS, or add a new browser source in OBS pointing at the local file.
- If the source looks weird, manually set the source's properties to 1920 width and 1080 height, or set your OBS canvas resolution to 1080p, or make the source fit the screen.
- In the source's properties, change *Use custom frame rate* -> `60` (if streaming at 60fps of course).
- **Also tick `Refresh browser when scene becomes active`**. Trust me, this one is important.
- Manage it all with the `RoA Stream Tool` executable.

Repeat from the 3rd step to add the `VS Screen.html`, though I recommend you to do so on another scene.

### Interface shortcuts!
- Press `Enter` to update.
- Press either `F1` or `F2` to increase P1's or P2's score.
- Press `ESC` to clear player info.

Note: The Scoreboard's intro will only play when refreshing the browser. If you tick the intro box while having the scoreboard's scene open, nothing will change until you go out and back to the scoreboard's scene.

---

## Advanced setup
Yes, the instructions above are enough, but we can do better. **All of this is optional** of course.
 
2 basic transitions are included in the `Resources/OBS Transitions` folder, intended to be used to change to the game scene and to the vs screen, if you don't have a transition yourself of course. To use them on OBS:
- Add a new stinger transition.
- Set the video file to `Game In.webm` if creating the game scene transition, and `Swoosh.webm` if creating a vs screen transition.
- Transition point -> `350 ms`.
- I recommend you to set the Audio Fade Style to crossfade, just in case.
- On the scene's right click menu, set it to Transition Override to the transition you just created.
- Also, you may want to set a hotkey to transition to the game scene so you can press enter ingame to start the replay and press the transition key at the same time. The transition is timed to do so.

It is very much recommended that you turn off the in-game top HUD. The overlay wont cover the [player's icons on the top corners](https://cdn.discordapp.com/attachments/574303886869790730/705102043102052363/game_hud_oh_no.png), and that will fix it.

Also, you may find the "3 2 1" of the game's intro a bit distracting when combined with the scoreboard intro. [These](https://drive.google.com/open?id=1NEDii3B50eHT_goADzn6t3_O8Uvok0Gs) are the sprites to remove them (using the [Modding Tool](https://github.com/jam1garner/gm_data_win/releases/latest)).

---

## Other stuff...
Hey, Ateozc speakin for the remainder of this...

Still gotta update this read me here for the stuff I added. I know. I probably should have done that ahead of time. But I am lazy and did this last minute. 

If you are looking for the OBS stuff I did using Python, I'll update this on how to use that stuff sooner or later. Dont worry. If you are python savvy, just make sure you install latest python and you should be good to go. Dont recall if i installed anything special. None of that is packaged, so feel free to edit as you need.

Other than that, yea. I messed with Readek's stuff and made my own version. If you want to message me on Twitter you can find me at https://twitter.com/ateozc.


### Closing notes
I do programming for a living. This is a side hobby, along with running events here in Chicago.
If you have any questions let me know. Lots of the stuff you see here was done because I wanted it for myself lol.
