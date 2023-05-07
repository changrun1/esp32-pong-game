const WebSocket = require('ws');

class Player {
    constructor() {
        this.ballX = 0;  // 球的X座標
        this.ballY = 0;  // 球的Y座標
        this.angle = 0;  // 球飛行的角度
        this.board1 = 800;  // 玩家1板子的位置
        this.board2 = 800;  // 玩家2板子的位置

    }

    sendGameoverMessage() {

    }

    sendGameStartMessage() {

    }
    
    getPlaayerAction(ballX, ballY){
        return "do nothing"
    }

    getServe(){
        return true;
    }

    getState(){
        return true;
    }

    refreshGameInfo(player1BoardPos, player2BoardPos, ballX, ballY, angle, servingSide) {
        // 更新玩家1板子位置
        this.board1 = player1BoardPos;
        // 更新玩家2板子位置
        this.board2 = player2BoardPos;
        // 更新球的位置
        this.ballX = ballX;
        this.ballY = ballY;
        // 更新球的角度
        this.angle = angle;
        // 更新發球方
        this.servingSide = servingSide;
    }
    getPlayerType(){
        return " ";
    }


}

class OnlinePlayer extends Player {
    constructor(ws) {
        super();
        this.ws = ws;
        this.messageQueue = [];
        this.serve = false;
    }
    sendGameoverMessage() {
        this.ws.send('Game over');
    }

    sendGameStartMessage() {
        this.ws.send('Game has started');
    }


    getPlaayerAction(){
        
        let action = "do nothing";
        if (this.messageQueue.includes('left') && this.messageQueue.includes('right')) {
            this.serve = true;
        } else {
            this.serve = false;
        }
        if (this.messageQueue.includes('exit')) {
            action = 'exit';
        } else if (this.messageQueue.includes('left') && this.messageQueue.includes('right') || this.messageQueue.length === 0) {
            action = 'do nothing';
        } else if (this.messageQueue.includes('left')) {
            action = 'left';
        } else if (this.messageQueue.includes('right')) {
            action = 'right';
        }else{

            console.log(this.messageQueue);

        }
        this.messageQueue = [];
        
        return action;



    }

    refreshGameInfo(player1BoardPos, player2BoardPos, ballX, ballY, angle, servingSide) {
        // 更新玩家1板子位置
        this.board1 = player1BoardPos;
        // 更新玩家2板子位置
        this.board2 = player2BoardPos;
        // 更新球的位置
        this.ballX = ballX;
        this.ballY = ballY;
        // 更新球的角度
        this.angle = angle;
        // 更新發球方
        this.servingSide = servingSide;


        this.ws.send(`GameInfo ${this.ballX} ${this.ballY} ${this.board1} ${this.board2}`);

    }

    OnlinePlayerInput(message){
        this.messageQueue.push(message.toString());
        // 可能收到的有right，left，exit
    }

    getServe(){
        return this.serve;
    }
    getPlayerType(){
        return "onlinePlayer";
    }
}


class AIPlayer extends Player {
    constructor(side) {
        super();
        this.side = side;
    }

    getPlaayerAction(){
        // 這裡的600之後要改成真正的AI板子寬度
        /*console.log(this.board2 + 600 / 2 - 200)
        console.log(this.board2 + 600 / 2 + 200)*/
        if (this.ballX < this.board2 + 600 / 2 - 200) {
            return 'left';
        } else if (this.ballX > this.board2 + 600 / 2 + 200) {
            return 'right';
        } else {
            return 'do nothing';
        }
    }
    getPlayerType(){
        return "AIplayer";
    }
}

const left_side = 0;
const right_side = 1600;
const top_side = 0;
const bottom_side = 3200;


const gameStates = {
    begin: 0,
    serve: 1,
    running: 2,

};

class Game {
    

    constructor(room) {
        this.room = room;
        this.state = gameStates.begin;
        this.ballX = 0;  // 球的X座標
        this.ballY = 0;  // 球的Y座標
        this.angle = 0;  // 球飛行的角度
        this.board1 = 800;  // 玩家1板子的位置
        this.board2 = 800;  // 玩家2板子的位置
        this.player1BoardWidth = 600;
        this.player2BoardWidth = 600;
        
        this.ballSpeed = 50;
        // 左右是X座標，板子只能左右移動，板子是高度為100的長方形
        this.player1 = this.room[0];
        this.player2 = this.room[1];
        this.servingSide = this.player1;
    }



    updateGame() {
        
        if (this.room.length === 2) {
            

                this.player1.refreshGameInfo(this.board1, this.board2, this.ballX, this.ballY, this.angle, this.servingSide);
                this.player2.refreshGameInfo(this.board1, this.board2, this.ballX, this.ballY, this.angle, this.servingSide);
                switch (this.state) {
                    case gameStates.begin:


                        this.angle = Math.PI / 4;

                        this.board1 = 800;
                        this.board2 = 800;

                        this.ballX = 800;
                        this.ballY = 250;

                        //this.servingSide = 

                        setTimeout(() => {
                            this.state = gameStates.serve;
                        }, 3000);
                        break;
                    case gameStates.serve:
                        this.angle = Math.PI / 4;
                        if(this.servingSide == this.player1){
                            this.ballX = this.board1;
                            this.ballY = 250;
                        }else{
                            this.ballX = this.board2;
                            this.ballY = 1350;
                        }
                        if(this.servingSide.getServe()){
                            this.state = gameStates.running;
                        }
                    case gameStates.running:
                        this.ballX += this.ballSpeed * Math.sin(this.angle);
                        this.ballY += this.ballSpeed * Math.cos(this.angle);
                        if (this.ballX < left_side || this.ballX > right_side) {
                            this.angle = -this.angle;
                            this.ballX += this.ballSpeed * Math.sin(this.angle);
                        }
                        if (this.ballY < top_side + 200 && this.ballY > top_side + 100) {
                            if(this.ballX < this.board1 + (this.player1BoardWidth / 2) && this.ballX > this.board1 - (this.player1BoardWidth / 2)){
                                this.angle = Math.PI - this.angle;
                                this.ballY += this.ballSpeed * Math.cos(this.angle);
                            }
                        }

                        if (this.ballY > bottom_side - 200 && this.ballY < bottom_side - 100) {
                            
                            if(this.ballX < this.board2 + (this.player2BoardWidth / 2) && this.ballX > this.board2 - (this.player2BoardWidth / 2)){
                                this.angle = Math.PI - this.angle;
                                
                                this.ballY += this.ballSpeed * Math.cos(this.angle);
                            }
                        }
                        if (this.ballY < top_side || this.ballY > bottom_side) {
                            this.state = gameStates.serve;
                        }
                        break;
                    default:

                        break;
                }


            }

        }
    

    handlePlayerInput() {
        
        if(this.state == gameStates.running || this.state == gameStates.serve){
            let player1Action = this.player1.getPlaayerAction();
            let player2Action = this.player2.getPlaayerAction();

            if (player1Action == "exit" || player2Action == "exit"){
                const index = games.indexOf(this);
                if (index !== -1) {
                    games.splice(index, 1);
                }
                this.player1.sendGameoverMessage();
                this.player2.sendGameoverMessage();
            }

            if (player1Action == "right"){
                
                if (this.board1 + 100 + (this.player1BoardWidth / 2) <= right_side) {
                    this.board1 += 100;
                }
            } else if (player1Action == "left") {
                if (this.board1 - 100 - (this.player1BoardWidth / 2) >= left_side) {
                    this.board1 -= 100;
                }
            }

            if (player2Action == "right"){
                
                if (this.board2 + 100 + (this.player2BoardWidth / 2) <= right_side) {
                    this.board2 += 100;
                }
            } else if (player2Action == "left") {
                if (this.board2 - 100 - (this.player2BoardWidth / 2) >= left_side) {
                    this.board2 -= 100;
                }
            }

        }
    }
}





const wss = new WebSocket.Server({ port: 8000 });

const rooms = [];
const games = [];

wss.on('connection', function connection(ws) {
    console.log('客戶端已連接');

    let player = null;

    ws.on('message', function incoming(message) {
        console.log('已接收: %s', message);
        if (message == 'multiplayer') {  
            let room = null;
            console.log("aaa")
            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].length === 1) {
                    room = rooms[i];
                    break;
                }
            }

            if (room == null) {
                room = [];
                rooms.push(room);
                console.log("bbb")
            }

            player = new OnlinePlayer(ws);
            room.push(player);

            if (room.length === 2) {
                startGame(room);
                console.log("ccc")
            }


            
        }
        if (message == 'singleplayer') {  
            
            
            
            room = [];
            rooms.push(room);
            

            player = new OnlinePlayer(ws);
            const AI = new AIPlayer("player2");

            room.push(player);
            room.push(AI);
            

            if (room.length == 2) {
                startGame(room);
                
            }

            
        }
        if(player){
            player.OnlinePlayerInput(message);
        }
        

    });

    ws.on('close', function close() {
        console.log('客戶端已斷開連接');

        /* Reason for closing the connection */
        console.log('斷開連接的原因是：');
        console.log(ws._closeCode + " " + ws._closeMessage);

        let room = null;

        for (let i = 0; i < rooms.length; i++) {
        if (rooms[i] && rooms[i].includes(player)) {

                room = rooms[i];
                break;
            }
        }

        if (room) {
            const index = room.indexOf(player);
            if (index !== -1) {
                room.splice(index, 1);
            }

            if (room.length === 0) {
                const index = rooms.indexOf(room);
                if (index !== -1) {
                    rooms.splice(index, 1);
                }
            }else if (room.length === 1) {
                room[0].sendGameoverMessage();
            }
        }
    });
});

function startGame(room) {

        console.log('有一場遊戲開始了');
        const game = new Game(room);
        room[0].sendGameStartMessage();
        room[1].sendGameStartMessage(); 
        games.push(game);
    
 



}

setInterval(function() {
    for (let i = 0; i < games.length; i++) {
        games[i].updateGame();
    }
}, 100);

setInterval(function() {
    for (let i = 0; i < games.length; i++) {
        games[i].handlePlayerInput();
    }
}, 100);

console.log('遊戲伺服器成功開啟');





