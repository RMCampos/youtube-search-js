(() => {
    ko.applyBindings(new IndexVm());

    function IndexVm() {
        const self = this;

        self.googleKey = ko.observable('');
        self.searchTerm = ko.observable('');
        self.errorMsg = ko.observable('');
        self.isSearching = ko.observable(false);
        self.resultItems = ko.mapping.fromJS([]);
        self.totalResults = ko.observable(0);
        self.showResultPanel = ko.observable(false);
        self.totalDurationResuls = ko.observable(0);
        self.wordsResult = ko.mapping.fromJS([]);
        self.minAvSun = ko.observable();
        self.minAvMon = ko.observable();
        self.minAvTue = ko.observable();
        self.minAvWed = ko.observable();
        self.minAvThu = ko.observable();
        self.minAvFri = ko.observable();
        self.minAvSat = ko.observable();
        self.numDays = ko.observable();
        self.isUpdating = ko.observable(false);
        self.updateErrorMsg = ko.observable('');
        self.pageToken = ko.observable('');
        self.allVideosArray = [];
        self.exampleEnabled = ko.observable(false);
        self.logEnabled = ko.observable(true);
        self.daysLimit = ko.observable(1000);

        // Pagination
        self.showPagination = ko.observable(false);
        self.pages = ko.observableArray([]);
        self.totalItems = ko.observable(0);
        self.currentPage = ko.observable(0);
        self.pageSize = ko.observable(10);
        self.maxPages = ko.observable(20);
        self.totalPages = ko.observable(20);

        function _updateVideoDuration(videosArray, videoId, durationSeconds) {
            videosArray.forEach((item) => {
                if (item.id.videoId === videoId) {
                    item.durationSec = durationSeconds;
                    item.duration = formatSeconds(durationSeconds);
                }
            });
        }

        function _startWordsAnalysis() {
            const wordsMap = {};

            self.allVideosArray.forEach((item) => {
                const titleMap = countWords(item.snippet.title);

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

                const descriptionMap = countWords(item.snippet.description);
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

            // Sort
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

            ko.mapping.fromJS(wordsResultArray, {}, self.wordsResult);
        }

        function _startTimeAnalysis() {
            self.closeUpdateMsg();
            let secondArray = [];

            if (!self.exampleEnabled()) {
                self.allVideosArray.forEach((item) => {
                    secondArray.push(item.durationSec);
                });
            }

            if (self.exampleEnabled()) {
                // Define o tempo livre para cada dia
                self.minAvSun(15);
                self.minAvMon(120);
                self.minAvTue(30);
                self.minAvWed(150);
                self.minAvThu(20);
                self.minAvFri(40);
                self.minAvSat(90);

                // Adiciona os vídeos
                secondArray.push(20 * 60);
                secondArray.push(30 * 60);
                secondArray.push(60 * 60);
                secondArray.push(90 * 60);
                secondArray.push(200 * 60);
                secondArray.push(30 * 60);
                secondArray.push(40 * 60);
                secondArray.push(20 * 60);
                secondArray.push(60 * 60);
                secondArray.push(15 * 60);

                self.totalResults(10);
                self.totalDurationResuls(formatSeconds(465 * 60));
            }

            let available = self.minAvSun()
                + self.minAvMon()
                + self.minAvTue()
                + self.minAvWed()
                + self.minAvThu()
                + self.minAvFri()
                + self.minAvSat();

            if (!available) {
                self.updateErrorMsg('Nenhum tempo disponível para vídeos!');
                return;
            }

            const days = [
                parseInt(self.minAvSun() || "0"),
                parseInt(self.minAvMon() || "0"),
                parseInt(self.minAvTue() || "0"),
                parseInt(self.minAvWed() || "0"),
                parseInt(self.minAvThu() || "0"),
                parseInt(self.minAvFri() || "0"),
                parseInt(self.minAvSat() || "0"),
            ];

            /*
            * Regra extra, obter o dia com maior tempo livre
            * se algum vídeo for maior que o maior, ignorar
            */
            let maior = 0;
            for (const i in days) {
                if (days[i] > maior) {
                    maior = days[i];
                }
            }

            if (self.logEnabled()) {
                console.log('Days:', days);
                console.log('Dia com mais minutos livre:', maior);
            }

            let currentDay = 1; // Dia atual, de 1 a 7
            let daysNedeed = 0; // Dias necessários para assistir a todos os vídeos
            let max = 0; // Variável de segurança

            do {
                let secsSpend = 0;

                // Obtém o próximo dia
                const weekDay = days[currentDay-1];
                let weekDaySeconds = weekDay * 60;
                let videosWatched = 0;

                if (self.logEnabled()) {
                    console.log('\nDisponível no dia:', weekDay, 'min');
                }

                do {
                    // Obtém o próximo video
                    let nextVideoSec = parseInt(secondArray.splice(0, 1));
                    let nextVideoMin = nextVideoSec / 60;

                    if (self.logEnabled()) {
                        console.log('Duração do próximo vídeo:', nextVideoMin, 'min');
                    }

                    // Se a duração do vídeo for maior do que o disponível no dia, ignora o vídeo
                    if (nextVideoSec > weekDaySeconds) {
                        if (self.logEnabled()) {
                            console.log('Vídeo com duração maior do que o tempo disponível no dia, ignorando.');
                        }
                        
                        // Condição extra, se o vídeo puder ser assitido, isto é,
                        // Se a sua duração couber em algum dia, deixa ele na lista
                        // Se não, ignora o vídeo DEV. Não entendi!
                        if (nextVideoMin < maior) {
                            secondArray.splice(0, 0, nextVideoSec);
                        } else {
                            continue;
                        }

                        break;
                    }

                    videosWatched++;
                    weekDaySeconds -= nextVideoSec;
                    secsSpend += nextVideoSec;

                    if (self.logEnabled()) {
                        console.log('Vídeo assistido!!! Duração:', nextVideoMin, 'min, sobrando no dia:', (weekDaySeconds / 60), 'min');
                    }
                } while (weekDaySeconds > 0 && secondArray.length > 0);

                daysNedeed++;

                currentDay++;
                if (currentDay == 8) {
                    currentDay = 1;
                }

                if (self.logEnabled()) {
                    console.log('Finalizado vídeos do dia! Minutos gastos:', (secsSpend / 60), ', vídeos assistidos:', videosWatched, ', dias gastos:', daysNedeed);
                }

                max++;
            } while (secondArray.length > 0 && max < self.daysLimit());

            console.log('finished ALL! Days:', daysNedeed);
            self.numDays(daysNedeed);
        }

        function _doPagination(pCurrentPage) {
            if (!pCurrentPage) {
                pCurrentPage = 1;
            }

            self.currentPage(pCurrentPage);

            // ensure current page isn't out of range
            if (self.currentPage() < 1) {
                self.currentPage(1);
            } else if (self.currentPage() > self.totalPages()) {
                self.currentPage(self.totalPages());
            }

            let startPage, endPage;
            if (self.totalPages() <= self.maxPages()) {
                // total pages less than max so show all pages
                startPage = 1;
                endPage = self.totalPages();
            } else {
                // total pages more than max so calculate start and end pages
                let maxPagesBeforeCurrentPage = Math.floor(self.maxPages() / 2);
                let maxPagesAfterCurrentPage = Math.ceil(self.maxPages() / 2) - 1;
                if (self.currentPage() <= maxPagesBeforeCurrentPage) {
                    // current page near the start
                    startPage = 1;
                    endPage = self.maxPages();
                } else if (self.currentPage() + maxPagesAfterCurrentPage >= self.totalPages()) {
                    // current page near the end
                    startPage = self.totalPages() - self.maxPages() + 1;
                    endPage = self.totalPages();
                } else {
                    // current page somewhere in the middle
                    startPage = self.currentPage() - maxPagesBeforeCurrentPage;
                    endPage = self.currentPage() + maxPagesAfterCurrentPage;
                }
            }

            // calculate start and end item indexes
            let startIndex = (self.currentPage() - 1) * self.pageSize();
            let endIndex = Math.min(startIndex + self.pageSize(), self.totalItems() - 1);

            // create an array of pages to ng-repeat in the pager control
            let newArray = self.allVideosArray.slice(startIndex, endIndex);

            self.resultItems([]);
            ko.mapping.fromJS(newArray, {}, self.resultItems);
        }

        function _doValidations() {
            self.errorMsg('');

            if (self.googleKey() === '') {
                self.errorMsg('Por favor, informe a Chave da API do Google :)');
                return false;
            }

            if (self.searchTerm() === '') {
                self.errorMsg('Por favor, informe um termo de pesquisa :)');
                return false;
            }

            return true;
        }

        function _getVideos(pageToken) {
            if (self.pageToken() !== '') {
                pageToken = self.pageToken();
            }

            return new Promise((resolve) => {
                const searchUrl = getSearchUrl(
                    self.searchTerm(),
                    self.googleKey(),
                    pageToken
                );

                getJson(searchUrl).then((responseA) => {
                    console.log('First request OK');
                    self.pageToken(responseA.nextPageToken);

                    responseA.items.forEach((item) => {
                        item.durationSec = 0;
                        item.duration = 'Retrieving...';
    
                        self.allVideosArray.push(item);
                    });

                    const idsArray = responseA.items.map(x => x.id.videoId);
                    const detailsUrl = getDetailsUrl(idsArray, self.googleKey());

                    getJson(detailsUrl).then((responseB) => {
                        console.log('Second request OK');
                        for (let i in responseB.items) {
                            const sec = getTimeInSeconds(responseB.items[i].contentDetails.duration);
                            _updateVideoDuration(responseA.items, responseB.items[i].id, sec);
                        }
                        
                        console.log('Resolving!');
                        resolve();
                    });
                });
            });
        }

        self.closeOops = function() {
            self.errorMsg('');
        };

        self.closeUpdateMsg = function() {
            self.updateErrorMsg('');
        };

        self.doSearch = function() {
            if (self.exampleEnabled()) {
                _startTimeAnalysis();
                self.showResultPanel(true);
                self.showPagination(false);
                return false;
            }

            if (!_doValidations()) {
                return false;
            }

            self.isSearching(true);

            _getVideos().then(() => {
                if (self.allVideosArray.length < 200) {
                    self.doSearch();
                    return;
                }

                self.totalResults(new Intl.NumberFormat('pt-BR').format(self.allVideosArray.length));
                self.showResultPanel(true);
                
                let totalSeconds = 0;
                self.allVideosArray.forEach((item) => {
                    totalSeconds += item.durationSec;
                });
                
                self.totalItems(self.allVideosArray.length);
                self.totalPages( Math.ceil(self.totalItems() / self.pageSize()) );
                for (let i=1; i<=self.totalPages(); i++) {
                    self.pages.push(i);
                }

                self.showPagination(self.allVideosArray.length > self.pageSize());
                if (self.showPagination()) {
                    _doPagination();
                }
                _startWordsAnalysis();
                _startTimeAnalysis();

                self.totalDurationResuls(formatSeconds(totalSeconds));
                self.isSearching(false);
            }).catch((err) => {
                if (err) {
                    console.log('Catch', err);
                }
                self.isSearching(false);
            });

            return false;
        };

        self.doUpdateTime = function() {
            _startTimeAnalysis();
            return false;
        };

        self.doLimpar = function() {
            self.errorMsg('');
            self.exampleEnabled(false);
            self.minAvSun('');
            self.minAvMon('');
            self.minAvTue('');
            self.minAvWed('');
            self.minAvThu('');
            self.minAvFri('');
            self.minAvSat('');
            self.showResultPanel(false);
        };

        self.prevPage = function() {
            _doPagination(self.currentPage() - 1);
        };

        self.nextPage = function() {
            _doPagination(self.currentPage() + 1);
        };

        self.goToPage = function(page) {
            _doPagination(page);
        };
    }
})();
