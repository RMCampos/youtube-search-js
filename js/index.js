(() => {
    ko.applyBindings(new MainVm());

    function MainVm() {
        const self = this;

        self.searchTerm = ko.observable('Joinville');
        self.pageSize = ko.observable(3);
        self.isSearching = ko.observable(false);
        self.resultItems = ko.mapping.fromJS([]);
        self.totalResults = ko.observable(0);
        self.showResultPanel = ko.observable(false);

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
                //console.log('DEU!', response);
                self.isSearching(false);

                for (let i in response.items) {
                    console.log(response.items[i].contentDetails.duration);
                }
            }).catch((err) => {
                console.log('Error: ', err);

                self.isSearching(false);
            });

            return false;
        };
    }
})();