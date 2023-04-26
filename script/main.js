const START_CYCLE_STEP = 0
const GAME_STATE = {
    PAUSED : 0,
    PlAYING : 1
}
const FORBIDDEN_DIRECTION = {
    NONE : 0,
    UP : 1,
    DOWN : 2,
    LEFT : 3,
    RIGHT : 4
}
const start_game_configuration={
    tales : 1,
    speed : 1,
    position : {
        x : 160,
        y : 160
    },
    userName : "user1",
    sizeCell: 16,
    sizeBerry: 16/4 
}
//modal
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const submitModalBtn = document.querySelector(".btn");
const openModal = function () {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
  };
  const closeModal = function () {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
  };

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

class Field {};
Field.prototype.init = function (){
    this.width = 0;
    this.height = 0;
    this.canvas = document.getElementById("game__canvas")
    this.context = this.canvas.getContext('2d');
}
Field.prototype.setFieldSize= function (width, height){
    this.width = width
    this.height = height;
    this.draw();
}
Field.prototype.draw = function (){
    this.canvas.width = this.width;
    this.canvas.height = this.height
}
class Snake  {}
Snake.prototype.getHead = function(){
    return this.tails[0];
}
Snake.prototype.init = function (game){
    this.x = start_game_configuration.position.x;
    this.y = start_game_configuration.position.y;
    this.direction = {
        x: 0,
        y : 0,
    };
    this.forbiddenDirection  =  FORBIDDEN_DIRECTION.NONE;
    this.speed = game.configuration.speed;
    this.tails = [];
    this.maxTails = 1;
    this.game = game
}
Snake.prototype.reset = function(){
    this.init(this.game)
}
Snake.prototype.checkCollisionBorders = function (){
    if (this.x < 0) {
        this.game.resfreshGame()
    }
    if (this.x >= this.game.field.width) {
        this.game.resfreshGame()
    }
    if (this.y < 0) {
        this.game.resfreshGame()
    }
    if (this.y >= this.game.field.height) {
        this.game.resfreshGame()
    }
}
Snake.prototype.isIntersectingWithTale = function(){
    console.log(this)
    let tails = this.tails
    let game = this.game
    tails.forEach(function (el, index) {
        for (let i = index + 1; i < tails.length; i++) {
            if (el.x == tails[i].x && el.y == tails[i].y) {
                game.resfreshGame()
            }
        }
    })
}
Snake.prototype.isEatingCherry = function () {
    let head = this.getHead();
    let berry = this.game.berry
    if (head.x === berry.x && head.y === berry.y) {
        this.maxTails++;
        this.game.scoreUp()
        this.game.resetBerry()
    }
}
Snake.prototype.move = function (){
    this.x += this.direction.x;
    this.y += this.direction.y;
    this.checkCollisionBorders();

    this.tails.unshift({ x: this.x, y: this.y });

    if (this.tails.length > this.maxTails) {
        this.tails.pop()
    }
    this.checkCollisionBorders();
    this.isIntersectingWithTale()
    this.isEatingCherry()
    this.draw();
}
Snake.prototype.draw = function(){
    let context = this.game.field.context;
    let config = this.game.configuration
    this.tails.forEach(function (el, index) {
        if (index == 0) {
            context.fillStyle = "#fa0556";
        } else {
            context.fillStyle = "#a00034";
        }
        context.fillRect(el.x, el.y, config.sizeCell, config.sizeCell)
    })
}
class Berry {}
Berry.prototype.init = function(game){
    this.x = 0;
    this.y = 0;
    this.game = game;
}
Berry.prototype.reset  = function(){
    this.x = getRandomInt(0, this.game.field.width / this.game.configuration.sizeCell) * this.game.configuration.sizeCell;
    this.y = getRandomInt(0, this.game.field.height / this.game.configuration.sizeCell) * this.game.configuration.sizeCell;
}
Berry.prototype.draw = function(){
    let context= this.game.field.context;
    context.beginPath();
    context.fillStyle = '#A00034';
    context.arc(this.x + (game.configuration.sizeCell / 2), this.y + (game.configuration.sizeCell / 2), game.configuration.sizeBerry, 0, 2 * Math.PI);
    context.fill();
}
class Game {}
Game.prototype.init = function (){
    this.state = GAME_STATE.PAUSED;
    this.configuration = start_game_configuration;
    this.currentAnimationCycleStep = START_CYCLE_STEP; 
    this.keyFrame = null;
    this.user =  {
        name: start_game_configuration.userName,
        score:0
    };
    this.field = new Field();
    this.field.init();
    this.snake = new Snake();
    this.snake.init(this);
    this.scoreBlock =  document.querySelector('.game-snake__score .game-snake__count'); 
    this.berry = new Berry();
    this.berry.init(this);     
}

Game.prototype.resfreshGame = function (){
    this.user.score = 0;
    this.drawScore();
    cancelAnimationFrame(this.keyFrame)
    this.state = GAME_STATE.PAUSED
    openModal ()
    this.snake.reset();
    this.resetBerry();
}
Game.prototype.drawSnake = function () {
    this.snake.move()
}
Game.prototype.drawBerry = function (){
    this.berry.draw(this)
}
Game.prototype.scoreUp = function(){
    this.user.score++;
    this.snake.speed = this.snake.speed + 0.1 
    this.drawScore()
}
Game.prototype.drawScore = function (){
    this.scoreBlock.innerHTML = this.user.score;
}
Game.prototype.resetBerry = function(){
    this.berry.reset();
}
 
const game = new Game()
game.init();
overlay.addEventListener("click", closeModal);  
const submitModal = function () {
    let width  = document.getElementById("fieldWidhtInput").value
    let height = document.getElementById("fieldHeightInput").value
    game.field.setFieldSize(width,height)
    game.field.draw()
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
    game.state = GAME_STATE.PlAYING;
    console.log("here is from modal")
    game.keyFrame = requestAnimationFrame(gameLoop);
}

submitModalBtn.addEventListener("click", submitModal);  
openModal ()



function gameLoop() {
    game.keyFrame = requestAnimationFrame(gameLoop);
    if (++game.currentAnimationCycleStep < (20 / game.snake.speed)) {
        return
    }
    game.currentAnimationCycleStep = 0;

    game.field.context.clearRect(0, 0, game.field.width, game.field.height)

    game.drawBerry();
    game.drawSnake();
}




document.addEventListener('keydown', function (e) {
    let snake = game.snake
    let config = game.configuration
    if (game.state == GAME_STATE.PAUSED) return
    e.preventDefault();
    if ((e.code == 'ArrowUp' || e.code == 'KeyW') && !(snake.forbiddenDirection == FORBIDDEN_DIRECTION.UP)) {

        snake.direction.y = -config.sizeCell;
        snake.direction.x = 0;
        snake.forbiddenDirection = FORBIDDEN_DIRECTION.DOWN
    }
    if ((e.code == 'ArrowDown' || e.code == 'KeyS') && !(snake.forbiddenDirection == FORBIDDEN_DIRECTION.DOWN)) {

        snake.direction.y = config.sizeCell;
        snake.direction.x = 0;
        snake.forbiddenDirection = FORBIDDEN_DIRECTION.UP
    }
    if ((e.code == 'ArrowRight' || e.code == 'KeyD') && !(snake.forbiddenDirection == FORBIDDEN_DIRECTION.RIGHT)) {

        snake.direction.x = config.sizeCell;
        snake.direction.y = 0;
        snake.forbiddenDirection = FORBIDDEN_DIRECTION.LEFT
    }
    if ((e.code == 'ArrowLeft' || e.code == 'KeyA') && !(snake.forbiddenDirection == FORBIDDEN_DIRECTION.LEFT)) {

        snake.direction.x = -config.sizeCell;
        snake.direction.y = 0;
        snake.forbiddenDirection = FORBIDDEN_DIRECTION.RIGHT
    }
})