--[[
        BloxForge AI — Roblox Studio Connector
        ---------------------------------------
        A lightweight bridge between Roblox Studio and the BloxForge AI web app.

        The AI chat lives in your browser. This plugin does two things:
          1. Reports the script you currently have selected in Studio to the web app
             (so BloxForge can see your code as context).
          2. Receives "insert this code" commands from the web app and creates a new
             Script in ServerScriptService with the generated Luau.

        There is NO chat UI inside Studio — the plugin is just a connector.

        Setup:
          1. Save this file as BloxForgeAI.lua in your Studio Plugins folder
             (Windows: %localappdata%\Roblox\Plugins · macOS: ~/Documents/Roblox/Plugins).
          2. Restart Roblox Studio.
          3. Open the BloxForge web app, click "Connect Studio", and copy the
             pairing code.
          4. Open the BloxForge toolbar button in Studio, paste your server URL +
             pairing code, and click Connect.

        Requirements: HttpService (enabled by default for plugins).
--]]

--========================================================================
-- Configuration
--========================================================================

local PLUGIN_NAME = "BloxForge Connector"
local PLUGIN_ID = "BloxForgeConnector"
local DEFAULT_API_URL = "" -- user must enter their BloxForge server URL
local HEARTBEAT_INTERVAL = 3 -- seconds between heartbeats

--========================================================================
-- Services
--========================================================================

local Plugin = plugin
local HttpService = game:GetService("HttpService")
local Selection = game:GetService("Selection")
local ServerScriptService = game:GetService("ServerScriptService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

--========================================================================
-- State
--========================================================================

local apiUrl = Plugin:GetSetting(PLUGIN_ID .. "_ApiUrl") or DEFAULT_API_URL
local pairingCode = ""
local connected = false
local heartbeatRunning = false
local lastScriptRef = nil
local lastContextHash = ""

--========================================================================
-- Helpers
--========================================================================

local function warnMsg(msg)
        warn("[BloxForge Connector] " .. tostring(msg))
end

local function httpPost(url, payload, timeout)
        timeout = timeout or 15
        local body = HttpService:JSONEncode(payload)
        local ok, response = pcall(function()
                -- RequestAsync takes a single options table and supports Timeout.
                -- (PostAsync's 5th arg is `headers`, NOT timeout — passing a number
                -- there throws "headers value must be a dictionary!")
                return HttpService:RequestAsync({
                        Url = url,
                        Method = "POST",
                        Headers = { ["Content-Type"] = "application/json" },
                        Body = body,
                        Timeout = timeout,
                })
        end)
        if ok and typeof(response) == "table" then
                if response.Success then
                        return true, response.Body
                end
                -- HTTP error response — surface the body so JSON decode + error label work
                return false, "HTTP " .. tostring(response.StatusCode) .. ": " .. tostring(response.Body or "")
        end
        return ok, response
end

local function httpGet(url, timeout)
        timeout = timeout or 15
        local ok, response = pcall(function()
                return HttpService:RequestAsync({
                        Url = url,
                        Method = "GET",
                        Timeout = timeout,
                })
        end)
        if ok and typeof(response) == "table" then
                if response.Success then
                        return true, response.Body
                end
                return false, "HTTP " .. tostring(response.StatusCode) .. ": " .. tostring(response.Body or "")
        end
        return ok, response
end

local function getSelectedScript()
        local sel = Selection:Get()
        for _, inst in ipairs(sel) do
                if inst:IsA("Script") or inst:IsA("LocalScript") or inst:IsA("ModuleScript") then
                        return inst
                end
        end
        return nil
end

local function buildContext()
        local scriptInst = getSelectedScript()
        if not scriptInst then
                return nil
        end
        local src = scriptInst.Source or ""
        if #src == 0 then
                return nil
        end
        -- Build a readable path: Service.Folder.Script
        local parts = {}
        local node = scriptInst
        while node and node ~= game do
                table.insert(parts, 1, node.Name)
                node = node.Parent
        end
        return {
                scriptName = scriptInst.Name,
                scriptPath = table.concat(parts, "."),
                source = src:sub(1, 8000),
                lineCount = select(2, src:gsub("\n", "\n")) + 1,
                updatedAt = os.time(),
        }
end

local function contextHash(ctx)
        if not ctx then return "" end
        return ctx.scriptPath .. ":" .. #ctx.source .. ":" .. (ctx.source:sub(-64) or "")
end

--========================================================================
-- UI Construction
--========================================================================

local widgetInfo = DockWidgetPluginGuiInfo.new(
        Enum.InitialDockState.Right,
        true,   -- initialEnabled
        false,  -- initialEnabledShouldOverrideRestore
        320, 380,
        260, 320
)

local gui = Plugin:CreateDockWidgetPluginGui(PLUGIN_ID, widgetInfo)
gui.Title = PLUGIN_NAME
gui.Name = PLUGIN_ID

-- Colors
local BG = Color3.fromRGB(17, 19, 26)
local SURFACE = Color3.fromRGB(26, 29, 38)
local SURFACE2 = Color3.fromRGB(35, 39, 51)
local ACCENT = Color3.fromRGB(52, 211, 153)
local ACCENT_DARK = Color3.fromRGB(16, 122, 95)
local TEXT = Color3.fromRGB(233, 236, 245)
local MUTED = Color3.fromRGB(150, 158, 178)
local RED = Color3.fromRGB(248, 113, 113)

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

local title = Instance.new("TextLabel")
title.BackgroundTransparency = 1
title.Position = UDim2.fromOffset(14, 0)
title.Size = UDim2.new(1, -60, 1, 0)
title.Font = Enum.Font.GothamBold
title.Text = "BloxForge Connector"
title.TextColor3 = TEXT
title.TextSize = 15
title.TextXAlignment = Enum.TextXAlignment.Left
title.Parent = header

local statusDot = Instance.new("Frame")
statusDot.Size = UDim2.fromOffset(8, 8)
statusDot.Position = UDim2.new(1, -22, 0.5, -4)
statusDot.BackgroundColor3 = MUTED
statusDot.BorderSizePixel = 0
statusDot.Parent = header
local dotCorner = Instance.new("UICorner", statusDot)
dotCorner.CornerRadius = UDim.new(1, 0)

local content = Instance.new("Frame")
content.Name = "Content"
content.Position = UDim2.new(0, 0, 0, 52)
content.Size = UDim2.new(1, 0, 1, -52)
content.BackgroundColor3 = BG
content.BorderSizePixel = 0
content.Parent = root

local contentPad = Instance.new("UIPadding", content)
contentPad.PaddingTop = UDim.new(0, 16)
contentPad.PaddingBottom = UDim.new(0, 16)
contentPad.PaddingLeft = UDim.new(0, 16)
contentPad.PaddingRight = UDim.new(0, 16)

-- Disconnected view
local disconnectedView = Instance.new("Frame")
disconnectedView.Name = "Disconnected"
disconnectedView.Size = UDim2.fromScale(1, 1)
disconnectedView.BackgroundTransparency = 1
disconnectedView.Visible = true
disconnectedView.Parent = content

local info = Instance.new("TextLabel")
info.BackgroundTransparency = 1
info.Position = UDim2.fromOffset(0, 0)
info.Size = UDim2.new(1, 0, 0, 60)
info.Font = Enum.Font.Gotham
info.Text = "Connect this Studio session to the BloxForge web app. The AI chat stays in your browser — this plugin just syncs your selected script and inserts generated code."
info.TextColor3 = MUTED
info.TextSize = 12
info.TextWrapped = true
info.TextXAlignment = Enum.TextXAlignment.Left
info.TextYAlignment = Enum.TextYAlignment.Top
info.Parent = disconnectedView

local urlLabel = Instance.new("TextLabel")
urlLabel.BackgroundTransparency = 1
urlLabel.Position = UDim2.fromOffset(0, 74)
urlLabel.Size = UDim2.new(1, 0, 0, 14)
urlLabel.Font = Enum.Font.Gotham
urlLabel.Text = "BLOXFORGE SERVER URL"
urlLabel.TextColor3 = MUTED
urlLabel.TextSize = 10
urlLabel.TextXAlignment = Enum.TextXAlignment.Left
urlLabel.Parent = disconnectedView

local urlInput = Instance.new("TextBox")
urlInput.Position = UDim2.fromOffset(0, 92)
urlInput.Size = UDim2.new(1, 0, 0, 32)
urlInput.BackgroundColor3 = SURFACE
urlInput.TextColor3 = TEXT
urlInput.PlaceholderColor3 = MUTED
urlInput.PlaceholderText = "https://your-app.com/api/studio"
urlInput.Font = Enum.Font.Code
urlInput.TextSize = 12
urlInput.Text = apiUrl
urlInput.ClearTextOnFocus = false
urlInput.Parent = disconnectedView
local urlCorner = Instance.new("UICorner", urlInput)
urlCorner.CornerRadius = UDim.new(0, 6)

local codeLabel = Instance.new("TextLabel")
codeLabel.BackgroundTransparency = 1
codeLabel.Position = UDim2.fromOffset(0, 134)
codeLabel.Size = UDim2.new(1, 0, 0, 14)
codeLabel.Font = Enum.Font.Gotham
codeLabel.Text = "PAIRING CODE (from the web app)"
codeLabel.TextColor3 = MUTED
codeLabel.TextSize = 10
codeLabel.TextXAlignment = Enum.TextXAlignment.Left
codeLabel.Parent = disconnectedView

local codeInput = Instance.new("TextBox")
codeInput.Position = UDim2.fromOffset(0, 152)
codeInput.Size = UDim2.new(1, 0, 0, 32)
codeInput.BackgroundColor3 = SURFACE
codeInput.TextColor3 = TEXT
codeInput.PlaceholderColor3 = MUTED
codeInput.PlaceholderText = "ABC-123"
codeInput.Font = Enum.Font.Code
codeInput.TextSize = 14
codeInput.ClearTextOnFocus = false
codeInput.Parent = disconnectedView
local codeCorner = Instance.new("UICorner", codeInput)
codeCorner.CornerRadius = UDim.new(0, 6)

local connectBtn = Instance.new("TextButton")
connectBtn.Position = UDim2.fromOffset(0, 196)
connectBtn.Size = UDim2.new(1, 0, 0, 36)
connectBtn.BackgroundColor3 = ACCENT
connectBtn.TextColor3 = Color3.fromRGB(8, 12, 20)
connectBtn.Text = "Connect"
connectBtn.Font = Enum.Font.GothamBold
connectBtn.TextSize = 14
connectBtn.Parent = disconnectedView
local cbCorner = Instance.new("UICorner", connectBtn)
cbCorner.CornerRadius = UDim.new(0, 6)

-- Visible error label (so users see feedback without opening Output)
local errorLabel = Instance.new("TextLabel")
errorLabel.Name = "ErrorLabel"
errorLabel.BackgroundTransparency = 1
errorLabel.Position = UDim2.fromOffset(0, 244)
errorLabel.Size = UDim2.new(1, 0, 0, 40)
errorLabel.Font = Enum.Font.Gotham
errorLabel.Text = ""
errorLabel.TextColor3 = RED
errorLabel.TextSize = 11
errorLabel.TextWrapped = true
errorLabel.TextXAlignment = Enum.TextXAlignment.Left
errorLabel.TextYAlignment = Enum.TextYAlignment.Top
errorLabel.Parent = disconnectedView

local hint = Instance.new("TextLabel")
hint.BackgroundTransparency = 1
hint.Position = UDim2.fromOffset(0, 288)
hint.Size = UDim2.new(1, 0, 0, 50)
hint.Font = Enum.Font.Gotham
hint.Text = "Tip: open the BloxForge web app, click \"Connect Studio\", then copy the server URL + pairing code here."
hint.TextColor3 = MUTED
hint.TextSize = 11
hint.TextWrapped = true
hint.TextXAlignment = Enum.TextXAlignment.Left
hint.TextYAlignment = Enum.TextYAlignment.Top
hint.Parent = disconnectedView

-- Connected view
local connectedView = Instance.new("Frame")
connectedView.Name = "Connected"
connectedView.Size = UDim2.fromScale(1, 1)
connectedView.BackgroundTransparency = 1
connectedView.Visible = false
connectedView.Parent = content

local okIcon = Instance.new("TextLabel")
okIcon.BackgroundTransparency = 1
okIcon.Position = UDim2.fromOffset(0, 0)
okIcon.Size = UDim2.new(1, 0, 0, 20)
okIcon.Font = Enum.Font.GothamBold
okIcon.Text = "✓  Studio connected"
okIcon.TextColor3 = ACCENT
okIcon.TextSize = 15
okIcon.TextXAlignment = Enum.TextXAlignment.Left
okIcon.Parent = connectedView

local codeDisplayLabel = Instance.new("TextLabel")
codeDisplayLabel.BackgroundTransparency = 1
codeDisplayLabel.Position = UDim2.fromOffset(0, 28)
codeDisplayLabel.Size = UDim2.new(1, 0, 0, 14)
codeDisplayLabel.Font = Enum.Font.Gotham
codeDisplayLabel.Text = "PAIRING CODE"
codeDisplayLabel.TextColor3 = MUTED
codeDisplayLabel.TextSize = 10
codeDisplayLabel.TextXAlignment = Enum.TextXAlignment.Left
codeDisplayLabel.Parent = connectedView

local codeDisplay = Instance.new("TextLabel")
codeDisplay.BackgroundTransparency = 1
codeDisplay.Position = UDim2.fromOffset(0, 44)
codeDisplay.Size = UDim2.new(1, 0, 0, 24)
codeDisplay.Font = Enum.Font.Code
codeDisplay.Text = "------"
codeDisplay.TextColor3 = TEXT
codeDisplay.TextSize = 18
codeDisplay.TextXAlignment = Enum.TextXAlignment.Left
codeDisplay.Parent = connectedView

local watchingLabel = Instance.new("TextLabel")
watchingLabel.BackgroundTransparency = 1
watchingLabel.Position = UDim2.fromOffset(0, 78)
watchingLabel.Size = UDim2.new(1, 0, 0, 14)
watchingLabel.Font = Enum.Font.Gotham
watchingLabel.Text = "WATCHING"
watchingLabel.TextColor3 = MUTED
watchingLabel.TextSize = 10
watchingLabel.TextXAlignment = Enum.TextXAlignment.Left
watchingLabel.Parent = connectedView

local watchingValue = Instance.new("TextLabel")
watchingValue.BackgroundTransparency = 1
watchingValue.Position = UDim2.fromOffset(0, 94)
watchingValue.Size = UDim2.new(1, 0, 0, 20)
watchingValue.Font = Enum.Font.Code
watchingValue.Text = "Nothing selected"
watchingValue.TextColor3 = TEXT
watchingValue.TextSize = 12
watchingValue.TextXAlignment = Enum.TextXAlignment.Left
watchingValue.TextTruncate = Enum.TextTruncate.AtEnd
watchingValue.Parent = connectedView

local lastSyncLabel = Instance.new("TextLabel")
lastSyncLabel.BackgroundTransparency = 1
lastSyncLabel.Position = UDim2.fromOffset(0, 122)
lastSyncLabel.Size = UDim2.new(1, 0, 0, 14)
lastSyncLabel.Font = Enum.Font.Gotham
lastSyncLabel.Text = "Last sync: never"
lastSyncLabel.TextColor3 = MUTED
lastSyncLabel.TextSize = 10
lastSyncLabel.TextXAlignment = Enum.TextXAlignment.Left
lastSyncLabel.Parent = connectedView

local insertLogLabel = Instance.new("TextLabel")
insertLogLabel.BackgroundTransparency = 1
insertLogLabel.Position = UDim2.fromOffset(0, 148)
insertLogLabel.Size = UDim2.new(1, 0, 0, 14)
insertLogLabel.Font = Enum.Font.Gotham
insertLogLabel.Text = "INSERTED"
insertLogLabel.TextColor3 = MUTED
insertLogLabel.TextSize = 10
insertLogLabel.TextXAlignment = Enum.TextXAlignment.Left
insertLogLabel.Parent = connectedView

local insertLog = Instance.new("TextLabel")
insertLog.BackgroundTransparency = 1
insertLogLabel.Position = UDim2.fromOffset(0, 148)
insertLog.Position = UDim2.fromOffset(0, 164)
insertLog.Size = UDim2.new(1, 0, 0, 70)
insertLog.Font = Enum.Font.Code
insertLog.Text = ""
insertLog.TextColor3 = MUTED
insertLog.TextSize = 11
insertLog.TextWrapped = true
insertLog.TextXAlignment = Enum.TextXAlignment.Left
insertLog.TextYAlignment = Enum.TextYAlignment.Top
insertLog.Parent = connectedView

local disconnectBtn = Instance.new("TextButton")
disconnectBtn.Position = UDim2.new(0, 0, 1, -36)
disconnectBtn.Size = UDim2.new(1, 0, 0, 36)
disconnectBtn.BackgroundColor3 = SURFACE2
disconnectBtn.TextColor3 = RED
disconnectBtn.Text = "Disconnect"
disconnectBtn.Font = Enum.Font.GothamBold
disconnectBtn.TextSize = 13
disconnectBtn.Parent = connectedView
local dbCorner = Instance.new("UICorner", disconnectBtn)
dbCorner.CornerRadius = UDim.new(0, 6)

--========================================================================
-- Connection logic
--========================================================================

local function setConnected(isConn)
        connected = isConn
        disconnectedView.Visible = not isConn
        connectedView.Visible = isConn
        statusDot.BackgroundColor3 = isConn and ACCENT or MUTED
        gui.Title = PLUGIN_NAME .. (isConn and (" — " .. pairingCode) or "")
        if isConn then
                codeDisplay.Text = pairingCode
        end
end

local function appendInsertLog(text)
        local stamp = os.date("%H:%M:%S")
        local current = insertLog.Text
        local lines = (#current > 0) and (current .. "\n") or ""
        insertLog.Text = (lines .. stamp .. "  " .. text):sub(-200)
end

local function executeInsertCommand(cmd)
        local ok = false
        local message = ""
        local scriptType = "Script"
        -- Heuristic: ModuleScripts return something at the end; keep it simple
        -- and default to Script. Users can change the type in Studio.
        local inst = Instance.new(scriptType)
        inst.Name = (cmd.title or "BloxForgeScript"):gsub("[^%w_%-]", ""):sub(1, 50)
        if #inst.Name == 0 then inst.Name = "BloxForgeScript" end
        inst.Source = cmd.code
        -- Place into ServerScriptService
        inst.Parent = ServerScriptService
        Selection:Set({ inst })
        ok = true
        message = "Inserted " .. inst.Name .. " into ServerScriptService"
        appendInsertLog("+" .. inst.Name)
        warnMsg(message)

        -- Ack the result
        task.spawn(function()
                local _, _ = httpPost(apiUrl .. "/ack", {
                        code = pairingCode,
                        commandId = cmd.id,
                        ok = ok,
                        message = message,
                }, 10)
        end)
end

local function sendContextImmediate()
        if not connected then return end
        local ctx = buildContext()
        local hash = contextHash(ctx)
        if hash == lastContextHash then return end
        lastContextHash = hash
        task.spawn(function()
                local _, _ = httpPost(apiUrl .. "/heartbeat", {
                        code = pairingCode,
                        context = ctx,
                }, 10)
                if ctx then
                        watchingValue.Text = ctx.scriptPath
                else
                        watchingValue.Text = "Nothing selected"
                end
        end)
end

local function heartbeatLoop()
        if heartbeatRunning then return end
        heartbeatRunning = true
        while connected do
                local ctx = buildContext()
                local hash = contextHash(ctx)
                local includeContext = (hash ~= lastContextHash)
                if includeContext then lastContextHash = hash end

                local payload = {
                        code = pairingCode,
                        context = includeContext and ctx or nil,
                }

                local ok, response = httpPost(apiUrl .. "/heartbeat", payload, 15)
                if ok then
                        local parsedOk, data = pcall(function()
                                return HttpService:JSONDecode(response)
                        end)
                        if parsedOk and data and data.ok then
                                lastSyncLabel.Text = "Last sync: " .. os.date("%H:%M:%S")
                                if ctx then
                                        watchingValue.Text = ctx.scriptPath
                                else
                                        watchingValue.Text = "Nothing selected"
                                end
                                -- Process any insert commands
                                if data.commands and #data.commands > 0 then
                                        for _, cmd in ipairs(data.commands) do
                                                task.spawn(function()
                                                        executeInsertCommand(cmd)
                                                end)
                                        end
                                end
                        else
                                if data and data.error then
                                        warnMsg("Heartbeat error: " .. tostring(data.error))
                                        if data.error == "Unknown pairing code" then
                                                setConnected(false)
                                                break
                                        end
                                end
                        end
                else
                        warnMsg("Heartbeat request failed: " .. tostring(response))
                end

                task.wait(HEARTBEAT_INTERVAL)
        end
        heartbeatRunning = false
end

-- Robustly normalize a user-entered URL to "<origin>/api/studio".
-- Handles: trailing slashes, pre-existing /api/studio, /api, #fragments, etc.
local function normalizeApiUrl(raw)
        raw = (raw or ""):gsub("^%s+", ""):gsub("%s+$", "") -- trim whitespace
        -- Strip any URL fragment
        raw = raw:gsub("#.*$", "")
        -- Strip trailing slashes
        raw = raw:gsub("/+$", "")
        -- If the user already pasted ".../api/studio", strip it
        raw = raw:gsub("/api/studio$", "")
        raw = raw:gsub("/+$", "")
        -- If the user pasted ".../api", strip it too
        raw = raw:gsub("/api$", "")
        raw = raw:gsub("/+$", "")
        if #raw == 0 then return nil end
        return raw .. "/api/studio"
end

local function doConnect()
        local rawUrl = urlInput.Text or ""
        local normalizedUrl = normalizeApiUrl(rawUrl)
        local code = codeInput.Text or ""
        errorLabel.Text = ""

        if not normalizedUrl then
                errorLabel.Text = "⚠ Please enter the BloxForge server URL."
                warnMsg("Please enter the BloxForge server URL.")
                return
        end
        if #code:gsub("[^A-Za-z0-9]", "") < 5 then
                errorLabel.Text = "⚠ Please enter the 6-character pairing code from the web app."
                warnMsg("Please enter the 6-character pairing code from the web app.")
                return
        end

        apiUrl = normalizedUrl
        pairingCode = code:upper():gsub("[^A-Z0-9]", ""):sub(1, 3)
        local cleanedCode = code:upper():gsub("[^A-Z0-9]", "")
        if #cleanedCode > 3 then
                pairingCode = pairingCode .. "-" .. cleanedCode:sub(4, 6)
        end
        -- Save the cleaned origin (without /api/studio) so it shows nicely next time
        local savedUrl = normalizedUrl:gsub("/api/studio$", "")
        Plugin:SetSetting(PLUGIN_ID .. "_ApiUrl", savedUrl)

        warnMsg("Connecting to " .. apiUrl .. " with code " .. pairingCode)

        -- Send an initial heartbeat to validate the pairing code
        connectBtn.Text = "Connecting…"
        connectBtn.BackgroundColor3 = ACCENT_DARK

        local ctx = buildContext()
        local ok, response = httpPost(apiUrl .. "/heartbeat", {
                code = pairingCode,
                context = ctx,
        }, 15)

        if ok then
                local parsedOk, data = pcall(function()
                        return HttpService:JSONDecode(response)
                end)
                if parsedOk and data and data.ok then
                        errorLabel.Text = ""
                        setConnected(true)
                        lastContextHash = contextHash(ctx)
                        if ctx then watchingValue.Text = ctx.scriptPath end
                        task.spawn(heartbeatLoop)
                        warnMsg("Connected with code " .. pairingCode)
                else
                        local errMsg = (data and data.error) or "invalid response"
                        errorLabel.Text = "⚠ " .. tostring(errMsg) .. " (code: " .. pairingCode .. ")"
                        warnMsg("Connection rejected: " .. tostring(errMsg) .. " (code: " .. pairingCode .. ")")
                end
        else
                -- HttpService error — usually wrong URL, HTTPS issue, or server unreachable
                local shortErr = tostring(response):sub(1, 80)
                errorLabel.Text = "⚠ Cannot reach server. Check the URL is HTTPS and reachable. (" .. shortErr .. ")"
                warnMsg("Connection failed: " .. tostring(response))
                warnMsg("URL used: " .. apiUrl .. "/heartbeat")
                warnMsg("Check: 1) URL is correct  2) HTTPS is used  3) server is reachable  4) HttpService is enabled")
        end

        connectBtn.Text = "Connect"
        connectBtn.BackgroundColor3 = ACCENT
end

local function doDisconnect()
        connected = false
        task.spawn(function()
                local _, _ = httpPost(apiUrl .. "/disconnect", { code = pairingCode }, 8)
        end)
        setConnected(false)
        lastContextHash = ""
        warnMsg("Disconnected")
end

connectBtn.MouseButton1Click:Connect(doConnect)
disconnectBtn.MouseButton1Click:Connect(doDisconnect)

-- React to selection changes immediately (context sync feels live)
Selection.SelectionChanged:Connect(function()
        if connected then
                sendContextImmediate()
        end
end)

--========================================================================
-- Toolbar button
--========================================================================

local toolbar = Plugin:CreateToolbar("BloxForge AI")
local toggleBtn = toolbar:CreateButton(
        "BloxForge Connector",
        "Open the BloxForge Studio connector",
        "rbxassetid://0"
)
toggleBtn.ClickableWhenViewportHidden = true
toggleBtn.Click:Connect(function()
        gui.Enabled = not gui.Enabled
end)

setConnected(false)
warnMsg("BloxForge Studio connector loaded. Open the web app and click \"Connect Studio\" to get a pairing code.")
