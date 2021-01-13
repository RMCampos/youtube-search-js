getTimeInSeconds = (ptTime) => {
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
        console.log('hours', hours);
        time = time.substring(idxH+1);
    }
    if (time.includes('M')) {
        const idxM = time.indexOf('M');
        minutes = parseInt(time.substring(0, idxM));
        console.log('minutes', minutes);
        time = time.substring(idxM+1);
    }
    if (time.includes('S')) {
        const idxS = time.indexOf('S');
        seconds = parseInt(time.substring(0, idxS));
        console.log('seconds', seconds);
    }

    return seconds + (minutes * 60) + (hours * 3600);
}

formatSeconds = (pSeconds) => {
    if (!pSeconds) {
        return '';
    }

    let hours = 0;
    let minutes = 0;
    if (pSeconds > 3600) {
        hours = pSeconds / 3600;
        pSeconds = pSeconds % 3600;
    }
    if (pSeconds > 60) {
        minutes = pSeconds / 60;
        pSeconds = pSeconds % 60;
    }

    const hourStr = String(hours).padStart(2);
    const minStr = String(minutes).padStart(2);
    const secStr = String(pSeconds).padStart(2);
    return `${hourStr}:${minStr}:${secStr}`;
}