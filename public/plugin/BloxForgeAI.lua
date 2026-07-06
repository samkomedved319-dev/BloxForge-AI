--[[
	BloxForge AI — Roblox Studio Plugin
	------------------------------------
	An NVIDIA-powered AI coding companion for Roblox/Luau development.
	Chat with BloxForge AI right inside Studio, then insert generated
	Luau code into your scripts with one click.

	Install:
	  1. Save this file as BloxForgeAI.lua
	  2. Move it into your Roblox Studio Plugins folder:
	       Windows: %localappdata%\Roblox\Plugins
	       macOS:   ~/Documents/Roblox/Plugins
	  3. Restart Studio. Find "BloxForge AI" in the Plugins tab.

	Configure:
	  - Click the BloxForge button, then the gear icon, to set your
	    BloxForge server URL (the web app that talks to NVIDIA NIM).
	  - Enable HTTP requests in Game Settings > Security for in-game calls.

	Requirements:
	  - HttpService must be enabled (Studio only; plugin always allowed).
--]]

--========================================================================
-- Configuration
--========================================================================

local PLUGIN_NAME = "BloxForge AI"
local PLUGIN_ID = "BloxForgeAI"
local DEFAULT_API_URL = "https://YOUR-BLOXFORGE-APP.example.com/api/plugin/ask"
local DEFAULT_MODEL = "qwen/qwen2.5-coder-32b-instruct"

local MODELS = {
	{ id = "qwen/qwen2.5-coder-32b-instruct", label = "Qwen2.5 Coder 32B" },
	{ id = "deepseek-ai/deepseek-r1", label = "DeepSeek R1" },
	{ id = "nvidia/llama-3.1-nemotron-70b-instruct", label = "Nemotron 70B" },
	{ id = "meta/llama-3.3-70b-instruct", label = "Llama 3.3 70B" },
	{ id = "meta/llama-3.1-405b-instruct", label = "Llama 3.1 405B" },
}

--========================================================================
-- Services
--========================================================================

local Plugin = plugin
local HttpService = game:GetService("HttpService")
local Selection = game:GetService("Selection")
local StudioUIService = game:GetService("StudioService")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")

--========================================================================
-- State
--========================================================================

local apiUrl = Plugin:GetSetting(PLUGIN_ID .. "_ApiUrl") or DEFAULT_API_URL
local currentModel = Plugin:GetSetting(PLUGIN_ID .. "_Model") or DEFAULT_MODEL
local history = {} -- { {role = "user"|"assistant", content = "..."} }

--========================================================================
-- Helpers
--========================================================================

local function warnMsg(msg)
	warn("[BloxForge] " .. tostring(msg))
end

local function jsonEscape(s)
	s = tostring(s)
	s = s:gsub("\\", "\\\\")
	s = s:gsub('"', '\\"')
	s = s:gsub("\n", "\\n")
	s = s:gsub("\r", "\\r")
	s = s:gsub("\t", "\\t")
	return s
end

local function buildJson(payload)
	-- Minimal JSON encoder to avoid relying on HttpService:JSONEncode quirks.
	local parts = {}
	if type(payload) == "table" then
		-- Use HttpService JSONEncode; it's reliable in Studio.
		local ok, encoded = pcall(function()
			return HttpService:JSONEncode(payload)
		end)
		if ok then
			return encoded
		end
	end
	-- Fallback manual encode for { message, model, history }
	local msg = jsonEscape(payload.message or "")
	local model = jsonEscape(payload.model or currentModel)
	local histParts = {}
	for _, h in ipairs(payload.history or {}) do
		table.insert(histParts, string.format('{"role":"%s","content":"%s"}',
			h.role == "assistant" and "assistant" or "user",
			jsonEscape(h.content or "")))
	end
	return string.format(
		'{"message":"%s","model":"%s","history":[%s]}',
		msg, model, table.concat(histParts, ",")
	)
end

local function extractCodeBlocks(text)
	-- Returns a list of { language, code } from fenced ```lang ... ``` blocks.
	local blocks = {}
	for lang, code in text:gmatch("```(%w*)%s*\n(.-)```") do
		table.insert(blocks, { language = lang, code = code })
	end
	return blocks
end

local function getSelectedScriptContent()
	local sel = Selection:Get()
	for _, inst in ipairs(sel) do
		if inst:IsA("Script") or inst:IsA("LocalScript") or inst:IsA("ModuleScript") then
			local src = inst.Source
			if src and #src > 0 then
				return inst, src
			end
		end
	end
	return nil, nil
end

--========================================================================
-- UI Construction
--========================================================================

local widgetInfo = DockWidgetPluginGuiInfo.new(
	Enum.InitialDockState.Right,
	true,   -- initialEnabled
	false,  -- initialEnabledShouldOverrideRestore
	320, 420, -- default size
	280, 320  -- min size
)

local gui = Plugin:CreateDockWidgetPluginGui(PLUGIN_ID, widgetInfo)
gui.Title = PLUGIN_NAME
gui.Name = PLUGIN_ID

-- Colors
local BG = Color3.fromRGB(17, 19, 26)
local SURFACE = Color3.fromRGB(26, 29, 38)
local SURFACE2 = Color3.fromRGB(35, 39, 51)
local ACCENT = Color3.fromRGB(52, 211, 153) -- emerald
local ACCENT_DARK = Color3.fromRGB(16, 122, 95)
local TEXT = Color3.fromRGB(233, 236, 245)
local MUTED = Color3.fromRGB(150, 158, 178)
local USER_BUBBLE = Color3.fromRGB(46, 51, 67)
local AI_BUBBLE = Color3.fromRGB(29, 35, 48)

-- Root frame
local root = Instance.new("Frame")
root.Name = "Root"
root.Size = UDim2.fromScale(1, 1)
root.BackgroundColor3 = BG
root.BorderSizePixel = 0
root.Parent = gui

local header = Instance.new("Frame")
header.Name = "Header"
header.Size = UDim2.new(1, 0, 0, 52)
header.BackgroundColor3 = SURFACE
header.BorderSizePixel = 0
header.Parent = root

local logo = Instance.new("TextLabel")
logo.Name = "Logo"
logo.BackgroundTransparency = 1
logo.Position = UDim2.fromOffset(12, 0)
logo.Size = UDim2.new(0, 200, 1, 0)
logo.Font = Enum.Font.GothamBold
logo.Text = "🔥 BloxForge AI"
logo.TextColor3 = TEXT
logo.TextSize = 15
logo.TextXAlignment = Enum.TextXAlignment.Left
logo.Parent = header

local settingsBtn = Instance.new("TextButton")
settingsBtn.Name = "Settings"
settingsBtn.Size = UDim2.fromOffset(32, 32)
settingsBtn.Position = UDim2.new(1, -40, 0.5, -16)
settingsBtn.BackgroundColor3 = SURFACE2
settingsBtn.Text = "⚙"
settingsBtn.TextColor3 = TEXT
settingsBtn.TextSize = 16
settingsBtn.Font = Enum.Font.Gotham
settingsBtn.AutoButtonColor = true
settingsBtn.Parent = header
local sbCorner = Instance.new("UICorner", settingsBtn)
sbCorner.CornerRadius = UDim.new(0, 8)

-- Chat scroll frame
local scroll = Instance.new("ScrollingFrame")
scroll.Name = "Chat"
scroll.Position = UDim2.new(0, 0, 0, 52)
scroll.Size = UDim2.new(1, 0, 1, -52 - 76)
scroll.BackgroundColor3 = BG
scroll.BorderSizePixel = 0
scroll.ScrollBarThickness = 6
scroll.ScrollBarImageColor3 = SURFACE2
scroll.CanvasSize = UDim2.new(0, 0, 0, 0)
scroll.AutomaticCanvasSize = Enum.AutomaticSize.Y
scroll.Parent = root

local list = Instance.new("UIListLayout")
list.SortOrder = Enum.SortOrder.LayoutOrder
list.Padding = UDim.new(0, 10)
list.HorizontalAlignment = Enum.HorizontalAlignment.Center
list.Parent = scroll

local padding = Instance.new("UIPadding", scroll)
padding.PaddingTop = UDim.new(0, 12)
padding.PaddingBottom = UDim.new(0, 12)
padding.PaddingLeft = UDim.new(0, 8)
padding.PaddingRight = UDim.new(0, 8)

-- Composer
local composer = Instance.new("Frame")
composer.Name = "Composer"
composer.Position = UDim2.new(0, 0, 1, -76)
composer.Size = UDim2.new(1, 0, 0, 76)
composer.BackgroundColor3 = SURFACE
composer.BorderSizePixel = 0
composer.Parent = root

local composerPadding = Instance.new("UIPadding", composer)
composerPadding.PaddingTop = UDim.new(0, 8)
composerPadding.PaddingBottom = UDim.new(0, 8)
composerPadding.PaddingLeft = UDim.new(0, 8)
composerPadding.PaddingRight = UDim.new(0, 8)

local inputBox = Instance.new("TextBox")
inputBox.Name = "Input"
inputBox.Position = UDim2.new(0, 0, 0, 0)
inputBox.Size = UDim2.new(1, -86, 1, 0)
inputBox.BackgroundColor3 = BG
inputBox.TextColor3 = TEXT
inputBox.PlaceholderColor3 = MUTED
inputBox.PlaceholderText = "Ask BloxForge to build, fix or explain Luau…"
inputBox.Text = ""
inputBox.Font = Enum.Font.Gotham
inputBox.TextSize = 13
inputBox.TextWrapped = true
inputBox.ClearTextOnFocus = false
inputBox.TextXAlignment = Enum.TextXAlignment.Left
inputBox.TextYAlignment = Enum.TextYAlignment.Top
inputBox.Parent = composer
local ibCorner = Instance.new("UICorner", inputBox)
ibCorner.CornerRadius = UDim.new(0, 8)
local ibPad = Instance.new("UIPadding", inputBox)
ibPad.PaddingTop = UDim.new(0, 6)
ibPad.PaddingBottom = UDim.new(0, 6)
ibPad.PaddingLeft = UDim.new(0, 8)
ibPad.PaddingRight = UDim.new(0, 8)

local sendBtn = Instance.new("TextButton")
sendBtn.Name = "Send"
sendBtn.Position = UDim2.new(1, -78, 0, 0)
sendBtn.Size = UDim2.new(0, 78, 1, 0)
sendBtn.BackgroundColor3 = ACCENT
sendBtn.TextColor3 = Color3.fromRGB(8, 12, 20)
sendBtn.Text = "Send"
sendBtn.Font = Enum.Font.GothamBold
sendBtn.TextSize = 13
sendBtn.AutoButtonColor = true
sendBtn.Parent = composer
local sndCorner = Instance.new("UICorner", sendBtn)
sndCorner.CornerRadius = UDim.new(0, 8)

--========================================================================
-- Bubble rendering
--========================================================================

local function makeBubble(role, text, order)
	local isUser = role == "user"
	local bubble = Instance.new("Frame")
	bubble.Name = isUser and "UserBubble" or "AIBubble"
	bubble.LayoutOrder = order
	bubble.AutomaticSize = Enum.AutomaticSize.Y
	bubble.Size = UDim2.new(1, -16, 0, 0)
	bubble.BackgroundColor3 = isUser and USER_BUBBLE or AI_BUBBLE
	bubble.BorderSizePixel = 0
	bubble.Parent = scroll

	local corner = Instance.new("UICorner", bubble)
	corner.CornerRadius = UDim.new(0, 10)

	local pad = Instance.new("UIPadding", bubble)
	pad.PaddingTop = UDim.new(0, 8)
	pad.PaddingBottom = UDim.new(0, 8)
	pad.PaddingLeft = UDim.new(0, 10)
	pad.PaddingRight = UDim.new(0, 10)

	local label = Instance.new("TextLabel")
	label.BackgroundTransparency = 1
	label.Size = UDim2.new(1, 0, 0, 0)
	label.AutomaticSize = Enum.AutomaticSize.Y
	label.Text = text
	label.TextColor3 = TEXT
	label.Font = Enum.Font.Gotham
	label.TextSize = 13
	label.TextWrapped = true
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.TextYAlignment = Enum.TextYAlignment.Top
	label.RichText = true
	label.Parent = bubble

	-- Role tag
	local tag = Instance.new("TextLabel")
	tag.BackgroundTransparency = 1
	tag.Size = UDim2.new(1, 0, 0, 14)
	tag.Position = UDim2.fromOffset(0, -2)
	tag.Text = isUser and "You" or "BloxForge AI"
	tag.TextColor3 = isUser and MUTED or ACCENT
	tag.Font = Enum.Font.GothamBold
	tag.TextSize = 10
	tag.TextXAlignment = Enum.TextXAlignment.Left
	tag.Parent = bubble

	return bubble, label
end

local function makeCodeAction(code)
	local wrap = Instance.new("Frame")
	wrap.Name = "CodeAction"
	wrap.LayoutOrder = 999
	wrap.AutomaticSize = Enum.AutomaticSize.Y
	wrap.Size = UDim2.new(1, -16, 0, 0)
	wrap.BackgroundColor3 = SURFACE2
	wrap.BorderSizePixel = 0
	wrap.Parent = scroll
	local c = Instance.new("UICorner", wrap)
	c.CornerRadius = UDim.new(0, 8)

	local pad = Instance.new("UIPadding", wrap)
	pad.PaddingTop = UDim.new(0, 8)
	pad.PaddingBottom = UDim.new(0, 8)
	pad.PaddingLeft = UDim.new(0, 10)
	pad.PaddingRight = UDim.new(0, 10)

	local info = Instance.new("TextLabel")
	info.BackgroundTransparency = 1
	info.Size = UDim2.new(1, 0, 0, 16)
	info.Text = "⚡ Code block ready"
	info.TextColor3 = ACCENT
	info.Font = Enum.Font.GothamBold
	info.TextSize = 11
	info.TextXAlignment = Enum.TextXAlignment.Left
	info.Parent = wrap

	local preview = Instance.new("TextLabel")
	preview.BackgroundTransparency = 1
	preview.Size = UDim2.new(1, 0, 0, 0)
	preview.AutomaticSize = Enum.AutomaticSize.Y
	preview.Text = code:sub(1, 220) .. (#code > 220 and "\n…" or "")
	preview.TextColor3 = MUTED
	preview.Font = Enum.Font.Code
	preview.TextSize = 11
	preview.TextWrapped = true
	preview.TextXAlignment = Enum.TextXAlignment.Left
	preview.TextYAlignment = Enum.TextYAlignment.Top
	preview.Parent = wrap

	local btnRow = Instance.new("Frame")
	btnRow.BackgroundTransparency = 1
	btnRow.Size = UDim2.new(1, 0, 0, 30)
	btnRow.AutomaticSize = Enum.AutomaticSize.Y
	btnRow.Parent = wrap
	local rowLayout = Instance.new("UIListLayout", btnRow)
	rowLayout.FillDirection = Enum.FillDirection.Horizontal
	rowLayout.HorizontalAlignment = Enum.HorizontalAlignment.Right
	rowLayout.Padding = UDim.new(0, 6)

	local insertBtn = Instance.new("TextButton")
	insertBtn.Size = UDim2.new(0, 130, 0, 28)
	insertBtn.BackgroundColor3 = ACCENT
	insertBtn.TextColor3 = Color3.fromRGB(8, 12, 20)
	insertBtn.Text = "Insert as Script"
	insertBtn.Font = Enum.Font.GothamBold
	insertBtn.TextSize = 11
	insertBtn.Parent = btnRow
	local ibc = Instance.new("UICorner", insertBtn)
	ibc.CornerRadius = UDim.new(0, 6)

	local copyBtn = Instance.new("TextButton")
	copyBtn.Size = UDim2.new(0, 80, 0, 28)
	copyBtn.BackgroundColor3 = SURFACE
	copyBtn.TextColor3 = TEXT
	copyBtn.Text = "Copy"
	copyBtn.Font = Enum.Font.Gotham
	copyBtn.TextSize = 11
	copyBtn.Parent = btnRow
	local cbc = Instance.new("UICorner", copyBtn)
	cbc.CornerRadius = UDim.new(0, 6)

	insertBtn.MouseButton1Click:Connect(function()
		local scriptInst = Instance.new("Script")
		scriptInst.Name = "BloxForgeScript"
		scriptInst.Source = code
		-- Place in ServerScriptService by default
		scriptInst.Parent = game:GetService("ServerScriptService")
		Selection:Set({ scriptInst })
		warnMsg("Inserted new Script into ServerScriptService.")
	end)

	copyBtn.MouseButton1Click:Connect(function()
		-- Studio: write to clipboard
		if StudioUIService then
			StudioUIService:CopyToClipboard(code)
		end
	end)
end

local function addMessage(role, text, order)
	local _, label = makeBubble(role, text, order)
	return label
end

--========================================================================
-- Settings dialog
--========================================================================

local settingsDialog = Instance.new("Frame")
settingsDialog.Name = "SettingsDialog"
settingsDialog.Size = UDim2.fromScale(1, 1)
settingsDialog.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
settingsDialog.BackgroundTransparency = 0.4
settingsDialog.Visible = false
settingsDialog.ZIndex = 50
settingsDialog.Parent = root

local card = Instance.new("Frame")
card.Name = "Card"
card.AnchorPoint = Vector2.new(0.5, 0.5)
card.Position = UDim2.fromScale(0.5, 0.5)
card.Size = UDim2.new(1, -24, 0, 320)
card.BackgroundColor3 = SURFACE
card.ZIndex = 51
card.Parent = settingsDialog
local cardCorner = Instance.new("UICorner", card)
cardCorner.CornerRadius = UDim.new(0, 12)

local cardTitle = Instance.new("TextLabel")
cardTitle.BackgroundTransparency = 1
cardTitle.Position = UDim2.fromOffset(16, 14)
cardTitle.Size = UDim2.new(1, -32, 0, 22)
cardTitle.Font = Enum.Font.GothamBold
cardTitle.Text = "BloxForge Settings"
cardTitle.TextColor3 = TEXT
cardTitle.TextSize = 16
cardTitle.TextXAlignment = Enum.TextXAlignment.Left
cardTitle.ZIndex = 52
cardTitle.Parent = card

local urlLabel = Instance.new("TextLabel")
urlLabel.BackgroundTransparency = 1
urlLabel.Position = UDim2.fromOffset(16, 50)
urlLabel.Size = UDim2.new(1, -32, 0, 16)
urlLabel.Font = Enum.Font.Gotham
urlLabel.Text = "BloxForge Server URL (/api/plugin/ask endpoint)"
urlLabel.TextColor3 = MUTED
urlLabel.TextSize = 11
urlLabel.TextXAlignment = Enum.TextXAlignment.Left
urlLabel.ZIndex = 52
urlLabel.Parent = card

local urlInput = Instance.new("TextBox")
urlInput.Position = UDim2.fromOffset(16, 70)
urlInput.Size = UDim2.new(1, -32, 0, 32)
urlInput.BackgroundColor3 = BG
urlInput.TextColor3 = TEXT
urlInput.PlaceholderColor3 = MUTED
urlInput.PlaceholderText = "https://your-app.com/api/plugin/ask"
urlInput.Font = Enum.Font.Code
urlInput.TextSize = 12
urlInput.Text = apiUrl
urlInput.ZIndex = 52
urlInput.Parent = card
local urlCorner = Instance.new("UICorner", urlInput)
urlCorner.CornerRadius = UDim.new(0, 6)

local modelLabel = Instance.new("TextLabel")
modelLabel.BackgroundTransparency = 1
modelLabel.Position = UDim2.fromOffset(16, 116)
modelLabel.Size = UDim2.new(1, -32, 0, 16)
modelLabel.Font = Enum.Font.Gotham
modelLabel.Text = "Model (NVIDIA NIM)"
modelLabel.TextColor3 = MUTED
modelLabel.TextSize = 11
modelLabel.TextXAlignment = Enum.TextXAlignment.Left
modelLabel.ZIndex = 52
modelLabel.Parent = card

local modelInput = Instance.new("TextBox")
modelInput.Position = UDim2.fromOffset(16, 136)
modelInput.Size = UDim2.new(1, -32, 0, 32)
modelInput.BackgroundColor3 = BG
modelInput.TextColor3 = TEXT
modelInput.PlaceholderColor3 = MUTED
modelInput.PlaceholderText = DEFAULT_MODEL
modelInput.Font = Enum.Font.Code
modelInput.TextSize = 12
modelInput.Text = currentModel
modelInput.ZIndex = 52
modelInput.Parent = card
local modelCorner = Instance.new("UICorner", modelInput)
modelCorner.CornerRadius = UDim.new(0, 6)

local hint = Instance.new("TextLabel")
hint.BackgroundTransparency = 1
hint.Position = UDim2.fromOffset(16, 180)
hint.Size = UDim2.new(1, -32, 0, 56)
hint.Font = Enum.Font.Gotham
hint.Text = "Tip: deploy the BloxForge web app and paste its /api/plugin/ask URL here. The plugin talks to NVIDIA NIM models through that server."
hint.TextColor3 = MUTED
hint.TextSize = 11
hint.TextWrapped = true
hint.TextXAlignment = Enum.TextXAlignment.Left
hint.TextYAlignment = Enum.TextYAlignment.Top
hint.ZIndex = 52
hint.Parent = card

local saveBtn = Instance.new("TextButton")
saveBtn.Position = UDim2.new(1, -120, 1, -48)
saveBtn.Size = UDim2.new(0, 104, 0, 32)
saveBtn.BackgroundColor3 = ACCENT
saveBtn.TextColor3 = Color3.fromRGB(8, 12, 20)
saveBtn.Text = "Save"
saveBtn.Font = Enum.Font.GothamBold
saveBtn.TextSize = 13
saveBtn.ZIndex = 52
saveBtn.Parent = card
local saveCorner = Instance.new("UICorner", saveBtn)
saveCorner.CornerRadius = UDim.new(0, 6)

local closeBtn = Instance.new("TextButton")
closeBtn.Position = UDim2.new(0, 16, 1, -48)
closeBtn.Size = UDim2.new(0, 80, 0, 32)
closeBtn.BackgroundColor3 = SURFACE2
closeBtn.TextColor3 = TEXT
closeBtn.Text = "Cancel"
closeBtn.Font = Enum.Font.Gotham
closeBtn.TextSize = 13
closeBtn.ZIndex = 52
closeBtn.Parent = card
local closeCorner = Instance.new("UICorner", closeBtn)
closeCorner.CornerRadius = UDim.new(0, 6)

settingsBtn.MouseButton1Click:Connect(function()
	settingsDialog.Visible = true
end)
closeBtn.MouseButton1Click:Connect(function()
	settingsDialog.Visible = false
end)
saveBtn.MouseButton1Click:Connect(function()
	apiUrl = urlInput.Text
	currentModel = modelInput.Text
	Plugin:SetSetting(PLUGIN_ID .. "_ApiUrl", apiUrl)
	Plugin:SetSetting(PLUGIN_ID .. "_Model", currentModel)
	settingsDialog.Visible = false
end)

--========================================================================
-- Sending messages
--========================================================================

local isBusy = false
local orderCounter = 0

local function send()
	if isBusy then return end
	local text = inputBox.Text
	if text == "" then return end

	-- Gather selected script context
	local _, selSrc = getSelectedScriptContent()
	local context = selSrc or ""

	orderCounter = orderCounter + 1
	addMessage("user", text, orderCounter)
	table.insert(history, { role = "user", content = text })
	inputBox.Text = ""

	orderCounter = orderCounter + 1
	local typingLabel = addMessage("assistant", "Forging…", orderCounter)

	isBusy = true
	sendBtn.Text = "…"
	sendBtn.BackgroundColor3 = ACCENT_DARK

	local payload = {
		message = text,
		model = currentModel,
		history = history,
		context = context,
	}

	local body = buildJson(payload)

	local ok, response = pcall(function()
		return HttpService:PostAsync(
			apiUrl,
			body,
			Enum.HttpContentType.ApplicationJson,
			false
		)
	end)

	isBusy = false
	sendBtn.Text = "Send"
	sendBtn.BackgroundColor3 = ACCENT

	if not ok then
		typingLabel.Text = "⚠ Request failed: " .. tostring(response)
		typingLabel.TextColor3 = Color3.fromRGB(248, 113, 113)
		return
	end

	local parsedOk, data = pcall(function()
		return HttpService:JSONDecode(response)
	end)

	if not parsedOk or not data or not data.ok then
		local err = (data and data.error) or "Invalid server response"
		typingLabel.Text = "⚠ " .. tostring(err)
		typingLabel.TextColor3 = Color3.fromRGB(248, 113, 113)
		return
	end

	local reply = data.reply or ""
	typingLabel.Text = reply
	table.insert(history, { role = "assistant", content = reply })

	-- Attach code-action widgets for each code block
	local blocks = extractCodeBlocks(reply)
	for _, b in ipairs(blocks) do
		orderCounter = orderCounter + 1
		makeCodeAction(b.code)
	end

	-- Auto-scroll to bottom
	task.defer(function()
		scroll.CanvasPosition = Vector2.new(0, scroll.CanvasSize.Y.Offset)
	end)
end

sendBtn.MouseButton1Click:Connect(send)
inputBox.FocusLost:Connect(function(enter)
	if enter then send() end
end)

--========================================================================
-- Toolbar button
--========================================================================

local toolbar = Plugin:CreateToolbar("BloxForge AI")
local toggleBtn = toolbar:CreateButton(
	"BloxForge AI",
	"Open the BloxForge AI assistant",
	"rbxassetid://0"
)
toggleBtn.ClickableWhenViewportHidden = true

toggleBtn.Click:Connect(function()
	gui.Enabled = not gui.Enabled
end)

-- Welcome message
orderCounter = orderCounter + 1
addMessage("assistant",
	"👋 Welcome to **BloxForge AI** — your NVIDIA-powered Roblox coding companion.\n\n" ..
	"Select a script in the Explorer and ask me to build, fix, or explain it. " ..
	"Click ⚙ to point me at your BloxForge server.",
	orderCounter
)

warnMsg("BloxForge AI plugin loaded.")
