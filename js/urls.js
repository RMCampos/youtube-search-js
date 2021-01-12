function getSearchUrl(searchTerm, pageSize) {
    return 'https://youtube.googleapis.com/youtube/v3/search?' +
    'part=snippet&' +
    'type=video&' +
    'maxResults=' + pageSize + '&' +
    'q=' + searchTerm + '&' +
    'key=KEY';
}

function getDetailsUrl(idsArray) {
    let url = 'https://www.googleapis.com/youtube/v3/videos?';

    for (i in idsArray) {
        url += 'id=' + idsArray[i] + '&';
    }
    
    url += 'part=contentDetails&key=KEY';
    return url;
}