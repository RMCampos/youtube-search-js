(() => {
    ko.applyBindings(new IndexVm());

    function IndexVm() {
        const self = this;

        self.googleKey = ko.observable('');
        self.searchTerm = ko.observable('');
        self.errorMsg = ko.observable('');
        self.pageSize = ko.observable(50);
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

        function _updateVideoDuration(videoId, durationSeconds) {
            ko.utils.arrayForEach(self.resultItems(), (item) => {
                if (item.id.videoId() === videoId) {
                    item.durationSec(durationSeconds);
                    item.duration(formatSeconds(durationSeconds));
                }
            });
        }

        function _startWordsAnalysis() {
            const wordsMap = {};

            ko.utils.arrayForEach(self.resultItems(), (item) => {
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
            let secondArray = [];

            ko.utils.arrayForEach(self.resultItems(), (item) => {
                secondArray.push(item.durationSec());
            });

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

            console.log('days:', days);

            let numDay = 1;
            let daysNedeed = 0;
            let stop = false;

            do {
                // Obtém o próximo dia
                const weekDay = days[numDay-1];
                const weekDaySeconds = weekDay * 60;

                // Obtém o próximo video
                let nextVideoSec = secondArray.splice(0, 1);

                // Se a duração do vídeo for maior do que o disponível no dia, ignora o vídeo
                if (nextVideoSec > weekDaySeconds) {
                    continue;
                }

                daysNedeed++;
                numDay++;
                if (numDay == 8) {
                    numDay = 1;
                }
            } while (secondArray.length > 0 || !stop);

            for (let i in days) {
                const dia = days[i];
            }

            // Regras
            // 1. Não pode gastar mais tempo assistindo videos do que o máximo diário
            // 2. Não pode iniciar outro vídeo se não puder terminar no mesmo dia
            // 3. Vídeos mais longos do que o tempo disponível no dia devem ser ignorados
            // 4. A sequencia dos vídeos deve ser na ordem do retorno
            // 5. Considerar apenas os primeiros 200 vídeos

            // 6. Se o vídeo for maior que o tempo disponível, para.

            /*
             * Exemplo:
             * Considerando o seguinte tempo disponível:
             * Dom 15m - Seg 120m - Ter 30 - Qua 150 - Qui 20 - Sex 40 - Sab 90
             * 
             * Considerando 10 videos retornados com as seguintes durações:
             * 20m 30m 60m 90m 200m 30m 40m 20m 60m 15m
             * 
             * - No primeiro dia, nenhum vídeo será assistido
             * - No segundo dia, 3 videos, os 3 primeiros (20, 30 e 60)
             * - No terceiro dia, nenhum vídeo será assistido
             * - No quarto dia, 2 videos assistidos (90 e 30) e 1 ignorado
             * - No quinto, nenhum video será assistido
             * - No sexto dia, 1 video (40)
             * - No sétimo dia, 2 vídeos (20 e 60)
             * - No oitavo dia, 1 vídeo (15)
             */
        }

        function _doValidations() {
            return new Promise((resolve, reject) => {
                self.errorMsg('');

                if (self.googleKey() === '') {
                    self.errorMsg('Por favor, informe a Chave da API do Google :)');
                    reject(new Error('No Google Key!'));
                }

                else if (self.searchTerm() === '') {
                    self.errorMsg('Por favor, informe um termo de pesquisa :)');
                    reject(new Error('No search term!'));
                }

                else {
                    resolve();
                }
            });
        }

        function _getVideoPage(pageToken) {
            const searchUrl = getSearchUrl(
                self.searchTerm(),
                self.pageSize(),
                self.googleKey(),
                pageToken
            );

            console.log('pageToken:', pageToken);

            return getJson(searchUrl);
        }

        function _getVideos(pageToken) {
            if (self.pageToken() !== '') {
                pageToken = self.pageToken();
            }

            console.log('pageToken', pageToken);
            return new Promise((resolve) => {
                const searchUrl = getSearchUrl(
                    self.searchTerm(),
                    self.pageSize(),
                    self.googleKey(),
                    pageToken
                );

                getJson(searchUrl).then((response) => {
                    //console.log('retrived', response.items.length);
                    self.pageToken(response.nextPageToken);

                    //if (array.length < 4) {
                        //_getVideos(response.nextPageToken, resolve);
                    //} else {
                        //console.log('finishing up with ', array.length);
                        resolve(response);
                    //}
                });
            });
        }

        self.closeOops = function() {
            self.errorMsg('');
        };

        self.closeUpdateMsg = function() {
            self.updateErrorMsg('');
        };

        let array = [];

        self.doSearch = function() {
            _doValidations().then(() => {
                self.isSearching(true);
                return _getVideos();
            }).then((response) => {
                //console.log(response);

                console.log('finished _getVideos(), response.length', response.length);

                array.push(response.items);

                if (array.length < 4) {
                    self.doSearch();
                    return;
                }

                console.log('OK!!!', array);

                if (1 == 1) {
                    return;
                }

                response.items.forEach((item) => {
                    item.durationSec = 0;
                    item.duration = 'Retrieving...';
                });

                ko.mapping.fromJS(response.items, {}, self.resultItems);
                self.totalResults(new Intl.NumberFormat('pt-BR').format(response.pageInfo.totalResults));
                self.showResultPanel(true);
                //console.log(response.items);

                const idsArray = response.items.map(x => x.id.videoId);
                const detailsUrl = getDetailsUrl(idsArray, self.googleKey());

                return getJson(detailsUrl);
            }).then((response) => {
                console.log(response);

                let totalSeconds = 0;
                for (let i in response.items) {
                    const sec = getTimeInSeconds(response.items[i].contentDetails.duration);
                    totalSeconds += sec;

                    _updateVideoDuration(response.items[i].id, sec);
                }

                _startWordsAnalysis();
                _startTimeAnalysis();

                self.totalDurationResuls(formatSeconds(totalSeconds));
                self.isSearching(false);
            }).catch((err) => {
                console.error(err);
                self.isSearching(false);
            });

            return false;
        };

        self.doUpdateTime = function(theForm) {
            _startTimeAnalysis();
            return false;
        };
    }
})();