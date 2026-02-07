
// --- WHITEBOARD LOGIC ---

let isWhiteboardOpen = false;
const canvas = document.getElementById('wbCanvas');
let ctx;
let isDrawing = false;
let currentTool = 'pen';

// Initialize context when DOM is ready or when toggled
function initWhiteboard() {
    if (canvas && !ctx) {
        ctx = canvas.getContext('2d');
        // Events
        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDraw);
        canvas.addEventListener('mouseout', stopDraw);
    }
}

function resizeCanvas() {
    const container = document.getElementById('canvasArea');
    if (!container) return;
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = currentTool === 'eraser' ? 20 : 3;
        ctx.strokeStyle = '#000';
    }
}

function toggleWhiteboard() {
    const wb = document.getElementById('whiteboardContainer');
    const grid = document.getElementById('grid');
    const pip = document.getElementById('pipWindow');
    const btn = document.getElementById('wbBtn');

    isWhiteboardOpen = !isWhiteboardOpen;

    if (isWhiteboardOpen) {
        if (!ctx) initWhiteboard();
        wb.classList.add('active');
        grid.classList.add('hidden');
        pip.classList.add('active');
        btn.classList.add('active');
        resizeCanvas();
    } else {
        wb.classList.remove('active');
        grid.classList.remove('hidden');
        pip.classList.remove('active');
        btn.classList.remove('active');
    }
}

function selectTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.wb-btn').forEach(b => b.classList.remove('active'));
    if (tool === 'pen') {
        document.querySelector('.wb-btn:nth-child(1)').classList.add('active');
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 3;
    } else if (tool === 'eraser') {
        document.querySelector('.wb-btn:nth-child(2)').classList.add('active');
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
    }
}

function clearBoard() {
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function startDraw(e) {
    isDrawing = true;
    draw(e);
}
function draw(e) {
    if (!isDrawing || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}
function stopDraw() {
    isDrawing = false;
    if (ctx) ctx.beginPath();
}

// Window resize handler
window.addEventListener('resize', () => {
    if (isWhiteboardOpen) resizeCanvas();
});
