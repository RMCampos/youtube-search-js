(() => {
    ko.applyBindings(new IndexVm());

    function IndexVm() {
        const self = this;

        self.searchTerm = ko.observable('');
        self.pageSize = ko.observable(5);
        self.isSearching = ko.observable(false);
        self.resultItems = ko.mapping.fromJS([]);
        self.totalResults = ko.observable(0);
        self.showResultPanel = ko.observable(false);
        self.totalDurationResuls = ko.observable(0);
        self.wordsResult = ko.mapping.fromJS([]);

        function _updateVideoDuration(videoId, durationSeconds) {
            ko.utils.arrayForEach(self.resultItems(), (item) => {
                if (item.id.videoId() === videoId) {
                    item.durationSec(durationSeconds);
                    item.duration(formatSeconds(durationSeconds));
                }
            });
        }

        function _startWordsAnalytics() {
            const wordsMap = {};

            ko.utils.arrayForEach(self.resultItems(), (item) => {
                //console.log('titulo: ' + item.snippet.title() + ', description: ' + item.snippet.description());
                const titleMap = countWords(item.snippet.title());

                // Must be non-empty maps
                if (Object.keys(titleMap).length > 0 && titleMap.constructor === Object) {
                    for (const key in titleMap) {
                        if (wordsMap[key] === undefined) {
                            wordsMap[key] = titleMap[key];
                        } else {
                            wordsMap[key] = wordsMap[key] + titleMap[key];
                        }
                    }
                }

                const descriptionMap = countWords(item.snippet.description());
                if (Object.keys(descriptionMap).length > 0 && descriptionMap.constructor === Object) {
                    for (const key in descriptionMap) {
                        if (wordsMap[key] === undefined) {
                            wordsMap[key] = descriptionMap[key];
                        } else {
                            wordsMap[key] = wordsMap[key] + descriptionMap[key];
                        }
                    }
                }
            });

            // sort
            let sortable = [];
            for (const key in wordsMap) {
                sortable.push([key, wordsMap[key]]);
            }
            sortable.sort(function(a, b) {
                return b[1] - a[1];
            });

            const wordsResultArray = [];
            for (let i=0; i<5; i++) {
                wordsResultArray.push({
                    palavra: sortable[i][0],
                    total: sortable[i][1],
                });
            }

            console.log('finished!', sortable);

            ko.mapping.fromJS(wordsResultArray, {}, self.wordsResult);
        }

        self.doSearch = function(theForm) {
            self.isSearching(true);

            const searchUrl = getSearchUrl(self.searchTerm(), self.pageSize());

            getJson(searchUrl).then((response) => {
                //console.log(response);

                response.items.forEach((item) => {
                    item.durationSec = 0;
                    item.duration = 'Retrieving...';
                });

                ko.mapping.fromJS(response.items, {}, self.resultItems);
                self.totalResults(new Intl.NumberFormat('pt-BR').format(response.pageInfo.totalResults));
                self.showResultPanel(true);
                //console.log(response.items);

                const idsArray = response.items.map(x => x.id.videoId);
                const detailsUrl = getDetailsUrl(idsArray);

                return getJson(detailsUrl);
            }).then((response) => {
                console.log(response);

                let totalSeconds = 0;
                for (let i in response.items) {
                    const sec = getTimeInSeconds(response.items[i].contentDetails.duration);
                    totalSeconds += sec;

                    _updateVideoDuration(response.items[i].id, sec);
                }

                _startWordsAnalytics();

                self.totalDurationResuls(formatSeconds(totalSeconds));
                self.isSearching(false);
            }).catch((err) => {
                console.log('Error: ', err);
                self.isSearching(false);
            });

            return false;
        };
    }
})();