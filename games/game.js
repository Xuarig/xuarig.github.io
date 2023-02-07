class Square {
    constructor(index, posX, posY, size, color, positiveX, positiveY) {
        this.index = index;
        this.posX = posX;
        this.posY = posY;
        this.size = size;
        this.color = color;
        this.moveX = (10 - this.size / 30) + Math.random() * 2 + 1;
        this.moveY = (10 - this.size / 30) + Math.random() * 2 + 1;
        this.positiveX = positiveX;
        this.positiveY = positiveY;
        this.rotation = Math.random() * 2 * Math.PI;
        this.alive = true;
    }

    move(canvas, ctx) {
        //ctx.clearRect(this.posX - 10, this.posY - 10, this.size + 20, this.size + 20);

        if (this.positiveX) {
            this.posX += this.moveX;

            if (this.posX + this.moveX + this.size + 10 >= canvas.width) {
                this.positiveX = false;
                this.collide(canvas, ctx);
            }
        } else {
            this.posX -= this.moveX;

            if (this.posX <= 0) {
                this.positiveX = true;
                this.collide(canvas, ctx);
            }
        }

        if (this.positiveY) {
            this.posY += this.moveY;

            if (this.posY + this.moveY + this.size + 10 >= canvas.height) {
                this.positiveY = false;
                this.collide(canvas, ctx);
            }
        } else {
            this.posY -= this.moveY;

            if (this.posY <= 0) {
                this.positiveY = true;
                this.collide(canvas, ctx);
            }
        }

        this.paintSquare(canvas, ctx);
    }

    paintSquare(canvas, ctx) {
        /*ctx.fillStyle = this.color;

        // Draw circle
        ctx.beginPath();
        ctx.arc(this.posX + this.size / 2, this.posY + this.size / 2, this.size / 2, 0, 2 * Math.PI);

        ctx.lineWidth = 5;
        ctx.strokeStyle = this.color;
        ctx.stroke();*/

        // Paint the chevelu image with the good size
        // Load image on the server
        let image = new Image();

        image.src = "chevelu.png";

        // Draw a rotated image
        ctx.save();
        ctx.translate(this.posX + this.size / 2, this.posY + this.size / 2);
        ctx.rotate(this.rotation);
        ctx.drawImage(image, -this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }

    collide(canvas, ctx) {
        this.color = "rgb(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + ")";
        this.size = Math.random() * 80 + 60;
        this.moveX = (10 - this.size / 30) + Math.random() * 2 + 1;
        this.moveY = (10 - this.size / 30) + Math.random() * 2 + 1;
        this.rotation = Math.random() * 2 * Math.PI;

        this.paintSquare(canvas, ctx);
    }

    setRandomColor(canvas, ctx) {
        this.color = "rgb(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + ")";
        this.rotation = Math.random() * 2 * Math.PI;
        this.paintSquare(canvas, ctx);
    }

    setAlive(alive) {
        this.alive = alive;
    }

    isAlive() {
        return this.alive;
    }
}

const squares = new Array(200);

let keyPressedKiller = false;
let keyPressedReviver = false;
let ended = false;

function init() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    updateCanvasSize();

    for (let i = 0; i < squares.length; i++) {
        squares[i] = new Square(i, Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 40 + 80, "rgb(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + ")", Math.random() > 0.5, Math.random() > 0.5);
        squares[i].paintSquare(canvas, ctx);
    }

    //canvas.onclick = changeAllColors;
    // On Keyboard event
    addEventListener("keydown", (event) => {
        if (ended) {
            if (event.key === "Escape") {
                reset();
                ended = false;
            }

            return;
        }

        if (event.key === "p") {
            changeAllColors();
        } else if (event.key === "Escape") {
            reset();
        } else if (event.key === " ") {
            if (keyPressedKiller) return;

            killOneChevelu();

            /*setTimeout(() => {
                if (ended) return;

                if (Math.random() > 0.5) {
                    return;
                }

                killOneChevelu();
            }, Math.random() * 5000 + 1000);*/

            keyPressedKiller = true;
        } else if (event.key === "Enter") {
            if (keyPressedReviver) return;

            reviveOneChevelu();
            keyPressedReviver = true;
        }
    });

    addEventListener("keyup", (event) => {
        if (event.key === " ") {
            keyPressedKiller = false;
        } else if (event.key === "Enter") {
            keyPressedReviver = false;
        }
    });

    reset();

    setInterval(game, 20);
    //setInterval(changeAllColors, 1000);

    addEventListener("resize", () => {
        updateCanvasSize();
    });
}

function reset() {
    ended = false;

    for (let i = 0; i < squares.length / 2; i++) {
        squares[i].setAlive(true);
    }

    for (let i = squares.length / 2; i < squares.length; i++) {
        squares[i].setAlive(false);
    }

    updateBar();
}

function updateCanvasSize() {
    const canvas = document.getElementById("canvas");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 58;
}

function changeAllColors() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    for (let i = 0; i < squares.length; i++) {
        squares[i].setRandomColor(canvas, ctx);
    }

    // Set background color that do a random color
    document.body.style.backgroundColor = "rgb(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + ")";
}

function clearCanvas() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function game() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    clearCanvas();

    for (let i = 0; i < squares.length; i++) {
        if (squares[i].isAlive()) {
            squares[i].move(canvas, ctx);
        }
    }
}

function countChevelus() {
    let count = 0;

    for (let i = 0; i < squares.length; i++) {
        if (squares[i].isAlive()) {
            count++;
        }
    }

    return count;
}

function killOneChevelu() {
    for (let i = 0; i < squares.length; i++) {
        if (squares[i].isAlive()) {
            squares[i].setAlive(false);
            break;
        }
    }

    updateBar();
    checkEnd();
}

function reviveOneChevelu() {
    for (let i = 0; i < squares.length; i++) {
        if (!squares[i].isAlive()) {
            squares[i].setAlive(true);
            break;
        }
    }

    updateBar();
    checkEnd();
}

function updateBar() {
    console.log("updateBar");

    const chevelus = countChevelus();
    const percent = (chevelus / squares.length * 100) + "%";

    document.getElementById("counter").innerText = chevelus + " CHEVELUS restants...\nL'attaque des CHEVELUS";
    document.getElementById("bar").style.background = "linear-gradient(to right, white " + percent + ", black " + percent + ")";
}

function checkEnd() {
    const chevelus = countChevelus();

    if (chevelus === 0) {
        document.getElementById("counter").innerText = "Plus de CHEVELUS sur Terre, la Terre est sauvée !";

        ended = true;
    } else if (chevelus === squares.length) {
        document.getElementById("counter").innerText = "Les CHEVELUS ont pris le dessus !";

        ended = true;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    init();
}, false);