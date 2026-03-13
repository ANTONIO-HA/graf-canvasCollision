const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let circles = [];
let score = 0; 

// CARGAMOS TODAS LAS IMÁGENES DE LA INTERFAZ
const scoreImg = new Image();
scoreImg.src = "assets/img/score.png";

const facilImg = new Image();
facilImg.src = "assets/img/facil.png";

const medioImg = new Image();
medioImg.src = "assets/img/medio.png";

const dificilImg = new Image();
dificilImg.src = "assets/img/dificil.png";

// CARGAMOS LA IMAGEN PNG DEL METEORO
const meteorImg = new Image();
meteorImg.src = "assets/img/meteoro.png"; // De vuelta a la simplicidad del PNG

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

window.addEventListener('resize', resizeCanvas); 
resizeCanvas(); 

class Circle {
    constructor(initialLoad = false) {
        this.reset(initialLoad); 
    }

    reset(initialLoad = false) {
        // TAMAÑO GRANDE DE METEOROS (Rango de radio 50-90)
        this.radius = Math.random() * 40 + 20;
        this.mass = this.radius; // Masa proporcional al radio
        
        this.flashTimer = 0; // Temporizador para el efecto visual de rebote
        
        // Aparece en una posición X aleatoria
        this.posX = Math.random() * (canvas.width - this.radius * 2) + this.radius;
        
        // Si es el inicio, los esparcimos por toda la pantalla. Si es reciclado, aparece justo arriba.
        this.posY = initialLoad ? Math.random() * (canvas.height / 2) : -this.radius;
        
        // VELOCIDADES REDUCIDAS Y BALANCEADAS
        let speedMultiplier = 0.8; // Fácil: Base más manejable
        if (score > 15) {
            speedMultiplier = 2.6; // Difícil: Rápido pero justo
        } else if (score > 10) {
            speedMultiplier = 1.4; // Medio: Progresión clara
        }
        
        // Velocidad horizontal y vertical
        this.dx = (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 2 + 1) * speedMultiplier;
        
        // Velocidad mínima para asegurar que sigan cayendo
        this.minDy = 2 * speedMultiplier;
        this.dy = (Math.random() * 4 + this.minDy); 
    }

    draw(context) {
        // EFECTO SIMPLE DE REBOTE: Transparencia breve al chocar
        if (this.flashTimer > 0) {
            context.globalAlpha = 0.7; // 70% opaco
            this.flashTimer--; 
        } else {
            context.globalAlpha = 1.0; // 100% opaco
        }

        // Dibujamos el PNG centrado y del tamaño exacto de su radio
        if (meteorImg.complete) {
            context.drawImage(meteorImg, this.posX - this.radius, this.posY - this.radius, this.radius * 2, this.radius * 2);
        }

        // Restablecemos la transparencia para no afectar la UI
        context.globalAlpha = 1.0;
    }

    checkCollisions(circlesArray) {
        let myIndex = circlesArray.indexOf(this);
        for (let i = myIndex + 1; i < circlesArray.length; i++) {
            let otherCircle = circlesArray[i];

            let dx = this.posX - otherCircle.posX;
            let dy = this.posY - otherCircle.posY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + otherCircle.radius) {
                // Activamos la transparencia al chocar
                this.flashTimer = 5;
                otherCircle.flashTimer = 5;
                this.resolveCollision(otherCircle, dx, dy, distance);
            }
        }
    }

    resolveCollision(otherCircle, dx, dy, distance) {
        let overlap = (this.radius + otherCircle.radius) - distance;
        let nx = dx / distance; 
        let ny = dy / distance; 

        // Evitar que se queden pegados
        this.posX += nx * (overlap / 2);
        this.posY += ny * (overlap / 2);
        otherCircle.posX -= nx * (overlap / 2);
        otherCircle.posY -= ny * (overlap / 2);

        let v1n = this.dx * nx + this.dy * ny;
        let v2n = otherCircle.dx * nx + otherCircle.dy * ny;

        let v1t = this.dx * -ny + this.dy * nx;
        let v2t = otherCircle.dx * -ny + otherCircle.dy * nx;

        let m1 = this.mass;
        let m2 = otherCircle.mass;

        let v1nFinal = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
        let v2nFinal = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

        this.dx = v1nFinal * nx - v1t * ny;
        this.dy = Math.abs(v1nFinal * ny + v1t * nx); // Gravedad absoluta hacia abajo
        
        otherCircle.dx = v2nFinal * nx - v2t * ny;
        otherCircle.dy = Math.abs(v2nFinal * ny + v2t * nx);

        if (this.dy < this.minDy) this.dy = this.minDy;
        if (otherCircle.dy < otherCircle.minDy) otherCircle.dy = otherCircle.minDy;
    }

    move() {
        this.posX += this.dx;
        this.posY += this.dy;

        // Rebote en las paredes laterales
        if (this.posX + this.radius > canvas.width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
            this.posX = this.posX < this.radius ? this.radius : canvas.width - this.radius;
        }

        // Si caen por el fondo, desaparecen y se reciclan arriba
        if (this.posY - this.radius > canvas.height) {
            this.reset();
        }
    }

    isClicked(mouseX, mouseY) {
        let dx = mouseX - this.posX;
        let dy = mouseY - this.posY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius;
    }
}

canvas.addEventListener('mousedown', function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Recorremos en reversa para poder dar clic en los meteoros que están enfrente
    for (let i = circles.length - 1; i >= 0; i--) {
        if (circles[i].isClicked(mouseX, mouseY)) {
            score++; 
            circles[i].reset(); 
            break; 
        }
    }
});

function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        circles.push(new Circle(true));
    }
}

function drawUI() {
    let diffY = 5;  
    let scoreY = 5; 

    // 1. Dificultad
    let diffX = 20;
    let currentDiffImg = facilImg; 

    if (score > 15) {
        currentDiffImg = dificilImg;
    } else if (score > 10) {
        currentDiffImg = medioImg;
    }

    let diffWidth = 180; 
    if (currentDiffImg.complete && currentDiffImg.width > 0) {
        let diffRatio = currentDiffImg.height / currentDiffImg.width;
        let diffHeight = diffWidth * diffRatio; 
        ctx.drawImage(currentDiffImg, diffX, diffY, diffWidth, diffHeight);
    }

    // 2. Puntuación
    let scoreWidth = 160; 
    let imgX = canvas.width - scoreWidth - 20; 
    let scoreHeight = 0; 

    if (scoreImg.complete && scoreImg.width > 0) {
        let scoreRatio = scoreImg.height / scoreImg.width;
        scoreHeight = scoreWidth * scoreRatio; 
        ctx.drawImage(scoreImg, imgX, scoreY, scoreWidth, scoreHeight);
    }

    // 3. Número de puntuación centrado
    if (scoreHeight > 0) {
        ctx.fillStyle = "#ffffff"; 
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 28px Arial"; 
        
        let textX = imgX + (scoreWidth / 2);
        let textY = scoreY + (scoreHeight / 2); 
        
        ctx.fillText(score, textX, textY);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    circles.forEach(circle => circle.move());
    circles.forEach(circle => circle.checkCollisions(circles));
    circles.forEach(circle => circle.draw(ctx));

    drawUI();
    
    requestAnimationFrame(animate); 
}

// Empezamos con 20 meteoros
generateCircles(20); 
animate();