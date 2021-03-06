/**
 * Converts an ISO 8601 duration to seconds.
 * @param {string} ptTime - A string in ISO 8601 format. E.g.: PT15M33S.
 */
function getTimeInSeconds(ptTime) {
    if (!ptTime) {
        return 0;
    }

    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    let time = ptTime.replace('PT', '');
    if (time.includes('H')) {
        const idxH = time.indexOf('H');
        hours = parseInt(time.substring(0, idxH));
        time = time.substring(idxH+1);
    }
    if (time.includes('M')) {
        const idxM = time.indexOf('M');
        minutes = parseInt(time.substring(0, idxM));
        time = time.substring(idxM+1);
    }
    if (time.includes('S')) {
        const idxS = time.indexOf('S');
        seconds = parseInt(time.substring(0, idxS));
    }

    return seconds + (minutes * 60) + (hours * 3600);
}

/**
 * Format a given number in seconds to human furmat. Eg: 00:15:10.
 * @param {number} pSeconds - An integer representing the seconds.
 */
function formatSeconds(pSeconds) {
    if (!pSeconds) {
        return '';
    }

    let hours = 0;
    let minutes = 0;
    if (pSeconds > 3600) {
        hours = parseInt(pSeconds / 3600);
        pSeconds = pSeconds - (hours * 3600);
    }
    if (pSeconds > 60) {
        minutes = parseInt(pSeconds / 60);
        pSeconds = pSeconds - (minutes * 60);
    }

    const hourStr = String(hours).padStart(2, '0')
    const minStr = String(minutes).padStart(2, '0');
    const secStr = String(pSeconds).padStart(2, '0');
    return `${hourStr}:${minStr}:${secStr}`;
}

/**
 * Count the number of words in a given text.
 * @param {string} text - Text to be counted.
 */
function countWords(text) {
    if (!text) {
        return {};
    }

    const ignoreList = ['-','...'];
    const wordsMap = {};
    const wordsArray = text.split(' ');
    for (let i in wordsArray) {
        const len = wordsArray[i].trim().length;

        if (wordsArray[i].trim() !== '' && ignoreList.indexOf(wordsArray[i].trim()) === -1 && len > 2) {
            let word = wordsArray[i].trim();

            // Remove: ,
            word = word.replace(',', '');

            if (wordsMap[word] === undefined) {
                wordsMap[word] = 1;
            } else {
                wordsMap[word] = wordsMap[word] + 1;
            }
        }
    }

    return wordsMap;
}
