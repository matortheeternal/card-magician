export default [
  {
    "label": "Treasure",
    "type": "keyword",
    "expression": "Treasure token<s>",
    "reminderTexts": [
      {
        "match": {
          "type": "isPlural"
        },
        "template": "They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\""
      },
      {
        "template": "It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\""
      }
    ]
  },
  {
    "label": "Horsemanship",
    "type": "keyword",
    "expression": "Horsemanship",
    "reminderTexts": [
      {
        "template": "<target_creature> can't be blocked except by creatures with horsemanship."
      }
    ]
  },
  {
    "label": "Reach",
    "type": "keyword",
    "expression": "Reach",
    "reminderTexts": [
      {
        "template": "<target_creature> can block creatures with flying."
      }
    ]
  },
  {
    "label": "Connives",
    "type": "keyword",
    "expression": "Connives",
    "reminderTexts": [
      {
        "template": "Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature."
      }
    ]
  },
  {
    "label": "Modified",
    "type": "keyword",
    "expression": "Modified",
    "reminderTexts": [
      {
        "template": "Equipment, Auras you control, and counters are modifications."
      }
    ]
  },
  {
    "label": "Menace",
    "type": "keyword",
    "expression": "Menace",
    "reminderTexts": [
      {
        "template": "<target_creature> can't be blocked except by two or more creatures."
      }
    ]
  },
  {
    "label": "Infect",
    "type": "keyword",
    "expression": "Infect",
    "reminderTexts": [
      {
        "template": "<target_creature> deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters."
      }
    ]
  },
  {
    "label": "Persist",
    "type": "keyword",
    "expression": "Persist",
    "reminderTexts": [
      {
        "template": "When <target_it> dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it."
      }
    ]
  },
  {
    "label": "Indestructible",
    "type": "keyword",
    "expression": "Indestructible",
    "reminderTexts": [
      {
        "template": "Damage and effects that say \"destroy\" don't destroy <target_it>."
      }
    ]
  },
  {
    "label": "Spree",
    "type": "keyword",
    "expression": "Spree",
    "reminderTexts": [
      {
        "template": "Choose one or more additional costs."
      }
    ]
  },
  {
    "label": "{q}",
    "type": "keyword",
    "expression": "{q}",
    "reminderTexts": [
      {
        "template": "{Q} is the untap symbol."
      }
    ]
  },
  {
    "label": "Exalted",
    "type": "keyword",
    "expression": "Exalted",
    "reminderTexts": [
      {
        "match": {
          "type": "targetsOther"
        },
        "template": "Whenever a creature you control attacks alone, it gets +1/+1 until end of turn for each instance of exalted among permanents you control."
      },
      {
        "template": "Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn."
      }
    ]
  },
  {
    "label": "Miracle",
    "type": "keyword",
    "expression": "Miracle",
    "reminderTexts": [
      {
        "template": "You may cast this card for its miracle cost when you draw it if it's the first card you drew this turn."
      }
    ]
  },
  {
    "label": "Prowess",
    "type": "keyword",
    "expression": "Prowess",
    "reminderTexts": [
      {
        "template": "Whenever you cast a noncreature spell, <target_creature> gets +1/+1 until end of turn."
      }
    ]
  },
  {
    "label": "Cascade",
    "type": "keyword",
    "expression": "Cascade",
    "reminderTexts": [
      {
        "template": "When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order."
      }
    ]
  },
  {
    "label": "Extort",
    "type": "keyword",
    "expression": "Extort",
    "reminderTexts": [
      {
        "template": "Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much life."
      }
    ]
  },
  {
    "label": "Devoid",
    "type": "keyword",
    "expression": "Devoid",
    "reminderTexts": [
      {
        "template": "This card has no color."
      }
    ]
  },
  {
    "label": "Flash",
    "type": "keyword",
    "expression": "Flash",
    "reminderTexts": [
      {
        "template": "You may cast this spell any time you could cast an instant."
      }
    ]
  },
  {
    "label": "Echo",
    "type": "keyword",
    "expression": "Echo",
    "reminderTexts": [
      {
        "template": "At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost."
      }
    ]
  },
  {
    "label": "Megamorph",
    "type": "keyword",
    "expression": "Megamorph",
    "reminderTexts": [
      {
        "template": "You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it."
      }
    ]
  },
  {
    "label": "Compleated",
    "type": "keyword",
    "expression": "Compleated",
    "reminderTexts": [
      {
        "template": "<compleated_options> If life was paid, this planeswalker enters with two fewer loyalty counters."
      }
    ]
  },
  {
    "label": "Prototype",
    "type": "keyword",
    "expression": "Prototype",
    "reminderTexts": [
      {
        "template": "You may cast this spell with different mana cost, color, and size. It keeps its abilities and types."
      }
    ]
  },
  {
    "label": "Harmonize",
    "type": "keyword",
    "expression": "Harmonize <cost>",
    "reminderTexts": [
      {
        "match": {
          "type": "costHasX"
        },
        "template": "You may cast this card from your graveyard for its harmonize cost. You may tap a creature you control to reduce that cost by {X}, where X is its power. Then exile this spell."
      },
      {
        "template": "You may cast this card from your graveyard for its harmonize cost. You may tap a creature you control to reduce that cost by an amount of generic mana equal to its power. Then exile this spell."
      }
    ]
  },
  {
    "label": "Fear",
    "type": "keyword",
    "expression": "Fear",
    "reminderTexts": [
      {
        "template": "<target_creature> can't be blocked except by artifact creatures and/or black creatures."
      }
    ]
  },
  {
    "label": "Foretell",
    "type": "keyword",
    "expression": "Foretell <cost>",
    "reminderTexts": [
      {
        "template": "During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost."
      }
    ]
  },
  {
    "label": "Rebound",
    "type": "keyword",
    "expression": "Rebound",
    "reminderTexts": [
      {
        "template": "If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost."
      }
    ]
  },
  {
    "label": "Evoke",
    "type": "keyword",
    "expression": "Evoke <cost>",
    "reminderTexts": [
      {
        "template": "You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters."
      }
    ]
  },
  {
    "label": "Station",
    "type": "keyword",
    "expression": "Station",
    "reminderTexts": [
      {
        "match": {
          "type": "hasPT"
        },
         "template": "Tap another creature you control: Put charge counters equal to its power on this <Subtype>. Station only as a sorcery. It's an artifact creature at <station_creature_breakpoint>."
      },
      {
        "template": "Tap another creature you control: Put charge counters equal to its power on this <Subtype>. Station only as a sorcery."
      }
    ]
  },
  {
    "label": "Changeling",
    "type": "keyword",
    "expression": "Changeling",
    "reminderTexts": [
      {
        "match": {
          "type": "cardIs",
          "params": ["token"]
        },
        "template": "This token is every creature type."
      },
      {
        "template": "This card is every creature type."
      }
    ]
  },
  {
    "label": "Riot",
    "type": "keyword",
    "expression": "Riot",
    "reminderTexts": [
      {
        "match": {
          "type": "hasPPCounters"
        },
        "template": "This creature enters with your choice of an additional +1/+1 counter or haste."
      },
      {
        "template": "<target_creature> enters with your choice of a +1/+1 counter or haste."
      }
    ]
  },
  {
    "label": "Intimidate",
    "type": "keyword",
    "expression": "Intimidate",
    "reminderTexts": [
      {
        "template": "<target_creature> can't be blocked except by artifact creatures and/or creatures that share a color with it."
      }
    ]
  },
  {
    "label": "Flanking",
    "type": "keyword",
    "expression": "Flanking",
    "reminderTexts": [
      {
        "template": "Whenever a creature without flanking blocks <target_creature>, the blocking creature gets -1/-1 until end of turn."
      }
    ]
  },
  {
    "label": "Undying",
    "type": "keyword",
    "expression": "Undying",
    "reminderTexts": [
      {
        "template": "When <target_creature> dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it."
      }
    ]
  },
  {
    "label": "Exert",
    "type": "keyword",
    "expression": "Exert",
    "reminderTexts": [
      {
        "template": "An exerted creature won't untap during your next untap step."
      }
    ]
  },
  {
    "label": "Conspire",
    "type": "keyword",
    "expression": "Conspire",
    "reminderTexts": [
      {
        "match": {
          "type": "hasTarget"
        },
        "template": "As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it and you may choose a new target for the copy."
      },
      {
        "template": "As you cast this spell, you may tap two untapped creatures you control that share a color with it. When you do, copy it."
      }
    ]
  },
  {
    "label": "Disguise",
    "type": "keyword",
    "expression": "Disguise <cost>",
    "reminderTexts": [
      {
        "template": "You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost."
      }
    ]
  },
  {
    "label": "Lifelink",
    "type": "keyword",
    "expression": "Lifelink",
    "reminderTexts": [
      {
        "template": "Damage dealt by <the_target_creature> also causes you to gain that much life."
      }
    ]
  },
  {
    "label": "Shroud",
    "type": "keyword",
    "expression": "Shroud",
    "reminderTexts": [
      {
        "template": "<target> can't be the target of spells or abilities."
      }
    ]
  },
  {
    "label": "Retrace",
    "type": "keyword",
    "expression": "Retrace",
    "reminderTexts": [
      {
        "template": "You may cast this card from your graveyard by discarding a land card in addition to paying its other costs."
      }
    ]
  },
  {
    "label": "Dash",
    "type": "keyword",
    "expression": "Dash <cost>",
    "reminderTexts": [
      {
        "template": "You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step."
      }
    ]
  },
  {
    "label": "Dethrone",
    "type": "keyword",
    "expression": "Dethrone",
    "reminderTexts": [
      {
        "template": "Whenever this creature attacks the player with the most life or tied for most life, put a +1/+1 counter on it."
      }
    ]
  },
  {
    "label": "Blitz",
    "type": "keyword",
    "expression": "Blitz <cost>",
    "reminderTexts": [
      {
        "template": "If you cast this spell for its blitz cost, it gains haste and \"When this creature dies, draw a card.\" Sacrifice it at the beginning of the next end step."
      }
    ]
  },
  {
    "label": "Cleave",
    "type": "keyword",
    "expression": "Cleave <cost>",
    "reminderTexts": [
      {
        "template": "You may cast this spell for its cleave cost. If you do, remove the words in square brackets."
      }
    ]
  },
  {
    "label": "Boast",
    "type": "keyword",
    "expression": "Boast — <cost>:",
    "reminderTexts": [
      {
        "template": "Activate only if this creature attacked this turn and only once each turn."
      }
    ]
  },
  {
    "label": "Unleash",
    "type": "keyword",
    "expression": "Unleash",
    "reminderTexts": [
      {
        "template": "You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it."
      }
    ]
  },
  {
    "label": "Ingest",
    "type": "keyword",
    "expression": "Ingest",
    "reminderTexts": [
      {
        "template": "Whenever this creature deals combat damage to a player, that player exiles the top card of their library."
      }
    ]
  },
  {
    "label": "Bargain",
    "type": "keyword",
    "expression": "Bargain",
    "reminderTexts": [
      {
        "template": "You may sacrifice an artifact, enchantment, or token as you cast this spell."
      }
    ]
  },
  {
    "label": "Even",
    "type": "keyword",
    "expression": "Even",
    "reminderTexts": [
      {
        "template": "Zero is even."
      }
    ]
  },
  {
    "label": "Melee",
    "type": "keyword",
    "expression": "Melee",
    "reminderTexts": [
      {
        "template": "Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat."
      }
    ]
  },
  {
    "label": "Historic",
    "type": "keyword",
    "expression": "Historic",
    "reminderTexts": [
      {
        "template": "Artifacts, legendaries, and Sagas are historic."
      }
    ]
  },
  {
    "label": "Banding",
    "type": "keyword",
    "expression": "Banding",
    "reminderTexts": [
      {
        "template": "Any creatures with banding, and up to one without, can attack in a band. Bands are blocked as a group. If any creatures with banding you control are blocking or being blocked by a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by or is blocking."
      }
    ]
  },
  {
    "label": "Mentor",
    "type": "keyword",
    "expression": "Mentor",
    "reminderTexts": [
      {
        "template": "Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power."
      }
    ]
  },
  {
    "label": "Delve",
    "type": "keyword",
    "expression": "Delve",
    "reminderTexts": [
      {
        "template": "Each card you exile from your graveyard while casting this spell pays for {1}."
      }
    ]
  },
  {
    "label": "Training",
    "type": "keyword",
    "expression": "Training",
    "reminderTexts": [
      {
        "template": "Whenever this creature attacks with another creature with greater power, put a +1/+1 counter on this creature."
      }
    ]
  },
  {
    "label": "Mutate",
    "type": "keyword",
    "expression": "Mutate {cost}",
    "reminderTexts": [
      {
        "template": "If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it."
      }
    ]
  },
  {
    "label": "Myriad",
    "type": "keyword",
    "expression": "Myriad",
    "reminderTexts": [
      {
        "template": "Whenever this creature attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat."
      }
    ]
  },
  {
    "label": "Deathtouch",
    "type": "keyword",
    "expression": "Deathtouch",
    "reminderTexts": [
      {
        "template": "Any amount of damage <this_target_creature> deals to a creature is enough to destroy it."
      }
    ]
  },
  {
    "label": "Evolve",
    "type": "keyword",
    "expression": "Evolve",
    "reminderTexts": [
      {
        "template": "Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature."
      }
    ]
  },
  {
    "label": "Morph",
    "type": "keyword",
    "expression": "Morph",
    "reminderTexts": [
      {
        "template": "You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost."
      }
    ]
  },
  {
    "label": "Demonstrate",
    "type": "keyword",
    "expression": "Demonstrate",
    "reminderTexts": [
      {
        "match": {
          "type": "hasTarget"
        },
        "template": "When you cast this spell, you may copy it. If you do, choose an opponent to also copy it. Players may choose new targets for their copies."
      },
      {
        "template": "When you cast this spell, you may copy it. If you do, choose an opponent to also copy it."
      }
    ]
  },
  {
    "label": "Skulk",
    "type": "keyword",
    "expression": "Skulk",
    "reminderTexts": [
      {
        "template": "<target_creature> can't be blocked by creatures with greater power."
      }
    ]
  },
  {
    "label": "Soulbond",
    "type": "keyword",
    "expression": "Soulbond",
    "reminderTexts": [
      {
        "template": "You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them."
      }
    ]
  },
  {
    "label": "Spectacle",
    "type": "keyword",
    "expression": "Spectacle <cost>",
    "reminderTexts": [
      {
        "template": "You may cast this spell for its spectacle cost rather than its mana cost if an opponent lost life this turn."
      }
    ]
  },
  {
    "label": "Epic",
    "type": "keyword",
    "expression": "Epic",
    "reminderTexts": [
      {
        "match": {
          "type": "hasTarget"
        },
        "template": "For the rest of the game, you can't cast spells. At the beginning of each of your upkeeps, copy this spell except for its epic ability. You may choose a new target for the copy."
      },
      {
        "template": "For the rest of the game, you can't cast spells. At the beginning of each of your upkeeps, copy this spell except for its epic ability."
      }
    ]
  },
  {
    "label": "Upgrade",
    "type": "keyword",
    "expression": "Upgrade",
    "reminderTexts": [
      {
        "template": "This creature enters covering another artifact you control. If it can't, exile it. Ignore the artifact it's covering. Anywhere this card goes, cards underneath it also go. It has haste."
      }
    ]
  },
  {
    "label": "Improvise",
    "type": "keyword",
    "expression": "Improvise",
    "reminderTexts": [
      {
        "template": "Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}."
      }
    ]
  },
  {
    "label": "Haste",
    "type": "keyword",
    "expression": "Haste",
    "reminderTexts": [
      {
        "template": "This creature can attack and {T} as soon as it comes under your control."
      }
    ]
  },
  {
    "label": "Freerunning",
    "type": "keyword",
    "expression": "Freerunning <cost>",
    "reminderTexts": [
      {
        "template": "You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander."
      }
    ]
  },
  {
    "label": "Cipher",
    "type": "keyword",
    "expression": "Cipher",
    "reminderTexts": [
      {
        "template": "Then you may exile this spell card encoded on a creature you control. Whenever that creature deals combat damage to a player, its controller may cast a copy of the encoded card without paying its mana cost."
      }
    ]
  },
  {
    "label": "Phasing",
    "type": "keyword",
    "expression": "Phasing",
    "reminderTexts": [
      {
        "template": "This phases in or out before you untap during each of your untap steps. While it's phased out, it's treated as though it doesn't exist."
      }
    ]
  },
  {
    "label": "Coststorm",
    "type": "keyword",
    "expression": "Coststorm",
    "reminderTexts": [
      {
        "template": "When you cast this spell, copy it for each different mana value among other spells and lands you've played this turn."
      }
    ]
  },
  {
    "label": "Positioning",
    "type": "keyword",
    "expression": "Positioning",
    "reminderTexts": [
      {
        "template": "As this creature enters, lock your creatures in order from left to right for as long as you control a creature with positioning. Each time a creature enters or comes under your control, position it to the left or right of another creature you control."
      }
    ]
  },
  {
    "label": "Sunburst",
    "type": "keyword",
    "expression": "Sunburst",
    "reminderTexts": [
      {
        "match": {
          "type": "hasSuperType",
          "values": ["creature"]
        },
        "template": "This enters with a +1/+1 counter on it for each color of mana spent to cast it."
      },
      {
        "template": "This enters with a charge counter on it for each color of mana spent to cast it."
      }
    ]
  },
  // {
  //   "label": "Life Loss",
  //   "type": "keyword",
  //   "expressions": [
  //     "life <*2> lost",
  //     "lost <*3> life",
  //     "lose<s> life"
  //   ],
  //   "reminderTexts": [
  //     {
  //       "template": "Damage causes loss of life."
  //     }
  //   ]
  // },
  {
    "label": "Surge",
    "type": "keyword",
    "expression": "Surge <cost>",
    "reminderTexts": [
      {
        "template": "You may cast this spell for its surge cost if you or a teammate has cast another spell this turn."
      }
    ]
  },
  {
    "label": "Exploit",
    "type": "keyword",
    "expression": "Exploit",
    "reminderTexts": [
      {
        "template": "When this creature enters, you may sacrifice a creature."
      }
    ]
  },
  {
    "label": "Rangeling",
    "type": "keyword",
    "expression": "Rangeling",
    "reminderTexts": [
      {
        "template": "This card is every land type, including Plains, Island, Swamp, Mountain, Forest, Desert, Gate, Lair, Locus, and all those Urza's ones."
      }
    ]
  },
  {
    "label": "Learn",
    "type": "keyword",
    "expression": "Learn",
    "reminderTexts": [
      {
        "template": "You may reveal a Lesson card you own from outside the game and put it into your hand, or discard a card to draw a card."
      }
    ]
  },
  {
    "label": "Waterbend",
    "type": "keyword",
    "expression": "Waterbend <cost>",
    "reminderTexts": [
      {
        "template": "While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}."
      }
    ]
  },
  {
    "label": "Storm",
    "type": "keyword",
    "expression": "Storm",
    "reminderTexts": [
      {
        "match": [{
          "type": "isPermanent"
        }, {
          "type": "hasTarget"
        }],
        "template": "When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies. Copies become tokens."
      },
      {
        "match": {
          "type": "isPermanent"
        },
        "template": "When you cast this spell, copy it for each spell cast before it this turn. Copies become tokens."
      },
      {
        "match": {
          "type": "hasTarget"
        },
        "template": "When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies."
      },
      {
        "template": "When you cast this spell, copy it for each spell cast before it this turn."
      }
    ]
  },
  {
    "label": "Escalate",
    "type": "keyword",
    "expression": "Escalate <cost>",
    "reminderTexts": [
      {
        "template": "Pay this cost for each mode chosen beyond the first."
      }
    ]
  },
  {
    "label": "Wither",
    "type": "keyword",
    "expression": "Wither",
    "reminderTexts": [
      {
        "template": "This deals damage to creatures in the form of -1/-1 counters."
      }
    ]
  },
  {
    "label": "Enlist",
    "type": "keyword",
    "expression": "Enlist",
    "reminderTexts": [
      {
        "template": "As this creature attacks, you may tap a nonattacking creature you control without summoning sickness. When you do, add its power to this creature's until end of turn."
      }
    ]
  },
  {
    "label": "Megasunburst",
    "type": "keyword",
    "expression": "Megasunburst",
    "reminderTexts": [
      {
        "match": {
          "type": "hasSuperType",
          "values": ["creature"]
        },
        "template": "This enters the battlefield with two +1/+1 counters on it for each color of mana spent to cast it"
      },
      {
        "template": "This enters with two charge counters on it for each color of mana spent to cast it."
      }
    ]
  },
  {
    "label": "Haunt",
    "type": "keyword",
    "expression": "Haunt",
    "reminderTexts": [
      {
        "match": {
          "type": "hasSuperType",
          "values": ["creature"]
        },
        "template": "When this creature dies, exile it haunting target creature."
      },
      {
        "template": "When this spell card is put into a graveyard after resolving, exile it haunting target creature."
      }
    ]
  },
  {
    "label": "Gravestorm",
    "type": "keyword",
    "expression": "Gravestorm",
    "reminderTexts": [
      {
        "match": {
          "type": "hasTarget"
        },
        "template": "When you cast this spell, copy it for each permanent put into a graveyard this turn. You may choose new targets for the copies."
      },
      {
        "template": "When you cast this spell, copy it for each permanent put into a graveyard from the battlefield this turn."
      }
    ]
  },
  {
    "label": "Forage",
    "type": "keyword",
    "expression": "Forage",
    "reminderTexts": [
      {
        "template": "To forage, exile three cards from your graveyard or sacrifice a Food."
      }
    ]
  },
  {
    "label": "Jump-start",
    "type": "keyword",
    "expression": "Jump-start",
    "reminderTexts": [
      {
        "template": "You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card."
      }
    ]
  },
  {
    "label": "Oildying",
    "type": "keyword",
    "expression": "Oildying",
    "reminderTexts": [
      {
        "template": "When this creature dies, if it had no oil counters on it, return it to the battlefield under its owner's control with an oil counter on it."
      }
    ]
  },
  {
    "label": "Ravenous",
    "type": "keyword",
    "expression": "Ravenous <cost>",
    "reminderTexts": [
      {
        "template": "This creature enters with X +1/+1 counters on it. If X is 5 or more, draw a card when it enters."
      }
    ]
  },
  {
    "label": "Provoke",
    "type": "keyword",
    "expression": "Provoke",
    "reminderTexts": [
      {
        "template": "Whenever this creature attacks, you may have target creature defending player controls untap and block it if able."
      }
    ]
  },
  {
    "label": "Undaunted",
    "type": "keyword",
    "expression": "Undaunted",
    "reminderTexts": [
      {
        "template": "This spell costs {1} less to cast for each opponent."
      }
    ]
  },
  {
    "label": "Duress",
    "type": "keyword",
    "expression": "Duress",
    "reminderTexts": [
      {
        "template": "Look at their hand, make them discard a noncreature, nonland."
      }
    ]
  },
  {
    "label": "Landwalk",
    "type": "keyword",
    "expression": "<prefix:landtype>walk",
    "reminderTexts": [
      {
        "template": "This creature can't be blocked as long as defending player controls a <landtype>."
      }
    ]
  },
  {
    "label": "Tiered",
    "type": "keyword",
    "expression": "Tiered",
    "reminderTexts": [
      {
        "template": "Choose one additional cost."
      }
    ]
  },
  {
    "label": "Pledge",
    "type": "keyword",
    "expression": "Pledge",
    "reminderTexts": [
      {
        "template": "Join a two-colored guild if you haven't already this game."
      }
    ]
  },
  {
    "label": "Megalegendary",
    "type": "keyword",
    "expression": "Megalegendary",
    "reminderTexts": [
      {
        "template": "Your deck can have only one copy of this card."
      }
    ]
  },
  {
    "label": "Decayed",
    "type": "keyword",
    "expression": "Decayed",
    "reminderTexts": [
      {
        "template": "This creature can't block. When it attacks, sacrifice it at end of combat."
      }
    ]
  }
];