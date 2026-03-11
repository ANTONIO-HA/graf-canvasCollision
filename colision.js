const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let circles = [];

// Función para ajustar el tamaño del canvas dinámicamente (Responsivo)
function resizeCanvas() {
    // Tomamos las dimensiones exactas que el CSS le está asignando al canvas visualmente
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Ajustar las posiciones de los círculos si la pantalla se encoge
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

// 3. Llamada inicial y evento de escucha
window.addEventListener('resize', resizeCanvas); 
resizeCanvas(); // Ahora la llamamos de forma segura

canvas.style.background = "rgb(188, 230, 247)";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.originalColor = color; 
        this.color = color;
        this.text = text;
        this.speed = speed;
        
        this.dx = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        this.dy = (Math.random() < 0.5 ? 1 : -1) * this.speed;
        
        this.isColliding = false; 
    }

    draw(context) {
        context.beginPath();
        context.strokeStyle = this.isColliding ? "#0000FF" : this.originalColor;
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
        this.isColliding = false; 

        for (let i = 0; i < circlesArray.length; i++) {
            let otherCircle = circlesArray[i];

            if (this === otherCircle) continue;

            let dx = this.posX - otherCircle.posX;
            let dy = this.posY - otherCircle.posY;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + otherCircle.radius) {
                this.isColliding = true;
                break; 
            }
        }
    }

    update(context) {
        this.draw(context);

        this.posX += this.dx;

        if (this.posX + this.radius > canvas.width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }

        this.posY += this.dy;

        if (this.posY + this.radius > canvas.height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
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
    
    circles.forEach(circle => {
        circle.checkCollisions(circles);
    });

    circles.forEach(circle => {
        circle.update(ctx); 
    });
    
    requestAnimationFrame(animate); 
}

generateCircles(20); 
animate();