// --- Global Core Variables & Setup ---
const canvas = document.getElementById('globalCanvas');
const ctx = canvas.getContext('2d');
let animationFrameId;

let elementsArray = [];
let fireworksArray = [];
let confettiArray = [];

const config = {
    maxParticles: 40,
    maxRoses: 15,
    maxBubbles: 20,
    countdownDuration: 5, // duration in seconds
    letterMessage: "Dear Bushra,\n\nOn this beautiful day, I want to remind you of how extraordinarily special you are. May your world be filled with endless magic, laughter, and everything your heart desires.\n\nHappy Birthday! ✨"
};

// Handle Canvas Resize
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Mouse Tracking Custom Cursor ---
const customCursor = document.querySelector('.custom-cursor');
document.addEventListener('mousemove', (e) => {
    customCursor.style.left = `${e.clientX}px`;
    customCursor.style.top = `${e.clientY}px`;
});

// --- Structural Element Generation (Hearts, Roses, Bubbles, Stars) ---
class BackgroundElement {
    constructor(type) {
        this.type = type; // 'star', 'heart', 'rose', 'bubble'
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.size = Math.random() * 12 + 6;
        this.speedY = Math.random() * 1.5 + 0.5;
        this.speedX = Math.sin(Math.random() * 2) * 0.5;
        this.opacity = Math.random() * 0.6 + 0.2;

        if (this.type === 'star') {
            this.y = Math.random() * canvas.height;
            this.speedY = 0.05; // Stars move very slowly
        } else if (this.type === 'rose' || this.type === 'heart') {
            this.y = -20; // drop from top
        } else if (this.type === 'bubble') {
            this.y = canvas.height + 20; // rise from bottom
            this.speedY = -(Math.random() * 1.5 + 0.5);
        }
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // Boundary checks
        if (this.type === 'bubble' && this.y < -20) this.reset();
        else if (this.type !== 'bubble' && this.y > canvas.height + 20) this.reset();
        if (this.x > canvas.width + 20 || this.x < -20) this.reset();
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        if (this.type === 'star') {
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'heart') {
            ctx.fillStyle = '#ff69b4';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.bezierCurveTo(this.x - this.size/2, this.y - this.size/2, this.x - this.size, this.y + this.size/3, this.x, this.y + this.size);
            ctx.bezierCurveTo(this.x + this.size, this.y + this.size/3, this.x + this.size/2, this.y - this.size/2, this.x, this.y);
            ctx.fill();
        } else if (this.type === 'rose') {
            ctx.fillStyle = '#ff1493';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size/2, 0, Math.PI*2);
            ctx.fill();
        } else if (this.type === 'bubble') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// Initialize Background Environmental Elements
function initEnvironment() {
    elementsArray = [];
    for (let i = 0; i < config.maxParticles; i++) elementsArray.push(new BackgroundElement('star'));
    for (let i = 0; i < config.maxParticles / 2; i++) elementsArray.push(new BackgroundElement('heart'));
    for (let i = 0; i < config.maxRoses; i++) elementsArray.push(new BackgroundElement('rose'));
    for (let i = 0; i < config.maxBubbles; i++) elementsArray.push(new BackgroundElement('bubble'));
}

// --- Heavy Fireworks & Confetti Mechanics ---
class Firework {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.distanceToTarget = Math.hypot(targetX - x, targetY - y);
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while(this.coordinateCount--) this.coordinates.push([this.x, this.y]);
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = Math.random() * 50 + 50;
        this.hue = Math.random() * 360;
    }
    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.acceleration;
        let vx = Math.cos(this.angle) * this.speed;
        let vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = Math.hypot(this.targetX - this.x, this.targetY - this.y);
        
        if(this.speed >= this.distanceTraveled) {
            createExplosion(this.targetX, this.targetY, this.hue);
            fireworksArray.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.stroke();
    }
}

class FireworkParticle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while(this.coordinateCount--) this.coordinates.push([this.x, this.y]);
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 10 + 1;
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = hue + (Math.random() * 40 - 20);
        this.brightness = Math.random() * 60 + 40;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.015;
    }
    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;
        if(this.alpha <= this.decay) {
            confettiArray.splice(index, 1);
        }
    }
    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `rgba(255,105,180,${this.alpha})`;
        ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}

function createExplosion(x, y, hue) {
    let count = 60;
    while(count--) {
        confettiArray.push(new FireworkParticle(x, y, hue));
    }
}

function triggerAutomaticCelebrationEffect() {
    if(Math.random() < 0.05) {
        fireworksArray.push(new Firework(Math.random() * canvas.width, canvas.height, Math.random() * canvas.width, Math.random() * (canvas.height / 2)));
    }
}

// --- Engine Animation Loop ---
function engineLoop() {
    ctx.fillStyle = 'rgba(5, 2, 10, 0.2)'; // trail effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update & Draw environment items
    elementsArray.forEach(element => {
        element.update();
        element.draw();
    });

    // Handle Fireworks mechanics
    let fLen = fireworksArray.length;
    while(fLen--) {
        fireworksArray[fLen].draw();
        fireworksArray[fLen].update(fLen);
    }

    // Handle Particles/Explosion items
    let pLen = confettiArray.length;
    while(pLen--) {
        confettiArray[pLen].draw();
        confettiArray[pLen].update(pLen);
    }

    animationFrameId = requestAnimationFrame(engineLoop);
}

// --- Scroll/Parallax Intersection Observer ---
const cards = document.querySelectorAll('.glass-card');
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };

const appearanceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Trigger customized actions based on section
            if(entry.target.classList.contains('hero-card')) {
                startCountdown();
            }
        }
    });
}, observerOptions);

cards.forEach(card => appearanceObserver.observe(card));

// Observer specifically designed to monitor entry into the grand finale arena
const finalTitle = document.getElementById('grandTitle');
const finalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            finalTitle.classList.add('celebrate');
            document.body.classList.add('shake-screen');
            setTimeout(() => document.body.classList.remove('shake-screen'), 500);
            // Engage structural heavy continuous pyrotechnics
            setInterval(triggerAutomaticCelebrationEffect, 150);
        }
    });
}, {threshold: 0.5});
finalObserver.observe(finalTitle);

// --- Sequence Navigation Framework (Intro Curtain Transition) ---
document.getElementById('start-btn').addEventListener('click', () => {
    const introOverlay = document.getElementById('intro-overlay');
    const mainContent = document.getElementById('main-content');
    
    introOverlay.classList.add('curtain-open');
    mainContent.classList.remove('fade-in-hidden');
    
    // Fire up execution systems
    initEnvironment();
    engineLoop();
    
    setTimeout(() => {
        introOverlay.style.display = 'none';
    }, 1500);
});

// --- Feature Functionality Modules ---

// 1. Circular Countdown Engine
let countdownTriggered = false;
function startCountdown() {
    if (countdownTriggered) return;
    countdownTriggered = true;

    let timeLeft = config.countdownDuration;
    const numberDisplay = document.getElementById('countdown-seconds');
    const progressCircle = document.getElementById('progress-circle');
    const totalDash = 377; // Circle circumference ($2 * \pi * 60$)

    let interval = setInterval(() => {
        timeLeft--;
        numberDisplay.textContent = timeLeft;

        let offset = totalDash - (timeLeft / config.countdownDuration) * totalDash;
        progressCircle.style.strokeDashoffset = offset;

        if (timeLeft <= 0) {
            clearInterval(interval);
            numberDisplay.textContent = "✨";
            // Launch immediate massive splash burst sequence
            for(let i=0; i<5; i++) {
                setTimeout(() => {
                    createExplosion(Math.random() * canvas.width, Math.random() * (canvas.height/2), Math.random()*360);
                }, i * 300);
            }
        }
    }, 1000);
}

// 2. Interactive Cake Dynamics
let blownCount = 0;
function blowCandle(candleElement) {
    if (!candleElement.classList.contains('blown')) {
        candleElement.classList.add('blown');
        blownCount++;
        
        // Minor burst indicator
        createExplosion(candleElement.getBoundingClientRect().left + 4, candleElement.getBoundingClientRect().top, 320);

        if (blownCount === 3) {
            setTimeout(() => {
                alert("✨ Your wish has been sent up to the heavens, Bushra! ✨");
                // Launch dynamic celebrations around space
                for(let i=0; i<8; i++) {
                    fireworksArray.push(new Firework(Math.random()*canvas.width, canvas.height, Math.random()*canvas.width, Math.random()*(canvas.height/2)));
                }
            }, 600);
        }
    }
}

// 3. 3D Gift Box Opening Routine
function openGift() {
    const box = document.getElementById('giftBox');
    if (!box.classList.contains('open')) {
        box.classList.add('open');
        // Release immediate massive visual elements package
        for (let i = 0; i < 15; i++) {
            confettiArray.push(new FireworkParticle(window.innerWidth / 2, window.innerHeight / 2, Math.random() * 360));
        }
        for (let i = 0; i < 4; i++) {
            fireworksArray.push(new Firework(window.innerWidth/2, window.innerHeight/2 + 100, Math.random()*canvas.width, Math.random()*(canvas.height/2)));
        }
    }
}

// 4. Envelope Dynamics & Custom Typewriter Sequence
let letterOpened = false;
function openEnvelope() {
    if (letterOpened) return;
    letterOpened = true;
    
    const envelope = document.getElementById('envelope');
    envelope.classList.add('open');

    // Delay executing typewriter system until letter is completely positioned
    setTimeout(executeTypewriterEffect, 600);
}

function executeTypewriterEffect() {
    const targetContainer = document.getElementById('typewriter-text');
    let idx = 0;
    
    function appendCharacter() {
        if (idx < config.letterMessage.length) {
            targetContainer.textContent += config.letterMessage.charAt(idx);
            idx++;
            setTimeout(appendCharacter, 45);
        }
    }
    appendCharacter();
}

// 5. Realistic Book Flip Execution Architecture
function flipPage(pageElement, pageIndex) {
    if (pageElement.classList.contains('flipped')) {
        pageElement.classList.remove('flipped');
        pageElement.style.zIndex = 10 + pageIndex;
    } else {
        pageElement.classList.add('flipped');
        pageElement.style.zIndex = 10 - pageIndex;
    }
}

// --- Scroll & Navigation Extras Management ---
const backToTopBtn = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > window.innerHeight) {
        backToTopBtn.classList.add('show-btn');
    } else {
        backToTopBtn.classList.remove('show-btn');
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
