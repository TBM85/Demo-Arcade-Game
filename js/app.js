// Initial level
let levelGame = 0;

// This modal appears with a positive message if the player wins or with a negative message if the player loses
const bodyContainer = document.querySelector("body");
const modalGame = document.createElement("div");

let modalImageRoute, modalImageName, modalTitle, modalMessage;

const modalContent = () => {
    bodyContainer.appendChild(modalGame);
    modalGame.classList.add("modal-game");
    modalGame.innerHTML = `
                            <img src=${modalImageRoute} alt=${modalImageName}>
                            <h2>${modalTitle}</h2>
                            <p>${modalMessage}</p>
                            <button onClick="playAgain()" tabindex="-1">Play Again</button>
                        `;
    document.querySelector("button").focus();
}

// Audio credit: http://www.orangefreesounds.com/
const collisionSound = new Audio('sounds/Cartoon-pop.mp3');
const missionFailedSound = new Audio('sounds/Wha-wha-wha-sound-effect.mp3');
const levelUpSound = new Audio('sounds/Level-up-sound-effect.mp3');
const celebrationSound = new Audio('sounds/Winning-sound-effect.mp3');

// Images of enemies
// photo credit: https://pngimage.net/wp-content/uploads/2018/05/dibujo-carro-png-1.png
// photo credit: https://i.pinimg.com/originals/d1/21/3c/d1213cadf5810239095d0ea5dbec26fd.png
// photo credit: https://i.pinimg.com/originals/b7/03/0a/b7030a39c05528272176a5d91ace55a0.png
// photo credit: https://i.pinimg.com/originals/72/bc/e7/72bce77fc8cbb5dae1f9f410dcf97589.png
const enemies = [
    "images/enemy-car-one.png",
    "images/enemy-car-two.png",
    "images/enemy-car-three.png",
    "images/enemy-car-four.png"
];

  /***********************************/
 /*---------- Enemy class ----------*/
/***********************************/
class Enemy {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;

        // Code obtained from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        // Returns a random integer between the specified values
        const getRandomInt = () => {
            return Math.floor(Math.random() * (4 - 0));
        }

        // The enemy image for each row is obtained randomly from the images available in the enemies array
        this.sprite = enemies[getRandomInt()];
    }

    // The enemy is drawn on the screen
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    // Update the enemy's position, required method for game
    // Parameter: dt, a time delta between ticks
    update(dt) {
        // The enemies speed is multiplied by the dt parameter to ensure that the game runs at the same speed on all computers
        this.x += this.speed * dt;

        // The enemies position is restored when they are out of the canvas
        if (this.x > 505) {
            this.x = -100;
        }

        // Check for collision between player and enemies
        this.checkCollisions();
    }

    checkCollisions() {
        // The collision between the player and the enemies restarts the game if the player still has lives
        // If the player does not have lives, the game ends
        if (player.x < this.x + 80 &&
            player.x + 80 > this.x &&
            player.y < this.y + 60 &&
            player.y + 60 > this.y) {
                allLives.shift();
                    (allLives.length > 0) ? collisionSound.play() && player.reset()
                :
                    missionFailedSound.play() && this.gameOver();
        }
    }

    // The player is left without life, the game ends and a modal appears with the final message
    gameOver() {
        player.reset()
        modalImageRoute = "images/loser-crab.png";
        modalImageName = "Loser crab";
        modalTitle = "Sorry";
        modalMessage = "You have lose the game";
        modalContent();
    }
};

  /************************************/
 /*---------- Player class ----------*/
/************************************/
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // photo credit: http://images.vectorhq.com/images/previews/c46/red-crab-98275.png
        this.sprite = 'images/crab-player.png';
    }

    // The player is drawn on the screen
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    // The player stays on the screen all the time
    update() {
            (this.x > 404) ? this.x = 404
        :
            (this.x < 0) ? this.x = 0
        :
            (this.y > 395) ? this.y = 395
        :
            (this.y < -15) ? (this.y = -15) && this.levelUp()
        :
            this.x;
    }

    // If the player touches the water, one level increases
    // The player wins the game if he reaches level 3
    levelUp() {
        levelGame++;
        setTimeout(() => {
                (levelGame < 3) ? levelUpSound.play() && player.reset()
            :
                celebrationSound.play() && this.gameWon();
        }, 300);
    }

    // The player has won the game and a modal appears with a congratulatory message
    gameWon() {
        setTimeout(() => {
            modalImageRoute = "images/winner-crab.png";
            modalImageName = "Winner crab";
            modalTitle = "Congratulation!!!";
            modalMessage = "You won the game";
            modalContent();
        }, 500);
    }

    // The player is move in the direction of the key you press
    handleInput(keyPress) {
        (keyPress === 'left') ? this.x -= 101
    :
        (keyPress === 'right') ? this.x += 101
    :
        (keyPress === 'up') ? this.y -= 83
    :
        (keyPress === 'down') ? this.y += 83
    :
        this.x;
    }

    // The player returns to the starting position
    reset() {
        this.x = 202;
        this.y = 395;
    }
};

  /***********************************/
 /*---------- Lives class ----------*/
/***********************************/
class Live {
    constructor(x, y) {
        this.x = x;
        this.y = y
        this.sprite = 'images/Heart.png';
    }

    // Lives are drawn on the screen
    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 30, 42);
        this.drawLevelText();
        this.drawFooterText();
    }

    // Draw the text "level" on the screen
    drawLevelText() {
        ctx.fillStyle = "black";
        ctx.font = "1.2em 'Open Sans', sans-serif";
        ctx.fillText("Level: " + levelGame, 10, 35);
    }

    // Draw the text in the footer on the screen
    drawFooterText() {
        ctx.fillStyle = "black";
        ctx.font = "0.5em 'Open Sans', sans-serif";
        ctx.fillText('COPYRIGHT 2018. "TBM85". ALL RIGHTS RESERVED', 160, 600);
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
let allEnemies = [];

// Position enemies
const resetEnemies = () => {
    [65, 150, 235, 320].forEach(function(verticalPos) {
        let enemy = new Enemy(0, verticalPos, Math.floor(Math.random() * 320) + 180);
        allEnemies.push(enemy);
    });
}

resetEnemies();

// Place the player object in a variable called player
let player = new Player(202, 395);

// Place all lives objects in an array called allLives
let allLives = [];

// Position lives
const resetLive = () => {
    [405, 435, 465].forEach(function(horizontalPos) {
        let live = new Live(horizontalPos, 0);
        allLives.push(live);
    });
}

resetLive();

// When the "play again" button is pressed, the entire game is restarted
const playAgain = () => {
    player.reset();
    allLives = [];
    resetLive();
    allEnemies = [];
    resetEnemies();
    levelGame = 0;
    bodyContainer.removeChild(modalGame);
};

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    const allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
