function getSearchUrl(searchTerm, pageSize, key) {
    return 'https://youtube.googleapis.com/youtube/v3/search?' +
    'part=snippet&' +
    'type=video&' +
    'maxResults=' + pageSize + '&' +
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