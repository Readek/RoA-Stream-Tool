local obs = obslua
local textFile, interval, debug -- OBS settings
local activeId = 0 -- active timer id
local current = {} -- current values to compare with text file

source_gameScene = ""


-- find a source to change visivility later
-- im dirty searching here because scene sources wont show in the dropdown list
local function findSceneItem(sceneName, itemName)
    local source = obs.obs_get_source_by_name(sceneName)
    local item = nil
    if source then
        local scene = obs.obs_scene_from_source(source)
        if scene then
            item = obs.obs_scene_find_source(scene, itemName)
            if not item and groupName then
                local group = obs.obs_scene_find_source(scene)
                if group then 
                    scene = obs.obs_sceneitem_group_get_scene(group)
                    if scene then
                        item = obs.obs_scene_find_source(scene, itemName)
                    end
                end
            end
        end
        obs.obs_source_release(source)
    end
    return item
end

-- called when an update to the text file is detected
local function update(bo, gfP1, gfP2)
	if debug then obs.script_log(obs.LOG_INFO, string.format("Set has changed to %s. P1 is %s. P2 is %s.", bo, gfP1, gfP2)) end

	-- change the overlay scene visivility depending if bo3 or bo5
	local gameScene = source_gameScene
	if gameScene ~= nil then

		local itemBo5 = findSceneItem(gameScene, "SCENE Overlay Bo5")
		local itemBo3 = findSceneItem(gameScene, "SCENE Overlay Bo3")

		if bo == "Bo3" then
			obs.obs_sceneitem_set_visible(itemBo5, false)
			obs.obs_sceneitem_set_visible(itemBo3, true)
		elseif bo == "Bo5" then
			obs.obs_sceneitem_set_visible(itemBo5, true)
			obs.obs_sceneitem_set_visible(itemBo3, false)
		end
	else
		if debug then obs.script_log(obs.LOG_INFO, string.format("...something went wrong.")) end
	end

	-- if grand finals, change the visivility of the player stuff on the overlay
	local p1GFBG = findSceneItem("SCENE Overlay Bo5", "Overlay W-L BG P1")
	local p1GFW = findSceneItem("SCENE Overlay Bo5", "Overlay [W] P1")
	local p1GFL = findSceneItem("SCENE Overlay Bo5", "Overlay [L] P1")

	local p2GFBG = findSceneItem("SCENE Overlay Bo5", "Overlay W-L BG P2")
	local p2GFW = findSceneItem("SCENE Overlay Bo5", "Overlay [W] P2")
	local p2GFL = findSceneItem("SCENE Overlay Bo5", "Overlay [L] P2")

	if gfP1 == "W" then
		obs.obs_sceneitem_set_visible(p1GFBG, true)
		obs.obs_sceneitem_set_visible(p1GFW, true)
		obs.obs_sceneitem_set_visible(p1GFL, false)
	elseif gfP1 == "L" then
		obs.obs_sceneitem_set_visible(p1GFBG, true)
		obs.obs_sceneitem_set_visible(p1GFW, false)
		obs.obs_sceneitem_set_visible(p1GFL, true)
	end

	if gfP2 == "W" then
		obs.obs_sceneitem_set_visible(p2GFBG, true)
		obs.obs_sceneitem_set_visible(p2GFW, true)
		obs.obs_sceneitem_set_visible(p2GFL, false)
	elseif gfP2 == "L" then
		obs.obs_sceneitem_set_visible(p2GFBG, true)
		obs.obs_sceneitem_set_visible(p2GFW, false)
		obs.obs_sceneitem_set_visible(p2GFL, true)
	end

	if gfP1 == "Nada" or gfP2 == "Nada" then
		obs.obs_sceneitem_set_visible(p1GFBG, false)
		obs.obs_sceneitem_set_visible(p1GFW, false)
		obs.obs_sceneitem_set_visible(p1GFL, false)

		obs.obs_sceneitem_set_visible(p2GFBG, false)
		obs.obs_sceneitem_set_visible(p2GFW, false)
		obs.obs_sceneitem_set_visible(p2GFL, false)
	end
end


local function checkFile(id)
	-- if the script has reloaded then stop any old timers
	if id < activeId then
		obs.remove_current_callback()
		return
	end

	if debug then obs.script_log(obs.LOG_INFO, string.format("(%d) Checking text file...(%d)", id, interval)) end
	local f, err = io.open(textFile, "rb")
	if f then
		local line
		for line in f:lines() do
			-- check for key=value
			local bo, gfP1, gfP2 = line:match("^([^=]+)%=(.+)=(.+)$")
			if bo and gfP1 and gfP2 then
				-- success : now check if the value has changed
				if current["bo"] ~= bo or current["gfP1"] ~= gfP1 or current["gfP2"] ~= gfP2 then
					current["bo"] = bo
                    current["gfP1"] = gfP1
					current["gfP2"] = gfP2
					update(bo, gfP1, gfP2)
				end
			end
		end
		f:close()
	else
		if debug then obs.script_log(obs.LOG_INFO, string.format("Error reading text file : ", err)) end
	end
end


local function init()
	-- increase the timer id - old timers will be cancelled
	activeId = activeId + 1

	-- only proceed if there is a text file selected
	if not textFile then return nil end

	-- start the timer to check the text file
	local id = activeId
	obs.timer_add(function() checkFile(id) end, interval)
	obs.script_log(obs.LOG_INFO, string.format("Textesterone started"))
end


----------------------------------------------------------


-- called on startup
function script_load(settings)
end


-- called on unload
function script_unload()
end


-- called when settings changed
function script_update(settings)
	textFile = obs.obs_data_get_string(settings, "textFile")
	interval = obs.obs_data_get_int(settings, "interval")
	debug = obs.obs_data_get_bool(settings, "debug")

	source_gameScene = obs.obs_data_get_string(settings, "gameScene")
	
	init()
end


-- return description shown to user
function script_description()
	return "Checks a txt file to change the visibility of specific scene sources.\n\nText file should contain: Set=P1info=P2info\n\nScene sources should be named:\nSCENE Overlay Bo5\nSCENE Overlay Bo3"
end


-- define properties that user can change
function script_properties()
	local props = obs.obs_properties_create()

	obs.obs_properties_add_path(props, "textFile", "Set Info text file", obs.OBS_PATH_FILE, "", nil)
	obs.obs_properties_add_int(props, "interval", "Interval (ms)", 1000, 20000, 500)
	obs.obs_properties_add_bool(props, "debug", "Debug")
	
	obs.obs_properties_add_text(props, "gameScene", "Name of the Game scene", obs.OBS_COMBO_FORMAT_STRING)
	-- i wanted to add here the names of the scene sources but i couldnt get it to work...

	return props
end


-- set default values
function script_defaults(settings)
	obs.obs_data_set_default_string(settings, "textFile", "")
	obs.obs_data_set_default_int(settings, "interval", 1000)
	obs.obs_data_set_default_bool(settings, "debug", false)
end


-- save additional data not set by user
function script_save(settings)
end
