module.exports = {
    'systemData': {
        'limitEvent': {
            'min': 3,
            'max': 8,
        },
        'additional': {
            'keySeparator': '-'
        },
        'getList': {
            's3': ['default', 'onlyExpress', 'expressSingle'],
            's4': ['default', 'onlyExpress', 'expressSingle'],
            's5': ['default', 'onlyExpress', 'expressSingle'],
            's6': ['default', 'onlyExpress', 'expressSingle'],
            's7': ['default', 'onlyExpress'],
            's8': ['default', 'onlyExpress'],
        },
        'nameForItems': {
            's3': {
                'onlyExpress': 'Trixie',
                'expressSingle': 'Patent'
            },
            's4': {
                'onlyExpress': 'Yankee',
                'expressSingle': 'Lucky 15'
            },
            's5': {
                'onlyExpress': 'Canadian',
                'expressSingle': 'Lucky 31'
            },
            's6': {
                'onlyExpress': 'Heinz',
                'expressSingle': 'Lucky 63'
            },
            's7': {
                'onlyExpress': 'Super Heinz',
            },
            's8': {
                'onlyExpress': 'Goliath',
            }
        },
        'getListData': function (countBets) {
            let response = [];
            let key = `s${countBets}`;
            let relations = {
                'default': this.getDefault.bind(this),
                'onlyExpress': this.getOnlyExpress.bind(this),
                'expressSingle': this.getExpressSingle.bind(this)
            };

            if (typeof this.getList[key] == 'undefined') {
                return response;
            }

            let iterData;
            this.getList[key].forEach(function (element) {
                iterData = relations[element](countBets, iterData || []);
                response = response.concat(iterData);
            });

            return response;
        },
        'getDefault': function (countBets, previousData = []) {
            let response = [];
            let [min, max] = [this.limitEvent.min - 1, this.limitEvent.max];

            for (let i = min; i < countBets; i++) {
                response.push({
                    'key': `${i}${this.additional.keySeparator}${countBets}`,
                    'keySystem': `s${countBets}`,
                    'name': `${i}/${countBets}`,
                    'countBets': this.methods.numberOfCombinations(i, countBets)
                });
            }

            return response;
        },
        'getOnlyExpress': function (countBets, previousData = []) {
            let key = `s${countBets}`;
            let countPrevious = 0;
            previousData.forEach(function (element) {
                countPrevious = countPrevious + element.countBets;
            });

            return [
                {
                    'key': `${countBets}${this.additional.keySeparator}${countBets}`,
                    'keySystem': `onlyExpress`,
                    'name': this.nameForItems[key]['onlyExpress'],
                    'countBets': countPrevious + 1
                },
            ];
        },
        'getExpressSingle': function (countBets, previousData = []) {
            let key = `s${countBets}`;
            let countPrevious = 0;
            previousData.forEach(function (element) {
                countPrevious = countPrevious + element.countBets;
            });

            return [
                {
                    'key': `${countBets}${this.additional.keySeparator}${countBets}${this.additional.keySeparator}full`,
                    'keySystem': `expressSingle`,
                    'name': this.nameForItems[key]['expressSingle'],
                    'countBets': countPrevious + countBets
                },
            ];
        },
        'possibleWins': function (option, stakePerBet, bets) {
            stakePerBet = Number(stakePerBet);
            let amount = 0;
            let arrayOdds;
            let countBets = bets.length;
            let [min, max] = [this.limitEvent.min - 1, this.limitEvent.max];
            //to do make relation with key separator -
            let [start, end, extra] = option.key.split('-');

            if (start < end) {
                arrayOdds = this.methods.combineWithoutRepetitionsOdds(bets, Number(start), stakePerBet);
                arrayOdds.forEach((el) => {
                    amount = amount + el;
                });
            } else {
                for (let i = min; i < countBets; i++) {
                    arrayOdds = this.methods.combineWithoutRepetitionsOdds(bets, i, stakePerBet);
                    arrayOdds.forEach((el) => {
                        amount = amount + el;
                    });
                }

                //to do express for all events
                amount = amount + (stakePerBet * bets.reduce((com, current) => {
                    return com * Number(current['odd'])
                }, 1));

                if (extra === 'full') {
                    //to do single bet
                    bets.forEach((el) => {
                        amount = amount + (Number(el['odd']) * stakePerBet);
                    });
                }
            }

            return amount;
        },
        'getSystemName': function (key) {
            let keyParts = key.split(this.additional.keySeparator);

            if (keyParts[0] < keyParts[1]) {
                return keyParts[0] + '/' + keyParts[1];
            }

            let nameSystem = this.nameForItems[[`s${keyParts[1]}`]];

            if (keyParts.length == 3) {
                return nameSystem.expressSingle
            }

            return nameSystem.onlyExpress;

        },
        'methods': {
            'factorial': function (number) {
                let result = 1;
                for (let i = 2; i <= number; i += 1) {
                    result *= i;
                }

                return result;
            },
            'numberOfCombinations': function (start, end) {
                let firstValue = this.factorial(start);
                let secondValue = this.factorial(end);
                let difference = this.factorial(end - start);
                return secondValue / (firstValue * difference);
            },
            //thanks https://github.com/trekhleb/javascript-algorithms/blob/master/src/algorithms/sets/combinations/combineWithRepetitions.js
            'combineWithoutRepetitions': function (comboOptions, comboLength) {
                // If the length of the combination is 1 then each element of the original array
                // is a combination itself.
                if (comboLength === 1) {
                    return comboOptions.map(comboOption => [comboOption]);
                }

                // Init combinations array.
                const combos = [];

                // Extract characters one by one and concatenate them to combinations of smaller lengths.
                // We need to extract them because we don't want to have repetitions after concatenation.
                comboOptions.forEach((currentOption, optionIndex) => {
                    // Generate combinations of smaller size.
                    const smallerCombos = this.combineWithoutRepetitions(
                        comboOptions.slice(optionIndex + 1),
                        comboLength - 1,
                    );

                    // Concatenate currentOption with all combinations of smaller size.
                    smallerCombos.forEach((smallerCombo) => {
                        combos.push([currentOption].concat(smallerCombo));
                    });
                });

                return combos;
            },
            'combineWithoutRepetitionsOdds': function (comboOptions, comboLength, bet) {
                if (comboLength === 1) {
                    return comboOptions.map(comboOption => [comboOption]);
                }

                const combos = [];

                comboOptions.forEach((currentOption, optionIndex) => {
                    const smallerCombos = this.combineWithoutRepetitions(
                        comboOptions.slice(optionIndex + 1),
                        comboLength - 1,
                        bet
                    );

                    smallerCombos.forEach((smallerCombo) => {
                        let value = 1;
                        smallerCombo.forEach((smallerComboItem) => {
                            value = value * Number(smallerComboItem['odd'])
                        });

                        combos.push(value * Number(currentOption['odd']) * bet);
                    });
                });

                return combos;
            }
        }
    }
};