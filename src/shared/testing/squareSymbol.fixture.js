export const squarePart = [
    'part:',
    '\ttype: shape',
    '\tname: Square',
    '\tcombine: overlap',
    '\tpoint:',
    '\t\tposition: (0.2000000000,0.2000000000)',
    '\t\tlock: free',
    '\t\tline_after: line',
    '\tpoint:',
    '\t\tposition: (0.2000000000,0.8000000000)',
    '\t\tlock: free',
    '\t\tline_after: line',
    '\tpoint:',
    '\t\tposition: (0.8000000000,0.8000000000)',
    '\t\tlock: free',
    '\t\tline_after: line',
    '\tpoint:',
    '\t\tposition: (0.8000000000,0.2000000000)',
    '\t\tlock: free',
    '\t\tline_after: line',
].join('\n');

export const squareSymbol = `mse_version: 0.3.5\n${squarePart}\n`;

