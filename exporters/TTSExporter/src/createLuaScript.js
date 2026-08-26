export default function createLuaScript(ttsBasePath) {
    const manifestUrl = JSON.stringify(ttsBasePath + 'pack.json');
    const boosterModelUrl = JSON.stringify(ttsBasePath + 'booster.obj');
    const boosterTextureUrl = JSON.stringify(ttsBasePath + 'booster.png');

    return `local manifestUrl = ${manifestUrl}
local boosterModelUrl = ${boosterModelUrl}
local boosterTextureUrl = ${boosterTextureUrl}
local manifest = nil
local cardsById = {}
local slotCollators = {}
local savedStateToRestore = ''

function onLoad(savedState)
    savedStateToRestore = savedState or ''
    loadManifest()
end

function loadManifest()
    WebRequest.get(manifestUrl, function(request)
        if request.is_error then
            broadcastToAll(
                'Failed to load booster manifest: ' .. request.error,
                {1, 0.3, 0.3}
            )
            return
        end

        if request.response_code < 200 or request.response_code >= 300 then
            broadcastToAll(
                'Failed to load booster manifest: HTTP '
                    .. request.response_code,
                {1, 0.3, 0.3}
            )
            return
        end

        local ok, decodedManifest = pcall(JSON.decode, request.text)
        if not ok or decodedManifest == nil then
            broadcastToAll(
                'Failed to decode booster manifest.',
                {1, 0.3, 0.3}
            )
            return
        end

        manifest = decodedManifest
        buildCardIndex()
        initializeCollators()
        restoreState(savedStateToRestore)
        preloadAssets()
        createUi()
    end)
end

function onSave()
    if manifest == nil then
        return savedStateToRestore
    end

    return JSON.encode({
        slotCollators = captureCollatorListState(slotCollators)
    })
end

function buildCardIndex()
    cardsById = {}
    for _, card in ipairs(manifest.cards) do
        cardsById[card.id] = card
    end
end

function initializeCollators()
    slotCollators = {}
    for index, slot in ipairs(manifest.packSlots) do
        slotCollators[index] = createSlotCollator(slot)
    end
end

function createSlotCollator(slot)
    if slot.collation == 'sheet' then
        return createSheetCollator(slot)
    end
    return createRunsCollator(slot)
end

function createSheetCollator(slot)
    local sheet = {}

    for _, pool in ipairs(slot.pools) do
        for copyIndex = 1, pool.weight do
            appendValues(sheet, pool.cardIds)
        end
    end

    return createLeafCollator(sheet)
end

function createRunsCollator(slot)
    local poolChildren = {}

    for _, pool in ipairs(slot.pools) do
        if pool.size > 0 then
            table.insert(poolChildren, {
                weight = pool.weight * pool.size,
                collator = createRunPoolCollator(pool)
            })
        end
    end

    return createWeightedCollator(poolChildren)
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

function createLeafCollator(source)
    return {
        kind = 'leaf',
        source = copyValues(source),
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

function nextCard(collator)
    if collator.kind == 'leaf' then
        return nextLeafCard(collator)
    end
    return nextWeightedCard(collator)
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

function nextWeightedCard(collator)
    if #collator.children == 0 then
        return nil
    end

    local selectedChild = nil
    local selectedAccumulator = nil

    for _, child in ipairs(collator.children) do
        child.accumulator = child.accumulator + child.weight

        if selectedChild == nil or child.accumulator > selectedAccumulator then
            selectedChild = child
            selectedAccumulator = child.accumulator
        end
    end

    selectedChild.accumulator =
        selectedChild.accumulator - collator.totalWeight

    return nextCard(selectedChild.collator)
end

function createPackCardIds()
    local cardIds = {}

    for index, slot in ipairs(manifest.packSlots) do
        for drawIndex = 1, slot.count do
            local cardId = nextCard(slotCollators[index])
            if cardId ~= nil then
                table.insert(cardIds, cardId)
            end
        end
    end

    shuffle(cardIds)
    return cardIds
end

function createUi()
    self.clearButtons()
    self.clearContextMenu()

    self.createButton({
        click_function = 'clickCreatePack',
        function_owner = self,
        label = 'Create Pack',
        position = {0, 0.65, -0.45},
        rotation = {0, 0, 0},
        width = 1050,
        height = 200,
        font_size = 130,
        color = {0.15, 0.15, 0.15},
        font_color = {1, 1, 1},
        tooltip = 'Spawn one collated booster pack'
    })

    self.createButton({
        click_function = 'clickDealPacks',
        function_owner = self,
        label = 'Deal Packs',
        position = {0, 0.65, 0},
        rotation = {0, 0, 0},
        width = 1050,
        height = 200,
        font_size = 130,
        color = {0.15, 0.15, 0.15},
        font_color = {1, 1, 1},
        tooltip = 'Spawn one pack in front of each seated player'
    })

    self.createButton({
        click_function = 'clickSpawnExtras',
        function_owner = self,
        label = 'Spawn Extras',
        position = {0, 0.65, 0.45},
        rotation = {0, 0, 0},
        width = 1050,
        height = 200,
        font_size = 130,
        color = {0.15, 0.15, 0.15},
        font_color = {1, 1, 1},
        tooltip = 'Spawn cards not used by booster generation'
    })

    self.addContextMenuItem('Create Pack', menuCreatePack)
    self.addContextMenuItem('Deal Packs', menuDealPacks)
    self.addContextMenuItem('Spawn Extras', menuSpawnExtras)
end

function preloadAssets()
    local assets = {
        {
            name = 'card_back',
            url = manifest.backUrl
        },
        {
            name = 'booster_texture',
            url = boosterTextureUrl
        }
    }

    for _, card in ipairs(manifest.cards) do
        table.insert(assets, {
            name = 'card_' .. card.id,
            url = card.faceUrl
        })
    end

    self.UI.setCustomAssets(assets)
end

function clickCreatePack(object, playerColor, altClick)
    spawnPackNearGenerator()
end

function clickDealPacks(object, playerColor, altClick)
    dealPacks(playerColor)
end

function clickSpawnExtras(object, playerColor, altClick)
    spawnExtrasNearGenerator(playerColor)
end

function menuCreatePack(playerColor, position, object)
    spawnPackNearGenerator()
end

function menuDealPacks(playerColor, position, object)
    dealPacks(playerColor)
end

function menuSpawnExtras(playerColor, position, object)
    spawnExtrasNearGenerator(playerColor)
end

function spawnPackNearGenerator()
    local position = self.positionToWorld({4, 2, 0})
    local rotation = uprightRotation(self.getRotation())
    spawnPack(position, rotation)
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
            local position = {
                x = hand.position.x + hand.forward.x * 10,
                y = 2,
                z = hand.position.z + hand.forward.z * 10
            }

            spawnPack(position, uprightRotation(hand.rotation))
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

    local position = self.positionToWorld({-4, 2, 0})
    local rotation = faceDownRotation(self.getRotation())

    spawnCardCollection(
        manifest.extras,
        manifest.setCode .. ' Extras',
        position,
        rotation
    )
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

function spawnPackContents(cardIds, position, boosterObject)
    local nickname = manifest.setCode .. ' Booster Pack'
    local data = nil

    if #cardIds == 1 then
        data = createSingleCardData(cardIds[1])
    else
        data = createDeckData(cardIds, nickname)
    end

    spawnObjectData({
        data = data,
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

function createBoosterData()
    return {
        Name = 'Custom_Model_Bag',
        Nickname = manifest.setCode .. ' Booster Pack',
        Tags = {'BoosterPack'},
        CustomMesh = {
            MeshURL = boosterModelUrl,
            DiffuseURL = boosterTextureUrl,
            NormalURL = '',
            ColliderURL = '',
            Convex = true,
            MaterialIndex = 0,
            TypeIndex = 6,
            CastShadows = true
        },
        Bag = {
            Order = 0
        },
        LuaScript = "function tryObjectEnter(object)\\n"
            .. "    if object.hasTag('BoosterPack') then\\n"
            .. "        return false\\n"
            .. "    end\\n"
            .. "\\n"
            .. "    return true\\n"
            .. "end",
        Transform = createBoosterTransform()
    }
end

function createBoosterTransform()
    return {
        posX = 0,
        posY = 0,
        posZ = 0,
        rotX = 0,
        rotY = 0,
        rotZ = 90,
        scaleX = 0.4,
        scaleY = 0.4,
        scaleZ = 0.4
    }
end

function uprightRotation(rotation)
    return {0, rotation.y, 0}
end

function spawnCardCollection(cardIds, nickname, position, rotation)
    if #cardIds == 0 then
        return
    end

    if #cardIds == 1 then
        spawnObjectData({
            data = createSingleCardData(cardIds[1]),
            position = position,
            rotation = rotation
        })
        return
    end

    spawnObjectData({
        data = createDeckData(cardIds, nickname),
        position = position,
        rotation = rotation
    })
end

function createSingleCardData(cardId)
    local card = cardsById[cardId]

    return {
        Name = 'CardCustom',
        Nickname = card.nickname,
        CardID = 100,
        CustomDeck = {
            ['1'] = createCustomDeckEntry(card)
        },
        Transform = createCardTransform()
    }
end

function createDeckData(cardIds, nickname)
    local containedObjects = {}
    local deckIds = {}
    local customDeck = {}

    for index, cardId in ipairs(cardIds) do
        local ttsCardId = index * 100
        local deckKey = tostring(index)
        local card = cardsById[cardId]

        table.insert(deckIds, ttsCardId)
        table.insert(containedObjects, {
            CardID = ttsCardId,
            Name = 'Card',
            Nickname = card.nickname,
            Transform = createCardTransform()
        })

        customDeck[deckKey] = createCustomDeckEntry(card)
    end

    return {
        Name = 'DeckCustom',
        Nickname = nickname,
        ContainedObjects = containedObjects,
        DeckIDs = deckIds,
        CustomDeck = customDeck,
        Transform = createCardTransform()
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

function createCardTransform()
    return {
        posX = 0,
        posY = 0,
        posZ = 0,
        rotX = 0,
        rotY = 180,
        rotZ = 180,
        scaleX = 1,
        scaleY = 1,
        scaleZ = 1
    }
end

function faceDownRotation(rotation)
    return {0, rotation.y, 180}
end

function restoreState(savedState)
    if savedState == nil or savedState == '' then
        return
    end

    local ok, state = pcall(JSON.decode, savedState)
    if not ok or state == nil or state.slotCollators == nil then
        return
    end

    restoreCollatorListState(slotCollators, state.slotCollators)
end

function captureCollatorListState(collators)
    local states = {}

    for index, collator in ipairs(collators) do
        states[index] = captureCollatorState(collator)
    end

    return states
end

function captureCollatorState(collator)
    if collator.kind == 'leaf' then
        return {
            kind = 'leaf',
            order = copyValues(collator.order),
            cursor = collator.cursor
        }
    end

    local children = {}

    for index, child in ipairs(collator.children) do
        children[index] = {
            accumulator = child.accumulator,
            collator = captureCollatorState(child.collator)
        }
    end

    return {
        kind = 'weighted',
        children = children
    }
end

function restoreCollatorListState(collators, states)
    for index, collator in ipairs(collators) do
        local state = states[index]
        if state ~= nil then
            restoreCollatorState(collator, state)
        end
    end
end

function restoreCollatorState(collator, state)
    if collator.kind ~= state.kind then
        return
    end

    if collator.kind == 'leaf' then
        if state.order ~= nil and #state.order == #collator.source then
            collator.order = copyValues(state.order)
            collator.cursor = state.cursor or 1
        end
        return
    end

    for index, child in ipairs(collator.children) do
        local childState = state.children and state.children[index]

        if childState ~= nil then
            child.accumulator = childState.accumulator or child.accumulator

            if childState.collator ~= nil then
                restoreCollatorState(
                    child.collator,
                    childState.collator
                )
            end
        end
    end
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
`;
}
