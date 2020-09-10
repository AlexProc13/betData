##Get object
```const betData = require('nux-bet-data');

##Get list of combinations (3-8)
```console.log(betData.systemData.getListData(4));

##Get name system by key
##Pas system key for ex. '4-4' and get system name
```console.log(betData.systemData.getSystemName('4-4'));

##Get possible win
pass 3 arguments
- object with system key example: {key: '3-4'}
- stakeBet - sum for 1 combination
- array of objects witch contains odd coef example: [{odd: 1.2}, {odd: 1.2}, {odd: 1.2}]
##example
```console.log(betData.systemData.possibleWins({key: '3-4'}, 2, [{odd: 1.2}, {odd: 3}, {odd: 1.7}]));
