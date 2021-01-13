(() => {
    ko.applyBindings(new MainVm());

    function MainVm() {
        const self = this;

        self.searchTerm = ko.observable('');
        self.pageSize = ko.observable(5);
        self.isSearching = ko.observable(false);
        self.resultItems = ko.mapping.fromJS([]);
        self.totalResults = ko.observable(0);
        self.showResultPanel = ko.observable(false);
        self.totalDurationResuls = ko.observable(0);

        const durationMap = {};

        self.getVideoDuration = function(item) {
            return durationMap[item] || '00:00:00';
        };

        self.doSearch = function(theForm) {
            self.isSearching(true);

            const searchUrl = getSearchUrl(self.searchTerm(), self.pageSize());

            getJson(searchUrl).then((response) => {
                //console.log(response);

                ko.mapping.fromJS(response.items, {}, self.resultItems);
                self.totalResults(new Intl.NumberFormat('pt-BR').format(response.pageInfo.totalResults));
                self.showResultPanel(true);
                //console.log(response.items);

                const idsArray = response.items.map(x => x.id.videoId);
                const detailsUrl = getDetailsUrl(idsArray);

                return getJson(detailsUrl);
            }).then((response) => {
                console.log(response);
                self.isSearching(false);

                let seconds = 0;
                for (let i in response.items) {
                    durationMap[ response.items[i].id ] = response.items[i].contentDetails.duration;
                    console.log(response.items[i].contentDetails.duration);
                    seconds += getTimeInSeconds(response.items[i].contentDetails.duration);
                }

                self.totalDurationResuls(formatSeconds(seconds));
            }).catch((err) => {
                console.log('Error: ', err);

                self.isSearching(false);
            });

            return false;
        };
    }
})();