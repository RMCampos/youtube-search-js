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

function getDetailsUrl(idsArray, key) {
    let url = 'https://www.googleapis.com/youtube/v3/videos?';

    for (i in idsArray) {
        url += 'id=' + idsArray[i] + '&';
    }
    
    url += 'part=contentDetails&key=' + key;
    return url;
}