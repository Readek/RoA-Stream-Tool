local obs = obslua
local textFile, interval, debug -- OBS settings
local activeId = 0 -- active timer id
local current = {} -- current values to compare with text file

source_trail = ""
source_bg	= ""
source_icon = ""
source_char = ""

source_vs_tbg = ""

source_masterpath = ""

previousP1TPath = ""
previousP1CPath = ""
previousP1BPath = ""
previousP1IPath = ""
previousColor = ""
previousScore = ""

-- this will find a source to change visivility later
-- im hardcoding this thing because the script window would get too cluttered otherwise
-- this is just for the score ticks of the overlay
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
local function update(character, skin, color, score)
	if debug then obs.script_log(obs.LOG_INFO, string.format("%s has changed to %s with the player color %s and the score of %s.", character, skin, color, score)) end

	local cd = obs.calldata_create()

	local masterpath = source_masterpath

	--vs screen animated trail
	if skin == "LoA" then
		P1TPath = masterpath .. "Trails/" .. character .. "/LoA " .. color .. ".mov"
	elseif skin == "Tuxedo" then
		P1TPath = masterpath .. "Trails/" .. character .. "/Tuxedo " .. color .. ".mov"
	elseif skin == "Ragnir" then
		P1TPath = masterpath .. "Trails/" .. character .. "/Ragnir " .. color .. ".mov"
	elseif skin == "Panda" and character == "Etalus" then
		P1TPath = masterpath .. "Trails/" .. character .. "/Panda " .. color .. ".mov"
	else
		P1TPath = masterpath .. "Trails/" .. character .. "/Normal " .. color .. ".mov"
	end

	--vs screen character image
	P1CPath = masterpath .. "Skins/" .. character .. "/" .. skin .. ".mov"

	--vs screen background video
	if skin == "Ragnir" then
		P1BPath = masterpath .. "Backgrounds/" .. skin .. ".mp4"
	else
		P1BPath = masterpath .. "Backgrounds/" .. character .. ".mp4"
	end
	
	--game overlay character icon
	P1IPath = masterpath .. "Icons/" .. character .. "/" .. skin .. ".mov"
	

	--vs text background color
	P1VS_TBG_Path = masterpath .. "Overlay/VS Overlay/VS Overlay " .. color .. ".mov"
	
	--vs gradient color
	P1VS_Grad_Path = masterpath .. "Overlay/VS Overlay/VS Grad " .. color .. ".png"

	--game overlay color
	P1OC_Path = masterpath .. "Overlay/Colors/" .. color .. ".png"


	--now we change some stuff in obs
	if P1TPath ~= previousP1TPath or color ~= previousColor then
		if debug then obs.script_log(obs.LOG_INFO, string.format("Changed P1 Trail")) end
		previousP1TPath = P1TPath
		local P1Trail = obs.obs_get_source_by_name(source_trail)
		if P1Trail ~= nil then
			local settings = obs.obs_data_create()
			P1Trail_id = obs.obs_source_get_id(P1Trail)
			if P1Trail_id == "ffmpeg_source" then
				obs.obs_data_set_string(settings, "local_file", P1TPath)
				obs.obs_data_set_bool(settings, "is_local_file", true)
				obs.obs_source_update(P1Trail, settings)
			end
			obs.obs_data_release(settings)
			obs.obs_source_release(P1Trail)
		end
	end
	
	if P1BPath ~= previousP1BPath then
		if debug then obs.script_log(obs.LOG_INFO, string.format("Changed P1 Background")) end
		previousP1BPath = P1BPath
		local P1BG = obs.obs_get_source_by_name(source_bg)
		if P1BG ~= nil then
			local settings = obs.obs_data_create()
			P1BG_id = obs.obs_source_get_id(P1BG)
			if P1BG_id == "ffmpeg_source" then
				obs.obs_data_set_string(settings, "local_file", P1BPath)
				obs.obs_data_set_bool(settings, "is_local_file", true)
				obs.obs_source_update(P1BG, settings)
			end
			obs.obs_data_release(settings)
			obs.obs_source_release(P1BG)
		end
	end

	if P1IPath ~= previousP1IPath then
		if debug then obs.script_log(obs.LOG_INFO, string.format("Changed P1 Overlay Icon")) end
		previousP1IPath = P1IPath
		local P1icon = obs.obs_get_source_by_name(source_icon)
		if P1icon ~= nil then
			local settings = obs.obs_data_create()
			P1icon_id = obs.obs_source_get_id(P1icon)
			if P1icon_id == "ffmpeg_source" then
				obs.obs_data_set_string(settings, "local_file", P1IPath)
				obs.obs_data_set_bool(settings, "is_local_file", true)
				obs.obs_source_update(P1icon, settings)
			end
			obs.obs_data_release(settings)
			obs.obs_source_release(P1icon)
		end
	end

	if P1CPath ~= previousP1CPath then
		if debug then obs.script_log(obs.LOG_INFO, string.format("Changed P1 VS Skin")) end
		previousP1CPath = P1CPath
		local P1Char = obs.obs_get_source_by_name(source_char)
		if P1Char ~= nil then
			local settings = obs.obs_data_create()
			P1Char_id = obs.obs_source_get_id(P1Char)
			if P1Char_id == "ffmpeg_source" then
				obs.obs_data_set_string(settings, "local_file", P1CPath)
				obs.obs_data_set_bool(settings, "is_local_file", true)
				obs.obs_source_update(P1Char, settings)
			end
			obs.obs_data_release(settings)
			obs.obs_source_release(P1Char)
		end
	end

	-- changing colors of both the VS screen and the game overlay
	if color ~= previousColor then
		if debug then obs.script_log(obs.LOG_INFO, string.format("Changed P1 Colors")) end
		
		local P1VS_TBG = obs.obs_get_source_by_name(source_vs_tbg)
		if P1VS_TBG ~= nil then
			local settings = obs.obs_data_create()
			P1VS_TBG_id = obs.obs_source_get_id(P1VS_TBG)
			if P1VS_TBG_id == "ffmpeg_source" then
				obs.obs_data_set_string(settings, "local_file", P1VS_TBG_Path)
				obs.obs_data_set_bool(settings, "is_local_file", true)
				obs.obs_source_update(P1VS_TBG, settings)
			end
			obs.obs_data_release(settings)
			obs.obs_source_release(P1VS_TBG)
		end

		local P1VS_Grad = obs.obs_get_source_by_name(source_vs_grad)
		if P1VS_Grad ~= nil then
			local settings = obs.obs_data_create()
			P1VS_Grad_id = obs.obs_source_get_id(P1VS_Grad)
			if P1VS_Grad_id == "ffmpeg_source" then
				obs.obs_data_set_string(settings, "local_file", P1VS_Grad_Path)
				obs.obs_data_set_bool(settings, "is_local_file", true)
				obs.obs_source_update(P1VS_Grad, settings)
			end
			obs.obs_data_release(settings)
			obs.obs_source_release(P1VS_Grad)
		end

		local P1OC = obs.obs_get_source_by_name(source_oc)
		if P1OC ~= nil then
			local settings = obs.obs_data_create()
			P1OC_id = obs.obs_source_get_id(P1OC)
			obs.obs_data_set_string(settings, "file", P1OC_Path)
			obs.obs_data_set_bool(settings, "is_local_file", true)
			obs.obs_source_update(P1OC, settings)
			obs.obs_data_release(settings)
			obs.obs_source_release(P1OC)
		end

		previousColor = color
	end

	-- game overlay score ticks
	if score ~= previousScore then
		if debug then obs.script_log(obs.LOG_INFO, string.format("Changed P1 Score")) end
		
		local winTick1bo5 = findSceneItem("SCENE Overlay Bo5", "Win Tick P1 Bo5 1")
		local winTick2bo5 = findSceneItem("SCENE Overlay Bo5", "Win Tick P1 Bo5 2")
		local winTick3bo5 = findSceneItem("SCENE Overlay Bo5", "Win Tick P1 Bo5 3")

		local winTick1bo3 = findSceneItem("SCENE Overlay Bo3", "Win Tick P1 Bo3 1")
		local winTick2bo3 = findSceneItem("SCENE Overlay Bo3", "Win Tick P1 Bo3 2")

		-- reminder that the win ticks are actually the grey ticks (so the no score ticks)
		if score == "0" then
			obs.obs_sceneitem_set_visible(winTick1bo5, true)
			obs.obs_sceneitem_set_visible(winTick2bo5, true)
			obs.obs_sceneitem_set_visible(winTick3bo5, true)

			obs.obs_sceneitem_set_visible(winTick1bo3, true)
			obs.obs_sceneitem_set_visible(winTick2bo3, true)
		elseif score == "1" then
			obs.obs_sceneitem_set_visible(winTick1bo5, false)
			obs.obs_sceneitem_set_visible(winTick2bo5, true)
			obs.obs_sceneitem_set_visible(winTick3bo5, true)

			obs.obs_sceneitem_set_visible(winTick1bo3, false)
			obs.obs_sceneitem_set_visible(winTick2bo3, true)
		elseif score == "2" then
			obs.obs_sceneitem_set_visible(winTick1bo5, false)
			obs.obs_sceneitem_set_visible(winTick2bo5, false)
			obs.obs_sceneitem_set_visible(winTick3bo5, true)

			obs.obs_sceneitem_set_visible(winTick1bo3, false)
			obs.obs_sceneitem_set_visible(winTick2bo3, false)
		elseif score == "3" then
			obs.obs_sceneitem_set_visible(winTick1bo5, false)
			obs.obs_sceneitem_set_visible(winTick2bo5, false)
			obs.obs_sceneitem_set_visible(winTick3bo5, false)
		end

		previousScore = score
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
			local character, skin, color, score = line:match("^([^=]+)%=(.+)=(.+)=(.+)$")
			if character and skin and color then
				-- success : now check if the value has changed
                if current["skin"] ~= skin or current["character"] ~= character or current["color"] ~= color or current["score"] ~= score then
                    current["skin"] = skin
					current["character"] = character
					current["color"] = color
					current["score"] = score
					update(character, skin, color, score)
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

	source_masterpath = obs.obs_data_get_string(settings, "masterpath")

	source_trail = obs.obs_data_get_string(settings, "P1Trail")
	source_bg = obs.obs_data_get_string(settings, "P1BG")
	source_icon = obs.obs_data_get_string(settings, "P1icon")
	source_char = obs.obs_data_get_string(settings, "P1Char")

	source_oc = obs.obs_data_get_string(settings, "P1OC")
	source_vs_tbg = obs.obs_data_get_string(settings, "P1VS_TBG")
	source_vs_grad = obs.obs_data_get_string(settings, "P1VS_Grad")

	init()
end


-- return description shown to user
function script_description()
	return "Checks a txt file to change the paths of some sources.\n\nText file should contain: character=skin=color=score\n\nMasterpath example:\nC:/RoA Stream Controller/OBS Resources/"
end


-- define properties that user can change
function script_properties()
	local props = obs.obs_properties_create()

	obs.obs_properties_add_path(props, "textFile", "Text File Character P1", obs.OBS_PATH_FILE, "", nil)
	obs.obs_properties_add_int(props, "interval", "Interval (ms)", 1000, 20000, 500)
	obs.obs_properties_add_bool(props, "debug", "Debug")
	
	obs.obs_properties_add_text(props, "masterpath", "Path to OBS Resources", obs.OBS_COMBO_FORMAT_STRING)
	
	local p = obs.obs_properties_add_list(props, "P1Trail", "VS Trail P1", obs.OBS_COMBO_TYPE_EDITABLE, obs.OBS_COMBO_FORMAT_STRING)
	local sources = obs.obs_enum_sources()
	if sources ~= nil then
		for _, source in ipairs(sources) do
			source_id = obs.obs_source_get_id(source)
			if source_id == "ffmpeg_source" then
				local name = obs.obs_source_get_name(source)
				obs.obs_property_list_add_string(p, name, name)
			else
				-- obs.script_log(obs.LOG_INFO, source_id)
			end
		end
	end

	local p = obs.obs_properties_add_list(props, "P1BG", "VS BG P1", obs.OBS_COMBO_TYPE_EDITABLE, obs.OBS_COMBO_FORMAT_STRING)
	local sources = obs.obs_enum_sources()
	if sources ~= nil then
		for _, source in ipairs(sources) do
			source_id = obs.obs_source_get_id(source)
			if source_id == "ffmpeg_source" then
				local name = obs.obs_source_get_name(source)
				obs.obs_property_list_add_string(p, name, name)
			else
				-- obs.script_log(obs.LOG_INFO, source_id)
			end
		end
	end

	local p = obs.obs_properties_add_list(props, "P1Char", "VS Character P1", obs.OBS_COMBO_TYPE_EDITABLE, obs.OBS_COMBO_FORMAT_STRING)
	local sources = obs.obs_enum_sources()
	if sources ~= nil then
		for _, source in ipairs(sources) do
			source_id = obs.obs_source_get_id(source)
			if source_id == "ffmpeg_source" then
				local name = obs.obs_source_get_name(source)
				obs.obs_property_list_add_string(p, name, name)
			else
				-- obs.script_log(obs.LOG_INFO, source_id)
			end
		end
	end

	local p = obs.obs_properties_add_list(props, "P1icon", "Overlay Icon P1", obs.OBS_COMBO_TYPE_EDITABLE, obs.OBS_COMBO_FORMAT_STRING)
	local sources = obs.obs_enum_sources()
	if sources ~= nil then
		for _, source in ipairs(sources) do
			source_id = obs.obs_source_get_id(source)
			if source_id == "ffmpeg_source" then
				local name = obs.obs_source_get_name(source)
				obs.obs_property_list_add_string(p, name, name)
			else
				-- obs.script_log(obs.LOG_INFO, source_id)
			end
		end
	end


	local p = obs.obs_properties_add_list(props, "P1OC", "P1 Overlay Color", obs.OBS_COMBO_TYPE_EDITABLE, obs.OBS_COMBO_FORMAT_STRING)
	local sources = obs.obs_enum_sources()
	if sources ~= nil then
		for _, source in ipairs(sources) do
			source_id = obs.obs_source_get_id(source)
			if source_id == "image_source" then
				local name = obs.obs_source_get_name(source)
				obs.obs_property_list_add_string(p, name, name)
			else
				-- obs.script_log(obs.LOG_INFO, source_id)
			end
		end
	end

	local p = obs.obs_properties_add_list(props, "P1VS_TBG", "VS P1 Text BG", obs.OBS_COMBO_TYPE_EDITABLE, obs.OBS_COMBO_FORMAT_STRING)
	local sources = obs.obs_enum_sources()
	if sources ~= nil then
		for _, source in ipairs(sources) do
			source_id = obs.obs_source_get_id(source)
			if source_id == "ffmpeg_source" then
				local name = obs.obs_source_get_name(source)
				obs.obs_property_list_add_string(p, name, name)
			else
				-- obs.script_log(obs.LOG_INFO, source_id)
			end
		end
	end

	local p = obs.obs_properties_add_list(props, "P1VS_Grad", "VS P1 Gradient", obs.OBS_COMBO_TYPE_EDITABLE, obs.OBS_COMBO_FORMAT_STRING)
	local sources = obs.obs_enum_sources()
	if sources ~= nil then
		for _, source in ipairs(sources) do
			source_id = obs.obs_source_get_id(source)
			if source_id == "ffmpeg_source" then
				local name = obs.obs_source_get_name(source)
				obs.obs_property_list_add_string(p, name, name)
			else
				-- obs.script_log(obs.LOG_INFO, source_id)
			end
		end
	end

	
	obs.source_list_release(sources)
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
