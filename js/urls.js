/**
 * Creates URL for searching
 * @param {string} searchTerm - Term to be searched for
 * @param {string} key - Youtube API Key
 * @param {string} pageToken - Current page token (optional). If informed, will get next page.
 */
function getSearchUrl(searchTerm, key, pageToken) {
    if (pageToken !== undefined) {
        pageToken = 'pageToken=' + pageToken + '&';
    } else {
        pageToken = '';
    }

    return 'https://youtube.googleapis.com/youtube/v3/search?' +
    'part=snippet&' +
    'type=video&' +
    'order=viewCount&' +
    pageToken +
    'maxResults=50&' +
    'q=' + searchTerm + '&' +
    'key=' + key;
}

/**
 * Creates URL for details (like duration and others)
 * @param {array} idsArray - An array of IDs
 * @param {string} key - Youtube API Key
 */
function getDetailsUrl(idsArray, key) {
    let url = 'https://www.googleapis.com/youtube/v3/videos?';

    for (i in idsArray) {
        url += 'id=' + idsArray[i] + '&';
    }
    
    url += 'part=contentDetails&key=' + key;
    return url;
}
