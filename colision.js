const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let circles = [];

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    circles.forEach(circle => {
        if (circle.posX + circle.radius > canvas.width) {
            circle.posX = canvas.width - circle.radius;
        }
        if (circle.posY + circle.radius > canvas.height) {
            circle.posY = canvas.height - circle.radius;
        }
    });
}

window.addEventListener('resize', resizeCanvas); 
resizeCanvas(); 

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.originalColor = color; 
        this.color = color;
        this.text = text;
        this.speed = speed;
        this.mass = this.radius; 
        
        this.dx = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        this.dy = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        
        // REEMPLAZO: Temporizador en lugar de booleano
        this.flashTimer = 0; 
    }

    draw(context) {
        context.beginPath();
        
        // Si el temporizador es mayor a 0, pintamos azul y reducimos el tiempo
        if (this.flashTimer > 0) {
            context.strokeStyle = "#0000FF";
            this.flashTimer--; 
        } else {
            context.strokeStyle = this.originalColor;
        }

        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        
        context.lineWidth = 3; 
        
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    checkCollisions(circlesArray) {
        let myIndex = circlesArray.indexOf(this);
        
        for (let i = myIndex + 1; i < circlesArray.length; i++) {
            let otherCircle = circlesArray[i];

            let dx = this.posX - otherCircle.posX;
            let dy = this.posY - otherCircle.posY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + otherCircle.radius) {
                // Le damos 5 fotogramas de duración al flash azul
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
        this.dy = v1nFinal * ny + v1t * nx;
        
        otherCircle.dx = v2nFinal * nx - v2t * ny;
        otherCircle.dy = v2nFinal * ny + v2t * nx;
    }

    // NUEVO MÉTODO: Separa la lógica física del dibujo visual
    move() {
        this.posX += this.dx;

        if (this.posX + this.radius > canvas.width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
            this.posX = this.posX < this.radius ? this.radius : canvas.width - this.radius;
        }

        this.posY += this.dy;

        if (this.posY + this.radius > canvas.height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
            this.posY = this.posY < this.radius ? this.radius : canvas.height - this.radius;
        }
    }
}

function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20; 
        let x = Math.random() * (canvas.width - radius * 2) + radius;
        let y = Math.random() * (canvas.height - radius * 2) + radius;
        let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; 
        let speed = Math.random() * 8 + 4; 
        let text = (i + 1).toString(); 
        
        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    // NUEVO ORDEN DEL GAME LOOP (Mejor estructurado para evitar Bugs)
    
    // 1. Movemos todos los círculos a sus nuevas posiciones
    circles.forEach(circle => circle.move());

    // 2. Verificamos colisiones y ajustamos si es necesario
    circles.forEach(circle => circle.checkCollisions(circles));

    // 3. Dibujamos el resultado final en la pantalla
    circles.forEach(circle => circle.draw(ctx));
    
    requestAnimationFrame(animate); 
}

generateCircles(20); 
animate();