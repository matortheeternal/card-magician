const romanMap = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
};

export default function romanToInt(s) {
    let total = 0;
    for (let i = 0; i < s.length; i++) {
        const currentCharValue = romanMap[s[i]];
        const nextCharValue = romanMap[s[i + 1]];
        total += (nextCharValue && nextCharValue > currentCharValue)
            ? -currentCharValue
            : currentCharValue;
    }

    return total;
}
