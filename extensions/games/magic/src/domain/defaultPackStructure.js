export default () => ([
    {
        label: 'Commons',
        count: 10,
        pool: [{
            expression: 'r=c -t:land',
            weight: 1
        }],
        collation: 'runs'
    },
    {
        label: 'Uncommons',
        count: 3,
        pool: [{
            expression: 'r=u -t:land',
            weight: 1
        }],
        collation: 'runs'
    },
    {
        label: 'Rares & Mythics',
        count: 1,
        pool: [{
            expression: 'r=r -t:land',
            weight: 2
        }, {
            expression: 'r=m -t:land',
            weight: 1
        }],
        collation: 'sheet'
    },
    {
        label: 'Land',
        count: 1,
        pool: [{
            expression: 't:land r=c',
            weight: 6
        }, {
            expression: 't:land r=u',
            weight: 10
        }, {
            expression: 't:land r=r',
            weight: 2
        }, {
            expression: 't:land r=m',
            weight: 2
        }],
        collation: 'sheet'
    },
]);
