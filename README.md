#Get object
const betData = require('nux-bet-data');

#get list of combinations (3-8)
console.log(betData.systemData.getListData(4));

#get name system by key
#pass system key for ex. '4-4' and get system name
console.log(betData.systemData.getSystemName('4-4'));

#get possible win
#pass 3 arguments
#1)object with system key example: {key: '3-4'}
#2)stakeBet - sum for 1 combination
#3)array of objects witch contains odd coef example: [{odd: 1.2}, {odd: 1.2}, {odd: 1.2}]
console.log(betData.systemData.possibleWins({key: '3-4'}, 2, [{odd: 1.2}, {odd: 3}, {odd: 1.7}]));
