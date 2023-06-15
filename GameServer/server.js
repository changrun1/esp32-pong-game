const WebSocket = require('ws');

class Player {
    constructor() {

    }
    sendGameoverMessage() {

    }

    sendGameStartMessage() {

    }

    getPlaayerAction(){
        return "do nothing"
    }
    getState(){
        return true;
    }

    refreshGameInfo() {

    }
    getPlayerType(){
        return " ";
    }

}

class BoardPlayer extends Player{
    constructor() {
        super();
        this.ballX = 0;  // 球的X座標
        this.ballY = 0;  // 球的Y座標
        this.angle = 0;  // 球飛行的角度
        this.board1 = 800;  // 玩家1板子的位置
        this.board2 = 800;  // 玩家2板子的位置

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


}

class OnlinePlayer extends BoardPlayer {
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

class AIPlayer extends BoardPlayer {
    constructor(side) {
        super();
        this.side = side;
    }

    getPlaayerAction(){
        // 這裡的600之後要改成真正的AI板子寬度
        /*console.log(this.board2 + 600 / 2 - 200)
        console.log(this.board2 + 600 / 2 + 200)*/
        if (this.ballX < this.board2 + 300 / 2 - 200) {
            return 'left';
        } else if (this.ballX > this.board2 + 300 / 2 + 200) {
            return 'right';
        } else {
            return 'do nothing';
        }
    }
    getPlayerType(){
        return "AIplayer";
    }
}

class tetrisPlayer extends Player {
    constructor(ws) {
        super();
        this.ws = ws
        this.messageQueue = []
    }
    getPlayerType(){
        return "tetrisPlayer";
    }
    draw(row, col, state){
        this.ws.send(`tetrisInfo ${row} ${col} ${state}`);
    }
    OnlinePlayerInput(message){
        this.messageQueue.push(message.toString());
    }
    getPlayerAction() {
        
        let action = "do nothing";

        if (this.messageQueue.includes('exit')) {
            action = 'exit';
        } else if (this.messageQueue.includes('left')) {
            action = 'left';
        } else if (this.messageQueue.includes('right')) {
            action = 'right';
        } else if (this.messageQueue.includes('down')) {
            action = 'down';
        } else if (this.messageQueue.includes('rotate')) {
            action = 'rotate';
        } else if (this.messageQueue.includes('rotateReverse')) {
            action = 'rotateReverse';
        } else if (this.messageQueue.includes('holdOn')) {
            action = 'holdOn';
        } else {
            console.log(this.messageQueue);
        }
        this.messageQueue = [];
        
        return action;
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
        this.timers = [];
        this.ballSpeed = 5;
        // 左右是X座標，板子只能左右移動，板子是高度為100的長方形
        this.player1 = this.room[0];
        this.player2 = this.room[1];
        this.servingSide = this.player1;
    }


    stop() {
        for (const timer of this.timers) {
            clearInterval(timer);
        }
    }
    updateGame() {
        
        if (this.room.length === 2) {
            

                switch (this.state) {
                    case gameStates.begin:


                        this.angle = 0;

                        this.board1 = 800;
                        this.board2 = 800;

                        this.ballX = 800;
                        this.ballY = 250;

                        //this.servingSide = 

                        setTimeout(() => {
                            this.state = gameStates.serve;
                        }, 1000);
                        break;
                    case gameStates.serve:
                        this.ballSpeed = 5;
                        
                        if(this.servingSide == this.player1){
                            this.ballX = this.board1;
                            this.ballY = 250;
                            this.angle = 0;
                        }else{
                            this.ballX = this.board2;
                            this.ballY = 2950;
                            this.angle = Math.PI;
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
                                this.angle = 0 - Math.PI / 2 * (this.board1 - this.ballX) / this.player1BoardWidth;
                                this.ballSpeed += 1;
                                this.ballY += this.ballSpeed * Math.cos(this.angle);
                            }
                        }

                        if (this.ballY > bottom_side - 200 && this.ballY < bottom_side - 100) {
                            
                            if(this.ballX < this.board2 + (this.player2BoardWidth / 2) && this.ballX > this.board2 - (this.player2BoardWidth / 2)){
                                this.angle = Math.PI + Math.PI / 2 * (this.board2 - this.ballX) / this.player2BoardWidth;
                                this.ballSpeed += 1;
                                this.ballY += this.ballSpeed * Math.cos(this.angle);
                            }
                        }
                        if (this.ballY < top_side || this.ballY > bottom_side) {
                            this.state = gameStates.serve;
                            if(this.servingSide == this.player1){
                                this.servingSide = this.player2;
                            }else{
                                this.servingSide = this.player1;
                            }
                        }
                        break;
                    default:

                        break;
                }


            }

        }
    

    handlePlayerInput() {

        if(this.state == gameStates.running || this.state == gameStates.serve){
            this.player1.refreshGameInfo(this.board1, this.board2, this.ballX, this.ballY, this.angle, this.servingSide);
            this.player2.refreshGameInfo(this.board2,this.board1,  this.ballX, 3200 -  this.ballY, this.angle, this.servingSide);
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

const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
    [[1, 1], [1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[1, 1, 1], [0, 1, 0]]
  ];



class tetrisGame{
    
    constructor(room) {

        this.room = room;
        this.state = gameStates.begin;
        this.player1 = this.room[0];
        this.player2 = this.room[1];
        this.ROWS = 24;
        this.COLS = 8;
        this.board = [];
        this.lines = 0;
        this.currentShape = null;
        this.currentShapeX = 0;
        this.currentShapeY = 0;
        this.timer = null;
        this.isGameOver = false;
        this.timers = [];
        this.init();
    }
    stop() {
        for (const timer of this.timers) {
            clearInterval(timer);
        }
    }
    init() {
        for (let row = 0; row < this.ROWS; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.COLS; col++) {
                this.board[row][col] = 0;
            }
        }
        this.drawBoard();
        this.newShape();
        this.gameOver = false;
    }

    newShape() {
        const index = Math.floor(Math.random() * SHAPES.length);
        const shape = SHAPES[index];
        this.currentShape = shape

        this.currentShapeX = Math.floor((this.COLS - shape[0].length) / 2);
        this.currentShapeY = 0;
        if (this.isColliding()) {
            this.gameOver();
        }
    }
    
    drawBoard() {
        for (let row = 0; row < this.ROWS; row++) {
            for (let col = 0; col < this.COLS; col++) {
                
                if(this.board[row][col] == 1){
                    this.player1.draw(row, col, 1);
                    this.player2.draw(row, col, 1);
                }else{
                    this.player1.draw(row, col, 0);
                    this.player2.draw(row, col, 0);
                }
            }
        }
    }

    moveShapeDown() {

        this.currentShapeY++;
        if (this.isColliding()) {
            this.currentShapeY--;
            this.lockShape();
            this.newShape();
        }
    }

    moveShapeLeft() {

        this.currentShapeX--;
        if (this.isColliding()) {
            this.currentShapeX++;
        }
    }

    moveShapeRight() {

        this.currentShapeX++;
        if (this.isColliding()) {
            this.currentShapeX--;
        }
    }

    rotateShape() {

        const shape  = this.currentShape;
        const newShape = [];
        for (let row = 0; row < shape[0].length; row++) {
            newShape[row] = [];
            for (let col = 0; col < shape.length; col++) {
                newShape[row][col] = shape[shape.length - 1 - col][row];
            }
        }
        this.currentShape = newShape;
        if (this.isColliding()) {
            this.currentShape = shape;
        }
    }

    rotateShapeReverse() {

        const shape  = this.currentShape;
        const newShape = [];
        for (let row = 0; row < shape[0].length; row++) {
            newShape[row] = [];
            for (let col = 0; col < shape.length; col++) {
                newShape[row][col] = shape[col][shape[0].length - 1 - row];
            }
        }
        this.currentShape = newShape;
        if (this.isColliding()) {
            this.currentShape = shape;
        }
    }
    
    lockShape() {
        const shape = this.currentShape;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[0].length; col++) {
                if (shape[row][col]) {
                    this.board[this.currentShapeY + row][this.currentShapeX + col] = 1;
                }
            }
        }
    }
    
    isColliding() {
        const shape = this.currentShape;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[0].length; col++) {
                if (shape[row][col]) {
                    const y = this.currentShapeY + row;
                    const x = this.currentShapeX + col;
                    if (y < 0 || y >= this.ROWS || x < 0 || x >= this.COLS || this.board[y][x]) {
                        return true;
                    }
                }
            }
        }
        return false;

    }

    removeRows() {
        let rowsToRemove = [];
        for (let row = 0; row < this.ROWS; row++) {
            let isFull = true;
            for (let col = 0; col < this.COLS; col++) {
                if (this.board[row][col] === 0) {
                    isFull = false;
                    break;
                }
            }
            if (isFull) {
                rowsToRemove.push(row);
            }
        }
        if (rowsToRemove.length > 0) {
            this.lines += rowsToRemove.length;
            for (let i = rowsToRemove.length - 1; i >= 0; i--) {
                this.board.splice(rowsToRemove[i], 1);
            }
            for (let i = 0; i < rowsToRemove.length; i++) {
                this.board.unshift(new Array(this.COLS).fill(0));
            }
        }
    }
    
    gameOver() {
        this.isGameOver = true;
    }

    updateGame() {
        this.moveShapeDown();
        this.removeRows();
        this.drawBoard();
        if(this.isGameOver){
            this.init();
        }
    }

    handlePlayerInput() {

            const player1Action = this.player1.getPlaayerAction();
            switch (player1Action) {
                case 'left':
                    this.moveShapeLeft();
                    break;
                case 'right':
                    this.moveShapeRight();
                    break;
                case 'down':
                    this.moveShapeDown();
                    break;
                case 'rotate':
                    this.rotateShape();
                    break;
                case 'rotateReverse':
                    this.rotateShapeReverse();
                    break;
                default:
                    break;
            }
        
            const player2Action = this.player2.getPlaayerAction();
            switch (player2Action) {
                case 'left':
                    this.moveShapeLeft();
                    break;
                case 'right':
                    this.moveShapeRight();
                    break;
                case 'down':
                    this.moveShapeDown();
                    break;
                case 'rotate':
                    this.rotateShape();
                    break;
                case 'rotateReverse':
                    this.rotateShapeReverse();
                    break;
                default:
                    break;
            
           }
           this.drawBoard();
    }

}







const wss = new WebSocket.Server({ port: 8000 });

const rooms = [];

wss.on('connection', function connection(ws) {
    console.log('客戶端已連接');

    let player = null;

    ws.on('message', function incoming(message) {
        console.log(message);
        if (message == 'tetrisCoo') {
            let room = null;

            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].length === 1) {
                    room = rooms[i];
                    break;
                }
            }
            

            if (room == null || room[0].ws == ws || room[0].getPlayerType() != "tetrisPlayer") {
                room = [];
                rooms.push(room);
            }

            player = new tetrisPlayer(ws);
            room.push(player);

            if (room.length === 2) {
                startTetris(room);
            }
        }
        if (message == 'tetrisCom') {
            let room = null;

            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].length === 1) {
                    room = rooms[i];
                    break;
                }
            }
            

            if (room == null || room[0].ws == ws || room[0].getPlayerType() != "tetrisPlayer") {
                room = [];
                rooms.push(room);
            }

            player = new tetrisPlayer(ws);
            room.push(player);

            if (room.length === 2) {
                startTetris(room);
            }
        }
        if (message == 'multiplayer') {  
            let room = null;

            for (let i = 0; i < rooms.length; i++) {
                if (rooms[i].length === 1) {
                    room = rooms[i];
                    break;
                }
            }
            

            if (room == null || room[0].ws == ws || room[0].getPlayerType() != "onlinePlayer") {
                room = [];
                rooms.push(room);
            }

            player = new OnlinePlayer(ws);
            room.push(player);

            if (room.length === 2) {
                startBoardGame(room);
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
                startBoardGame(room);
                
            }

            
        }
        if(player){
            player.OnlinePlayerInput(message);
        }
        

    });

    ws.on('close', function close() {
        console.log('客戶端已斷開連接');

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

            if (room.length === 2) {
                room[0].sendGameoverMessage();
                room[1].sendGameoverMessage();
            }

            const index = rooms.indexOf(room);
            if (index !== -1) {
                rooms.splice(index, 1);
            }

        }
    });
});

function startBoardGame(room) {
    console.log('有一場遊戲開始了');
    const game = new Game(room);
    room[0].sendGameStartMessage();
    room[1].sendGameStartMessage(); 

    updateTimer = setInterval(function() {
        game.updateGame();
        
    }, 10);

    playerInputTimer = setInterval(function() {
        game.handlePlayerInput();
        
    }, 100);

    game.timers.push(updateTimer);
    game.timers.push(playerInputTimer);
}

function startTetris(room) {
    console.log('有一場遊戲開始了');
    const game = new tetrisGame(room);
    room[0].sendGameStartMessage();
    room[1].sendGameStartMessage(); 

    updateTimer = setInterval(function() {
        game.updateGame();
        
    }, 1000);

    playerInputTimer = setInterval(function() {
        game.handlePlayerInput();
        
    }, 500);

    game.timers.push(updateTimer);
    game.timers.push(playerInputTimer);
}

console.log('遊戲伺服器成功開啟');





