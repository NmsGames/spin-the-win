const URL = "localhost";
const OnPlayerMove = "OnPlayerMove";
const StartCountDown = "StartCountDown";
const OnTimeUp = "OnTimeUp";



const Events = {
    RegisterPlayer: "RegisterPlayer",
    OnLogin : "OnLogin",
 OnUserProfile : "OnUserProfile",
    OnSignUp : "OnSignUp",
    OnForceLogin:"OnForceLogin",
    OnForceExit:"OnForceExit",
    OnPlaceBet :"OnPlaceBet",
    OnWinNo: "OnWinNo",
    OnWinAmount:"OnWinAmount",
    OnTakeAmount:"OnTakeAmount",
    OnTimer:"OnTimer",
    OnUserInfo:"OnUserInfo",
    OnPreBet:"OnPreBet",
    OnChipMove: "OnChipMove",
    OnPlayerExit: "OnPlayerExit",
    OnJoinRoom: "OnJoinRoom",
    OnTimeUp: "OnTimeUp",
    OnTimerStart: "OnTimerStart",
    OnDrawCompleted: "OnDrawCompleted",
    OnWait: "OnWait",
    OnGameStart: "OnGameStart",
    OnAddNewPlayer: "OnAddNewPlayer",
    OnCurrentTimer: "OnCurrentTimer",
    OnBetsPlaced: "OnBetsPlaced",
    OnBotsData: "OnBotsData",
    OnPlayerWin: "OnPlayerWin",
    onEnterLobby:"onEnterLobby",
    onleaveRoom:"onleaveRoom"
};

const CommonVar = {
    playerId: "playerId",
    success: "success",
    chip: "chip",
    spot: "spot",
    username: "username",
    roomName: "roomName",
    spotType: "spotType",
    balance: "balance",
    position: "position",
    profilePic: "profilePic",
    socket: "socket",
    gameplay: "7updown",
    test:"test",
    db:"database",
    win:"win",
    adminCommisionRate:0.05,
    gameId:"gameId",
}

const GameState = {
    canBet: 1,
    cannotBet: 0,
}
const Chip =
{
    Chip10: 10,
    Chip50: 50,
    Chip100: 100,
    Chip500: 500,
    Chip1000: 1000,
    Chip5000: 5000,
}


const SelectGame =
{
    1: "AmericanRouletteTimer",
    2: "FunTargetTimer",
    3: "FunTargetTimer",
}


const Spot =
{
    left: 0,
    middle: 1,
    right: 2
}

const TimerVar = {
    bettingTimer : 60,
    betCalculationTimer : 7,
    waitTimer : 3,
    delay : 1000,
    intervalDalay : 1500,
}


//=========ART================
const AmrcnRulteWinRate = {
    singleBet    : 37,
    splitBet     : 18,
    StreetBet    : 12,
    cornerBet    :  9,
    basketBet    :  7,
    lineBet      :  6,
    columnAndDozenBet : 3,
    straightBet  : 2
}

const AmrcnRulteSpotRange = {
    '38' : [1,2,3,4,5,6,7,8,9,10,11,12],
    '39' : [13,14,15,16,17,18,19,20,21,22,23,24],
    '40' : [25,26,27,28,29,30,31,32.33,34,35,36],
    '41' : [1,4,7,10,13,16,19,22,25,28,31,34],
    '42' : [2,5,8,11,14,17,20,23,26,29,32,35],
    '43' : [3,6,9,12,15,18,21,24,27,30,33,36],
    '44' : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
    '45' : [19,20,21,22,23,24.25,26,27,28,29,30,31,32,33,34,35,36],
    '48' : [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36],
    '49' : [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35],

    //Split Bets column(37='00')
    '50':[0,37],'51':[1,2],'52':[2,3],'53':[4,5],'54':[5,6],'55':[7,8],'56':[8,9],'57':[10,11],'58':[11,12],'59':[13,14],'60':[14,15],
    '61':[16,17],'62':[17,18],'63':[19,20],'64':[20,21],'65':[23,23],'66':[23,24],'67':[25,26],'68':[26,27],'69':[28,29],'70':[29,30],
    '71':[31,32],'72':[32,33],'73':[34,35],'74':[35,36],

    //Split Bets row
    '75':[0,1],'76':[37,3],'77':[1,4],'78':[2,5],'79':[3,6],'80':[4,7],'81':[5,8],'82':[6,9],'83':[7,10],'84':[8,11],'85':[9,12],
    '86':[10,13],'87':[11,14],'88':[12,15],'89':[13,16],'90':[14,17],'91':[15,18],'92':[16,19],'93':[17,20],'94':[18,21],'95':[19,22],
    '96':[20,23],'97':[21,24],'98':[22,25],'99':[23,26],'100':[24,27],'101':[25,28],'102':[26,29],'103':[27,30],'104':[28,31],
    '105':[29,32],'106':[30,33],'107':[31,34],'108':[32,35],'109':[33,36],

    //street Bet Three No
    '110':[0,1,2],'111':[0,2,37],'112':[37,2,3],'113':[1,2,3],'114':[4,5,6],'115':[7,8,9],'116':[10,11,12],'117':[13,14,15],
    '118':[16,17,18],'119':[19,20,21],'120':[22,23,24],'121':[25,26,27],'122':[28,29,30],'123':[31,32,33],'124':[34,35,36],

    //corner Bet Four No
    '125':[1,2,4,5],'126':[2,3,5,6],'127':[4,5,7,8],'128':[5,6,8,9],'129':[7,8,10,11],'130':[8,9,11,12],'131':[10,11,13,14],'132':[11,12,14,15],
    '133':[13,14,16,17],'134':[14,15,17,18],'135':[16,17,19,20],'136':[17,18,20,21],'137':[19,20,22,23],'138':[20,21,23,24],'139':[22,23,25,26],
    '140':[23,24,26,27],'141':[25,26,28,29],'142':[26,27,29,30],'143':[28,29,31,32],'144':[29,30,32,33],'145':[31,32,34,35],'146':[32,33,35,36],

    //Basket Bet Five No
    '147':[0, 37, 1, 2, 3],

    //Six line Bet
    '148':[1,2,3,4,5,6],'149':[4,5,6,7,8,9],'150':[7,8,9,10,11,12],'151':[10,11,12,13,14,15],'152':[13,14,15,16,17,18],'153':[16,17,18,19,20,21],
    '154':[19,20,21,22,23,24],'155':[22,23,24,25,26,27],'156':[25,26,27,28,29,30],'157':[28,29,30,31,32,33],'158':[31,32,33,34,35,36],

}
//===========================

module.exports.commonVar = CommonVar;
module.exports.events = Events;
module.exports.state = GameState;
module.exports.chip = Chip;
module.exports.spot = Spot;
module.exports.SelectGame = SelectGame;
module.exports.timerVar = TimerVar;
module.exports.AmrcnRulteWinRate = AmrcnRulteWinRate;
module.exports.AmrcnRulteSpotRange = AmrcnRulteSpotRange;