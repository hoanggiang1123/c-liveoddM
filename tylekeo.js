const cheerio = require("cheerio");

const getOdd = (dom) => {

    const $ = cheerio.load(dom);

    let ratioFirst = ratioSecound = ratioThird = ratioFourd = ratioFith = ratioSixth = '';

    const betArea = $('.betArea');

    if (betArea && betArea.length) {
        let betArr = [];

        for (let i = 0; i < betArea.length; i++) {
            const first = $(betArea[i]).find('span.txt')[0];
            if (first) betArr.push($(first).text());
            const second = $(betArea[i]).find('div.oddsBet')[0];
            if (second) betArr.push($(second).text());
        }
        if (betArr.length && betArr.length === 4) {
            ratioFirst = betArr[0];
            ratioSecound = betArr[1];
            ratioThird = betArr[2];
            ratioFourd = betArr[3];
        }
        if (betArr.length && betArr.length === 3) {
            ratioFirst = betArr[0];
            ratioThird = betArr[1];
            ratioFith = betArr[2];
        }
    }
    if (ratioFirst === '' && ratioSecound === '' && ratioThird === '' && ratioFourd === '' && ratioFith === '' && ratioSixth === '') {
        return {}
    }

    return { ratioFirst, ratioSecound, ratioThird, ratioFourd, ratioFith, ratioSixth }
}

exports.getOdds = (dom, type) => {
    const $ = cheerio.load(dom);
    const leagueGroup = $('.leagueGroup');
    const tylekeo = {}
    if (leagueGroup && leagueGroup.length) {
        for (let i = 0; i < leagueGroup.length; i++) {
            const leagueNameDom = $(leagueGroup[i]).find('.league .leagueName')[0];
            const leagueName = $(leagueNameDom).text();
            
            const matchArea = $(leagueGroup[i]).find('.oddsContent .matchArea');

            const oddArray = [];

            if (matchArea && matchArea.length) {
                for (let j = 0; j < matchArea.length; j++) {
                    const row = $(matchArea[j]).find('div[class^="' + type + '"]')[0];
                    
                    if (row) {
                        let dateTimeObj = {};
                        const timeDom = $(row).find('.time')[0];

                        if (type === 'normal-') {
                            if ($(timeDom).find('.binding font')[0]) {
                                const time = $(timeDom).text().replace('TRỰC TIẾP ', '');
                                dateTimeObj.timeStr = time;
                                dateTimeObj.dateStr = 'Trực Tiếp'
                            } else {
                                const time = $(timeDom).text().split(' ');
                                dateTimeObj.timeStr = time[1] ? time[1] : '';
                                dateTimeObj.dateStr = time[0] ? time[0] : '';
                            }
                            
                        }
                        if (type === 'live-') {
                            const dateDom = $(timeDom).find('.score')[0];
                            const dateStr = $(dateDom).text();
                            const timeInfoDom = $(timeDom).find('.timeInfo')[0];
                            const timeStr = $(timeInfoDom).text();
                            dateTimeObj.timeStr = timeStr;
                            dateTimeObj.dateStr = dateStr;
                        }

                        const multiOdds = $(row).find('.multiOdds');

                        if (multiOdds && multiOdds.length) {
                            let event = {};
                            for (let k = 0; k < multiOdds.length; k++) {
                                
                                const eventDom = $(multiOdds[k]).find('.event');

                                const infosDom = $(eventDom).find('.team');

                                let infos = { home_name: '', away_name: '', predict: '', chu: '' };

                                if (infosDom && infosDom.length) {

                                    const keyArr = ['home_name', 'away_name', 'predict'];

                                    keyArr.forEach((key, index) => {
                                        if ($(infosDom[index])) infos[key] = $(infosDom[index]).text();
                                        if ($(infosDom[index]).find('.name.name-pointer.accent')[0]) infos.chu = $(infosDom[index]).text();
                                    })

                                    if (infos.home_name === '') {
                                        infos = {  home_name: '', away_name: '', predict: '', chu: '', home_name_hide: event.home_name, away_name_hide: event.away_name };
                                        dateTimeObj = { timeStr: '', dateStr: '' };
                                    } else {
                                        event = infos
                                    }
                                }

                                const oddDoms = $(multiOdds[k]).find('.odds');

                                let ratiosObj = ratiosObjHalf = euro = euroHalf = overUnder = overUnderHalf = {};

                                if (oddDoms && oddDoms.length) {
                                    ratiosObj = oddDoms[0] ? getOdd(oddDoms[0]) : {}
                                    overUnder = oddDoms[1] ? getOdd(oddDoms[1]) : {}
                                    euro = oddDoms[2] ? getOdd(oddDoms[2]) : {}
                                    ratiosObjHalf = oddDoms[3] ? getOdd(oddDoms[3]) : {}
                                    overUnderHalf = oddDoms[4] ? getOdd(oddDoms[4]) : {}
                                    euroHalf = oddDoms[5] ? getOdd(oddDoms[5]) : {}
                                }

                                oddArray.push({ dateTimeObj, infosObj: infos, ratiosObj, euro, overUnder, ratiosObjHalf, euroHalf, overUnderHalf })

                            }
                        }
                    }
                }
            }

            tylekeo[leagueName] = oddArray;
        }
    }
    return tylekeo;
}
exports.getOddContent = async (page) => {
    let data = []
    data = await page.evaluate(() => {
        let data = [];

        let live = document.querySelector('#load_keo') ? document.querySelector('#load_keo').innerHTML : '';
        let table = document.querySelector('#keo_bong_da_hom_nay') ? document.querySelector('#keo_bong_da_hom_nay').innerHTML: '';
        live ? data.push(live) : data.push(null)
        table ? data.push(table) : data.push(null)

        return data;
    })
    if (data.length) return data;
    return [null, nulll];
}