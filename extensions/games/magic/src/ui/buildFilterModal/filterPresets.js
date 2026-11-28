import { getProjectSubtypes, getProjectTags } from './filterHelpers.js';

const L = localize('build-filter-modal');

const colorTypeGroup = {
    label: L`Color Type`,
    options: [
        { q: 'colors=0',  label: L`Colorless`, },
        { q: 'colors=1',  label: L`Monocolor` },
        { q: 'colors>1',  label: L`Multicolor` },
        { q: 'is:hybrid', label: L`Hybrid` },
        { q: 'colors=2',  label: L`Two-color` },
        { q: 'colors=3',  label: L`Three-color` },
        { q: 'colors=4',  label: L`Four-color` },
        { q: 'colors=5',  label: L`Five-color` },
    ]
};

const colorGroup = {
    label: L`Color`,
    options: [
        { q: 'c=w', symbol: 'W',    hint: L`White cards` },
        { q: 'c=u', symbol: 'U',    hint: L`Blue cards`  },
        { q: 'c=b', symbol: 'B',    hint: L`Black cards` },
        { q: 'c=r', symbol: 'R',    hint: L`Red cards`   },
        { q: 'c=g', symbol: 'G',    hint: L`Green cards` },
        { q: 'c=wu', symbol: 'W/U', hint: L`Azorius` },
        { q: 'c=wb', symbol: 'W/B', hint: L`Orzhov` },
        { q: 'c=ub', symbol: 'U/B', hint: L`Dimir` },
        { q: 'c=ur', symbol: 'U/R', hint: L`Izzet` },
        { q: 'c=br', symbol: 'B/R', hint: L`Rakdos` },
        { q: 'c=bg', symbol: 'B/G', hint: L`Golgari` },
        { q: 'c=gr', symbol: 'G/R', hint: L`Gruul` },
        { q: 'c=rw', symbol: 'R/W', hint: L`Boros` },
        { q: 'c=gw', symbol: 'G/W', hint: L`Selesnya` },
        { q: 'c=gu', symbol: 'G/U', hint: L`Simic` },
    ]
};

const typeGroup = {
    label: L`Card Type`,
    allowMultiple: true,
    options: [
        { q: 't:creature',     label: L`Creature`      },
        { q: 't:legendary',    label: L`Legendary`     },
        { q: 't:artifact',     label: L`Artifact`      },
        { q: 't:instant',      label: L`Instant`       },
        { q: 't:enchantment',  label: L`Enchantment`   },
        { q: 't:sorcery',      label: L`Sorcery`       },
        { q: 't:land',         label: L`Land`          },
        { q: 't:planeswalker', label: L`Planeswalker`  },
        { q: 't:token',        label: L`Token`         },
        { q: 't:emblem',       label: L`Emblem`        },
        { q: 'is:permanent',   label: L`Permanent`     },
        { q: '-is:permanent',  label: L`Non-Permanent` },
    ]
};

const manaValueGroup = {
    label: L`Mana Value`,
    options: [
        { q: 'cmc<3',            label: L`Low MV` },
        { q: '(cmc=3 OR cmc=4)', label: L`Medium MV` },
        { q: 'cmc>=5',           label: L`High MV` },
        { q: 'cmc=0',            label: L`0` },
        { q: 'cmc=1',            label: L`1` },
        { q: 'cmc=2',            label: L`2` },
        { q: 'cmc=3',            label: L`3` },
        { q: 'cmc=4',            label: L`4` },
        { q: 'cmc=5',            label: L`5` },
        { q: 'cmc=6',            label: L`6` },
        { q: 'cmc>=7',           label: L`7+` },
        { q: 'mana:{X}',         label: L`X Cost` },
    ]
};

const shapeGroup = {
    label: L`Creature Shape`,
    options: [
        {
            q: 'pow=tou',
            label: L`Square`,
            hint: L`Creatures with power equal to toughness`
        },
        {
            q: 'pow>tou',
            label: L`Aggressive`,
            hint: L`Creatures with power greater than toughness`
        },
        {
            q: 'tou>pow',
            label: L`Defensive`,
            hint: L`Creatures with toughness greater than power`
        },
    ]
};

const powerGroup = {
    label: L`Power`,
    options: [
        { q: 'pow=0', label: L`0` },
        { q: 'pow=1', label: L`1` },
        { q: 'pow=2', label: L`2` },
        { q: 'pow=3', label: L`3` },
        { q: 'pow=4', label: L`4` },
        { q: 'pow=5', label: L`5` },
        { q: 'pow>=6', label: L`6+` },
    ]
};

const toughnessGroup = {
    label: L`Toughness`,
    options: [
        { q: 'tou=0', label: L`0` },
        { q: 'tou=1', label: L`1` },
        { q: 'tou=2', label: L`2` },
        { q: 'tou=3', label: L`3` },
        { q: 'tou=4', label: L`4` },
        { q: 'tou=5', label: L`5` },
        { q: 'tou>=6', label: L`6+` },
    ]
};

const textGroup = {
    label: L`Rules Text`,
    allowMultiple: true,
    options: [
        {
            q: 'o:/draw [^\\s]+ cards?/',
            label: L`Draws cards`,
        },
        {
            q: '(o:/scry|surveil|connive|look at the top/ or (o:draw o:discard))',
            label: L`Card Selection`,
        },
        {
            q: '(o:destroy or o:exile or '
                + 'o:/damage to (target creature|any target|each creature)/)',
            label: L`Hard removal`,
        },
        {
            q: 'o:/(return|put|cast|play) .*from .*graveyard/',
            label: L`Recursion`,
        },
        {
            q: 'o:/when (this [^\\s]+|~|@|CARDNAME) enters/',
            label: L`Has ETB`
        },
        {
            q: 'o:/when (this [^\\s]+|~|@|CARDNAME) dies/',
            label: L`Has dies trigger`
        },
        { q: 'o:":"',      label: L`Has activated ability` },
        { q: 'o:whenever', label: L`Repeatable trigger`    },
        { q: 'o=""',       label: L`Vanilla`               },

        { q: 'o:"+1/+1 counter"', label: L`+1/+1 counters` },
    ]
};

const keywordsGroup = {
    label: L`Keywords`,
    allowMultiple: true,
    options: [
        { q: 'kw:flash',           label: L`Flash`          },
        { q: 'kw:flying',          label: L`Flying`         },
        { q: 'kw:trample',         label: L`Trample`        },
        { q: 'kw:vigilance',       label: L`Vigilance`      },
        { q: 'kw:lifelink',        label: L`Lifelink`       },
        { q: 'kw:haste',           label: L`Haste`          },
        { q: 'kw:defender',        label: L`Defender`       },
        { q: 'kw:deathtouch',      label: L`Deathtouch`     },
        { q: 'kw:"first strike"',  label: L`First strike`   },
        { q: 'kw:"double strike"', label: L`Double strike`  },
        { q: 'kw:menace',          label: L`Menace`         },
        { q: 'kw:reach',           label: L`Reach`          },
        { q: 'kw:indestructible',  label: L`Indestructible` },
        { q: 'kw:hexproof',        label: L`Hexproof`       },
        { q: 'kw:ward',            label: L`Ward`           },
    ]
};

const commonSubtypes = ['aura', 'equipment', 'saga', 'vehicle'];
const subtypeGroup = {
    label: L`Subtypes`,
    dynamicCount: 10,
    dynamic: () => {
        return Object.entries(getProjectSubtypes())
            .sort((a, b) => b[1] - a[1])
            .map(([subtype]) => subtype)
            .filter(subtype => !commonSubtypes.includes(subtype.toLowerCase()))
            .map(subtype => ({
                label: subtype,
                q: `t:${subtype.toLowerCase()}`
            }));
    },
    options: [
        { q: 't:aura',      label: L`Aura`      },
        { q: 't:equipment', label: L`Equipment` },
        { q: 't:saga',      label: L`Saga`      },
        { q: 't:vehicle',   label: L`Vehicle`   },
    ]
};

const rarityGroup = {
    label: L`Rarity`,
    options: [
        { q: 'r:c',  label: L`Common` },
        { q: 'r:u',  label: L`Uncommon` },
        { q: 'r:r',  label: L`Rare` },
        { q: 'r:m',  label: L`Mythic Rare` },
        { q: 'r:s',  label: L`Special` },
        { q: 'r:b',  label: L`Basic Land` },
    ]
};

const manaColors = [...'wubrg'];
const anyColorPair = manaColors.flatMap((color, index) =>
    manaColors.slice(index + 1).map(other => `produces:${color}${other}`)
).join(' or ');

const producesGroup = {
    label: L`Mana Production`,
    options: [
        { q: 't:creature -t:land produces>0', label: L`Mana Dorks` },
        { q: 't:artifact -t:land produces>0', label: L`Mana Rocks` },
        { q: `(${anyColorPair})`, label: L`Color Fixers` },
    ]
};

const tagsGroup = {
    label: L`Tags`,
    allowMultiple: true,
    dynamicCount: 25,
    dynamic: () => {
        return Object.entries(getProjectTags())
            .sort((a, b) => b[1] - a[1])
            .map(([tag]) => ({
                label: tag,
                q: `tag=${tag.toLowerCase()}`
            }));
    },
};

export default [
    colorTypeGroup,
    colorGroup,
    typeGroup,
    rarityGroup,
    manaValueGroup,
    shapeGroup,
    powerGroup,
    toughnessGroup,
    subtypeGroup,
    textGroup,
    keywordsGroup,
    producesGroup,
    tagsGroup
];
