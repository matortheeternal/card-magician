local manifest = nil
local cardsById = {}
local slotCollators = {}

-- UTILS --
function createTransform(rotY, rotZ)
    return {
        posX = 0,
        posY = 0,
        posZ = 0,
        rotX = 0,
        rotY = rotY or 0,
        rotZ = rotZ or 0,
        scaleX = 1,
        scaleY = 1,
        scaleZ = 1
    }
end

function createCustomDeckEntry(card)
    return {
        FaceURL = card.faceUrl,
        BackURL = manifest.backUrl,
        NumHeight = 1,
        NumWidth = 1,
        BackIsHidden = true
    }
end

function faceDownRotation(rotation)
    return {0, rotation.y, 180}
end

function copyValues(values)
    local copy = {}
    for index, value in ipairs(values) do
        copy[index] = value
    end
    return copy
end

function appendValues(destination, values)
    for _, value in ipairs(values) do
        table.insert(destination, value)
    end
end

function shuffledCopy(values)
    local copy = copyValues(values)
    shuffle(copy)
    return copy
end

function shuffle(values)
    for index = #values, 2, -1 do
        local swapIndex = math.random(index)
        values[index], values[swapIndex] =
            values[swapIndex], values[index]
    end
end

function uprightRotation(rotation)
    return {0, rotation.y, 0}
end

-- COLLATION --
function nextWeightedCard(collator)
    if #collator.children == 0 then
        return nil
    end

    local selectedChild = nil

    for _, child in ipairs(collator.children) do
        child.accumulator = child.accumulator + child.weight

        if not selectedChild
            or child.accumulator > selectedChild.accumulator then
            selectedChild = child
        end
    end

    selectedChild.accumulator =
        selectedChild.accumulator - collator.totalWeight

    return nextCard(selectedChild.collator)
end

function nextLeafCard(collator)
    if #collator.source == 0 then
        return nil
    end

    if collator.cursor > #collator.order then
        collator.order = shuffledCopy(collator.source)
        collator.cursor = 1
    end

    local cardId = collator.order[collator.cursor]
    collator.cursor = collator.cursor + 1
    return cardId
end

function nextCard(collator)
    if collator.kind == 'leaf' then
        return nextLeafCard(collator)
    end
    return nextWeightedCard(collator)
end

function createLeafCollator(source)
    return {
        kind = 'leaf',
        source = source,
        order = shuffledCopy(source),
        cursor = 1
    }
end

function createWeightedCollator(children)
    local totalWeight = 0

    for _, child in ipairs(children) do
        child.accumulator = math.random() * 0.001
        totalWeight = totalWeight + child.weight
    end

    return {
        kind = 'weighted',
        children = children,
        totalWeight = totalWeight
    }
end

function createRunPoolCollator(pool)
    local colorCountChildren = {}

    for _, colorCountBucket in ipairs(pool.runBuckets) do
        local identityChildren = {}

        for _, identityBucket in ipairs(colorCountBucket.identities) do
            table.insert(identityChildren, {
                weight = identityBucket.size,
                collator = createLeafCollator(identityBucket.cardIds)
            })
        end

        table.insert(colorCountChildren, {
            weight = colorCountBucket.size,
            collator = createWeightedCollator(identityChildren)
        })
    end

    return createWeightedCollator(colorCountChildren)
end

function createRunsCollator(slot)
    local poolChildren = {}

    for _, pool in ipairs(slot.pools) do
        table.insert(poolChildren, {
            weight = pool.weight * pool.size,
            collator = createRunPoolCollator(pool)
        })
    end

    return createWeightedCollator(poolChildren)
end

function createSheetCollator(slot)
    local sheet = {}

    for _, pool in ipairs(slot.pools) do
        for _ = 1, pool.weight do
            appendValues(sheet, pool.cardIds)
        end
    end

    return createLeafCollator(sheet)
end

function createSlotCollator(slot)
    if slot.collation == 'sheet' then
        return createSheetCollator(slot)
    end
    return createRunsCollator(slot)
end

function initializeCollators()
    slotCollators = {}
    for index, slot in ipairs(manifest.packSlots) do
        slotCollators[index] = createSlotCollator(slot)
    end
end

-- SPAWNING --
function createSingleCardData(cardId)
    local card = cardsById[cardId]

    return {
        Name = 'CardCustom',
        Nickname = card.nickname,
        CardID = 100,
        CustomDeck = {
            ['1'] = createCustomDeckEntry(card)
        },
        Transform = createTransform(180, 180)
    }
end

function createDeckData(cardIds, nickname)
    local containedObjects = {}
    local deckIds = {}
    local customDeck = {}

    for index, cardId in ipairs(cardIds) do
        local ttsCardId = index * 100
        local card = cardsById[cardId]

        table.insert(deckIds, ttsCardId)
        table.insert(containedObjects, {
            CardID = ttsCardId,
            Name = 'Card',
            Nickname = card.nickname,
            Transform = createTransform(180, 180)
        })

        customDeck[tostring(index)] = createCustomDeckEntry(card)
    end

    return {
        Name = 'DeckCustom',
        Nickname = nickname,
        ContainedObjects = containedObjects,
        DeckIDs = deckIds,
        CustomDeck = customDeck,
        Transform = createTransform(180, 180)
    }
end

function createCardCollectionData(cardIds, nickname)
    if #cardIds == 1 then
        return createSingleCardData(cardIds[1])
    end
    return createDeckData(cardIds, nickname)
end

function spawnCardCollection(cardIds, nickname, position, rotation)
    if #cardIds == 0 then
        return
    end

    spawnObjectData({
        data = createCardCollectionData(cardIds, nickname),
        position = position,
        rotation = rotation
    })
end

function createBoosterData()
    return {
        Name = 'Custom_Model_Bag',
        Nickname = manifest.setCode .. ' Booster Pack',
        Tags = {'BoosterPack'},
        CustomMesh = {
            MeshURL = boosterModelUrl,
            DiffuseURL = boosterTextureUrl,
            Convex = true,
            MaterialIndex = 0,
            TypeIndex = 6,
            CustomShader = {
                SpecularColor = {r = 1, g = 1, b = 1},
                SpecularIntensity = 0.2,
                SpecularSharpness = 7,
                FresnelStrength = 0.4
            }
        },
        Bag = {Order = 0},
        LuaScript = "function tryObjectEnter(object) "
            .. "    return not object.hasTag('BoosterPack') "
            .. "end",
        Transform = createTransform()
    }
end

function spawnPackContents(cardIds, position, boosterObject)
    spawnObjectData({
        data = createCardCollectionData(
            cardIds,
            manifest.setCode .. ' Booster Pack'
        ),
        position = {
            x = position.x,
            y = position.y + 2,
            z = position.z
        },
        rotation = {0, 0, 180},
        callback_function = function(packContents)
            boosterObject.putObject(packContents)
        end
    })
end

function spawnPack(position, rotation)
    local cardIds = createPackCardIds()
    if #cardIds == 0 then
        return
    end

    spawnObjectData({
        data = createBoosterData(),
        position = position,
        rotation = rotation,
        callback_function = function(boosterObject)
            spawnPackContents(cardIds, position, boosterObject)
        end
    })
end

function spawnPackNearGenerator()
    spawnPack(
        self.positionToWorld({4, 2, 0}),
        uprightRotation(self.getRotation())
    )
end

function dealPacks(requestingPlayerColor)
    local seatedPlayers = getSeatedPlayers()
    if #seatedPlayers == 0 then
        printToColor(
            'No seated players found.',
            requestingPlayerColor,
            {1, 1, 1}
        )
        return
    end

    local dealt = 0

    for _, playerColor in ipairs(seatedPlayers) do
        local player = Player[playerColor]

        if player.getHandCount() > 0 then
            local hand = player.getHandTransform()

            spawnPack({
                x = hand.position.x + hand.forward.x * 10,
                y = 2,
                z = hand.position.z + hand.forward.z * 10
            }, uprightRotation(hand.rotation))

            dealt = dealt + 1
        end
    end

    printToColor(
        'Spawned ' .. dealt .. ' pack(s).',
        requestingPlayerColor,
        {1, 1, 1}
    )
end

function spawnExtrasNearGenerator(playerColor)
    if #manifest.extras == 0 then
        printToColor(
            'There are no cards outside booster generation.',
            playerColor,
            {1, 1, 1}
        )
        return
    end

    spawnCardCollection(
        manifest.extras,
        manifest.setCode .. ' Extras',
        self.positionToWorld({-4, 2, 0}),
        faceDownRotation(self.getRotation())
    )
end

function createPackCardIds()
    local cardIds = {}

    for index, slot in ipairs(manifest.packSlots) do
        for _ = 1, slot.count do
            local cardId = nextCard(slotCollators[index])
            if cardId ~= nil then
                table.insert(cardIds, cardId)
            end
        end
    end

    return cardIds
end

-- UI --
function createButton(label, clickFunction, z, tooltip)
    self.createButton({
        click_function = clickFunction,
        function_owner = self,
        label = label,
        position = {0, 0.65, z},
        width = 1050,
        height = 200,
        font_size = 130,
        color = {0.15, 0.15, 0.15},
        font_color = {1, 1, 1},
        tooltip = tooltip
    })
end

function clickCreatePack()
    spawnPackNearGenerator()
end

function clickDealPacks(_, playerColor)
    dealPacks(playerColor)
end

function clickSpawnExtras(_, playerColor)
    spawnExtrasNearGenerator(playerColor)
end

function createUi()
    self.clearButtons()
    self.clearContextMenu()

    createButton(
        'Create Pack',
        'clickCreatePack',
        -0.45,
        'Spawn one collated booster pack'
    )

    createButton(
        'Deal Packs',
        'clickDealPacks',
        0,
        'Spawn one pack in front of each seated player'
    )

    createButton(
        'Spawn Extras',
        'clickSpawnExtras',
        0.45,
        'Spawn cards not used by booster generation'
    )

    self.addContextMenuItem('Create Pack', function()
        spawnPackNearGenerator()
    end)

    self.addContextMenuItem('Deal Packs', function(playerColor)
        dealPacks(playerColor)
    end)

    self.addContextMenuItem('Spawn Extras', function(playerColor)
        spawnExtrasNearGenerator(playerColor)
    end)
end

-- INITIALIZATION --
function preloadAssets()
    local assets = {
        {name = 'card_back', url = manifest.backUrl},
        {name = 'booster_texture', url = boosterTextureUrl}
    }

    for _, card in ipairs(manifest.cards) do
        table.insert(assets, {
            name = 'card_' .. card.id,
            url = card.faceUrl
        })
    end

    self.UI.setCustomAssets(assets)
end

function buildCardIndex()
    cardsById = {}
    for _, card in ipairs(manifest.cards) do
        cardsById[card.id] = card
    end
end

function reportManifestError(message)
    broadcastToAll('Failed to load booster manifest: ' .. message, {1, 0.3, 0.3})
end

function loadManifest()
    WebRequest.get(manifestUrl, function(request)
        if request.is_error then
            reportManifestError(request.error)
            return
        end

        if request.response_code < 200 or request.response_code >= 300 then
            reportManifestError('HTTP ' .. request.response_code)
            return
        end

        local ok, decodedManifest = pcall(JSON.decode, request.text)
        if not ok or decodedManifest == nil then
            reportManifestError('invalid JSON')
            return
        end

        manifest = decodedManifest
        buildCardIndex()
        initializeCollators()
        preloadAssets()
        createUi()
    end)
end

-- HOOKS --
function onLoad()
    loadManifest()
end
