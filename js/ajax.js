/**
 * Get JSON from given URL
 * @param {string} pUrl - Destiny URL to get JSON
 */
function getJson(pUrl) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', pUrl);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.response));
                } catch (e) {
                    resolve(xhr.response);
                }
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = () => reject(xhr.statusText);
        xhr.send();
    });
}
