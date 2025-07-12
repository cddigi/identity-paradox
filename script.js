// Global variables
let currentMode = 'rotoscope';
let isProcessing = false;
let originalVideo = null;
let outputCanvas = null;
let ctx = null;
let animationId = null;
let mediaRecorder = null;
let recordedChunks = [];

// Style presets for rotoscope mode
const stylePresets = {
    scanner: {
        edgeThreshold: 30,
        posterization: 6,
        lineThickness: 2,
        colorMatrix: [0.8, 0.1, 0.1, 0.1, 0.8, 0.1, 0.1, 0.1, 0.8]
    },
    comic: {
        edgeThreshold: 50,
        posterization: 4,
        lineThickness: 3,
        colorMatrix: [1.2, 0, 0, 0, 1.2, 0, 0, 0, 1.2]
    },
    noir: {
        edgeThreshold: 40,
        posterization: 8,
        lineThickness: 2,
        colorMatrix: [0.3, 0.3, 0.3, 0.6, 0.6, 0.6, 0.1, 0.1, 0.1]
    },
    neon: {
        edgeThreshold: 25,
        posterization: 5,
        lineThickness: 2.5,
        colorMatrix: [1.5, 0, 0.5, 0, 1.5, 0.5, 0.5, 0.5, 1.5]
    },
    watercolor: {
        edgeThreshold: 60,
        posterization: 10,
        lineThickness: 1.5,
        colorMatrix: [0.9, 0.1, 0.2, 0.1, 0.9, 0.2, 0.2, 0.2, 0.9]
    }
};

// Laughing Man quotes
const laughingManQuotes = {
    default: "I thought what I'd do was, I'd pretend I was one of those deaf-mutes",
    net: "The net is vast and infinite",
    complex: "A stand alone complex",
    catcher: "I'll be a catcher in the rye",
    puppet: "There's nothing sadder than a puppet without a ghost"
};

// Current settings
let currentStyle = 'scanner';
let settings = {
    edgeThreshold: 30,
    posterization: 6,
    lineThickness: 2,
    logoOpacity: 0.9,
    rotationSpeed: 0.02,
    currentQuote: laughingManQuotes.default,
    defaceThreshold: 0.3
};

// Laughing Man Logo class
class LaughingManLogo {
    constructor(text) {
        this.text = text;
        this.rotation = 0;
        this.logoImage = new Image();
        this.logoImage.src = this.createLaughingManSVG();
    }
    
    createLaughingManSVG() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#00CED1" stroke-width="3"/>
            <g transform="translate(100, 100)">
                <circle cx="0" cy="-10" r="40" fill="#00CED1"/>
                <circle cx="-15" cy="-20" r="5" fill="#1a1a1a"/>
                <circle cx="15" cy="-20" r="5" fill="#1a1a1a"/>
                <path d="M -20 -5 Q 0 5 20 -5" stroke="#1a1a1a" stroke-width="3" fill="none"/>
                <rect x="-30" y="-50" width="60" height="10" fill="#FF6B35"/>
                <rect x="-20" y="-60" width="40" height="15" fill="#FF6B35"/>
            </g>
        </svg>`;
        
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }
    
    draw(ctx, x, y, radius) {
        ctx.save();
        ctx.translate(x, y);
        
        // Draw circular background
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(0, 206, 209, ${settings.logoOpacity})`;
        ctx.fill();
        
        // Draw center logo
        const logoSize = radius * 0.6;
        if (this.logoImage.complete) {
            ctx.drawImage(
                this.logoImage,
                -logoSize/2, -logoSize/2,
                logoSize, logoSize
            );
        }
        
        // Draw rotating text
        this.drawRotatingText(ctx, radius * 0.8);
        
        ctx.restore();
        
        // Update rotation for next frame
        this.rotation += settings.rotationSpeed;
    }
    
    drawRotatingText(ctx, radius) {
        ctx.save();
        ctx.rotate(this.rotation);
        ctx.font = `${radius * 0.15}px monospace`;
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw text along circular path
        const chars = this.text.split('');
        const angleStep = (2 * Math.PI) / chars.length;
        
        chars.forEach((char, i) => {
            const angle = i * angleStep;
            ctx.save();
            ctx.rotate(angle);
            ctx.translate(0, -radius);
            ctx.rotate(-angle - this.rotation);
            ctx.fillText(char, 0, 0);
            ctx.restore();
        });
        
        ctx.restore();
    }
    
    updateText(newText) {
        this.text = newText;
    }
}

// Initialize Laughing Man
let laughingManLogo = null;
let faceTracking = [];

// Initialize face detection
async function initializeFaceDetection() {
    try {
        updateStatus('Loading face detection models...', 'processing');
        
        // Use the jsdelivr CDN with correct paths for face-api.js models
        const modelBaseUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
        
        await faceapi.nets.tinyFaceDetector.loadFromUri(modelBaseUrl);
        await faceapi.nets.faceLandmark68Net.loadFromUri(modelBaseUrl);
        
        updateStatus('Face detection ready', 'success');
    } catch (error) {
        console.error('Error loading face detection:', error);
        updateStatus('Face detection models failed to load. Laughing Man mode may not work properly.', 'error');
        
        // Fallback: try alternative CDN
        try {
            const fallbackUrl = 'https://justadudewhohacks.github.io/face-api.js/models';
            await faceapi.nets.tinyFaceDetector.loadFromUri(fallbackUrl);
            await faceapi.nets.faceLandmark68Net.loadFromUri(fallbackUrl);
            updateStatus('Face detection ready (fallback models)', 'success');
        } catch (fallbackError) {
            console.error('Fallback model loading failed:', fallbackError);
            updateStatus('Face detection unavailable. Please check internet connection.', 'error');
        }
    }
}

// Detect faces in video frame
async function detectFaces(video) {
    try {
        const detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks();
        
        return detections.map(d => ({
            x: d.detection.box.x,
            y: d.detection.box.y,
            width: d.detection.box.width,
            height: d.detection.box.height
        }));
    } catch (error) {
        console.error('Face detection error:', error);
        return [];
    }
}

// Smooth face tracking
function smoothFaceTracking(newFaces, oldTracking) {
    return newFaces.map(newFace => {
        const match = findClosestFace(newFace, oldTracking);
        if (match) {
            return {
                x: lerp(match.x, newFace.x, 0.3),
                y: lerp(match.y, newFace.y, 0.3),
                width: lerp(match.width, newFace.width, 0.3),
                height: lerp(match.height, newFace.height, 0.3)
            };
        }
        return newFace;
    });
}

function findClosestFace(face, trackingArray) {
    let minDistance = Infinity;
    let closest = null;
    
    trackingArray.forEach(tracked => {
        const distance = Math.sqrt(
            Math.pow(face.x - tracked.x, 2) + 
            Math.pow(face.y - tracked.y, 2)
        );
        if (distance < minDistance && distance < 50) {
            minDistance = distance;
            closest = tracked;
        }
    });
    
    return closest;
}

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// Edge detection using Sobel filter
function detectEdges(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let pixelX = 0;
            let pixelY = 0;
            
            for (let j = -1; j <= 1; j++) {
                for (let i = -1; i <= 1; i++) {
                    const idx = ((y + j) * width + (x + i)) * 4;
                    const gray = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
                    const kernelIdx = (j + 1) * 3 + (i + 1);
                    pixelX += gray * sobelX[kernelIdx];
                    pixelY += gray * sobelY[kernelIdx];
                }
            }
            
            const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
            const idx = (y * width + x) * 4;
            const edge = magnitude > settings.edgeThreshold ? 255 : 0;
            
            output[idx] = edge;
            output[idx + 1] = edge;
            output[idx + 2] = edge;
            output[idx + 3] = 255;
        }
    }
    
    return output;
}

// Posterization
function posterize(data, levels) {
    const factor = 255 / (levels - 1);
    
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.round(data[i] / factor) * factor;
        data[i + 1] = Math.round(data[i + 1] / factor) * factor;
        data[i + 2] = Math.round(data[i + 2] / factor) * factor;
    }
}

// Apply color matrix
function applyColorMatrix(data, matrix) {
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        data[i] = r * matrix[0] + g * matrix[1] + b * matrix[2];
        data[i + 1] = r * matrix[3] + g * matrix[4] + b * matrix[5];
        data[i + 2] = r * matrix[6] + g * matrix[7] + b * matrix[8];
    }
}

// Combine edges with posterized image
function combineEdges(imageData, edges) {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        if (edges[i] === 255) {
            // Edge pixels become black with line thickness
            const thickness = settings.lineThickness;
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
        }
    }
}

// Process frame for rotoscope mode
function processRotoscopeFrame() {
    if (!isProcessing || originalVideo.paused || originalVideo.ended) {
        return;
    }
    
    ctx.drawImage(originalVideo, 0, 0, outputCanvas.width, outputCanvas.height);
    const imageData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Apply effects
    const edges = detectEdges(imageData);
    posterize(imageData.data, settings.posterization);
    applyColorMatrix(imageData.data, stylePresets[currentStyle].colorMatrix);
    combineEdges(imageData, edges);
    
    ctx.putImageData(imageData, 0, 0);
    
    animationId = requestAnimationFrame(processRotoscopeFrame);
}

// Process frame for Laughing Man mode
async function processLaughingManFrame() {
    if (!isProcessing || originalVideo.paused || originalVideo.ended) {
        return;
    }
    
    // Draw original video
    ctx.drawImage(originalVideo, 0, 0, outputCanvas.width, outputCanvas.height);
    
    // Detect faces periodically (not every frame for performance)
    if (Math.random() < 0.2) { // 20% chance to update face detection
        const faces = await detectFaces(originalVideo);
        faceTracking = smoothFaceTracking(faces, faceTracking);
    }
    
    // Overlay Laughing Man logo on each face
    faceTracking.forEach(face => {
        const centerX = face.x + face.width / 2;
        const centerY = face.y + face.height / 2;
        const radius = Math.max(face.width, face.height) * 0.7;
        
        laughingManLogo.draw(ctx, centerX, centerY, radius);
    });
    
    animationId = requestAnimationFrame(processLaughingManFrame);
}

// Start processing
function startProcessing() {
    if (!originalVideo.src) return;
    
    isProcessing = true;
    updateStatus('Processing video...', 'processing');
    document.getElementById('processBtn').textContent = 'Stop Processing';
    document.getElementById('exportBtn').disabled = false;
    
    if (currentMode === 'laughing-man') {
        if (!laughingManLogo) {
            laughingManLogo = new LaughingManLogo(settings.currentQuote);
        }
        processLaughingManFrame();
    } else if (currentMode === 'deface') {
        processDefaceVideo();
    } else {
        processRotoscopeFrame();
    }
}

// Stop processing
function stopProcessing() {
    isProcessing = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    updateStatus('Processing stopped', 'success');
    document.getElementById('processBtn').textContent = 'Process Video';
}

// Export video
function startExport() {
    if (!isProcessing) {
        updateStatus('Please process the video first', 'error');
        return;
    }
    
    recordedChunks = [];
    
    const stream = outputCanvas.captureStream(30);
    mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
    });
    
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `identity-paradox-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        updateStatus('Video exported successfully', 'success');
    };
    
    mediaRecorder.start();
    updateStatus('Recording... Click Export again to save', 'processing');
    
    document.getElementById('exportBtn').textContent = 'Save Video';
    document.getElementById('exportBtn').onclick = () => {
        mediaRecorder.stop();
        document.getElementById('exportBtn').textContent = 'Export Video';
        document.getElementById('exportBtn').onclick = startExport;
    };
}

// Update status message
function updateStatus(message, type = '') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
}

// Process video with deface
async function processDefaceVideo() {
    updateStatus('Processing video with deface...', 'processing');
    
    try {
        // Create blob from video
        const videoBlob = await fetch(originalVideo.src).then(r => r.blob());
        
        // Prepare form data
        const formData = new FormData();
        formData.append('video', videoBlob, 'video.mp4');
        formData.append('mode', document.getElementById('defaceMode').value);
        formData.append('threshold', settings.defaceThreshold);
        
        const scale = document.getElementById('defaceScale').value;
        if (scale) {
            formData.append('scale', scale);
        }
        
        updateStatus('Uploading video to deface server...', 'processing');
        
        // Send to deface server
        const response = await fetch('http://localhost:8080/anonymize', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        updateStatus('Receiving processed video...', 'processing');
        
        // Get processed video
        const processedBlob = await response.blob();
        const processedUrl = URL.createObjectURL(processedBlob);
        
        // Create video element for processed video
        const processedVideo = document.createElement('video');
        processedVideo.src = processedUrl;
        processedVideo.onloadedmetadata = () => {
            // Draw first frame to canvas
            ctx.drawImage(processedVideo, 0, 0, outputCanvas.width, outputCanvas.height);
            
            // Enable download
            const link = document.createElement('a');
            link.href = processedUrl;
            link.download = 'anonymized_video.mp4';
            
            updateStatus('Video processed successfully! Click Export to download.', 'success');
            
            // Update export button to download the processed video
            document.getElementById('exportBtn').onclick = () => {
                link.click();
            };
        };
        
    } catch (error) {
        console.error('Deface processing error:', error);
        updateStatus(`Error: ${error.message}. Make sure deface server is running on port 8080.`, 'error');
        stopProcessing();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    originalVideo = document.getElementById('originalVideo');
    outputCanvas = document.getElementById('outputCanvas');
    ctx = outputCanvas.getContext('2d');
    
    // Video input
    document.getElementById('videoInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            originalVideo.src = url;
            originalVideo.onloadedmetadata = () => {
                outputCanvas.width = originalVideo.videoWidth;
                outputCanvas.height = originalVideo.videoHeight;
                document.getElementById('processBtn').disabled = false;
                updateStatus('Video loaded. Ready to process.', 'success');
            };
        }
    });
    
    // Mode selection
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentMode = btn.dataset.mode;
            
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Hide all controls first
            document.querySelector('.rotoscope-controls').style.display = 'none';
            document.querySelector('.laughing-man-controls').style.display = 'none';
            document.querySelector('.deface-controls').style.display = 'none';
            
            // Show appropriate controls
            if (currentMode === 'laughing-man') {
                document.querySelector('.laughing-man-controls').style.display = 'block';
                initializeFaceDetection();
            } else if (currentMode === 'deface') {
                document.querySelector('.deface-controls').style.display = 'block';
            } else {
                document.querySelector('.rotoscope-controls').style.display = 'block';
            }
            
            stopProcessing();
        });
    });
    
    // Style presets
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentStyle = btn.dataset.style;
            const preset = stylePresets[currentStyle];
            
            settings.edgeThreshold = preset.edgeThreshold;
            settings.posterization = preset.posterization;
            settings.lineThickness = preset.lineThickness;
            
            document.getElementById('edgeThreshold').value = preset.edgeThreshold;
            document.getElementById('posterization').value = preset.posterization;
            document.getElementById('lineThickness').value = preset.lineThickness;
            
            updateSliderDisplays();
            
            document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Sliders
    document.getElementById('edgeThreshold').addEventListener('input', (e) => {
        settings.edgeThreshold = parseInt(e.target.value);
        updateSliderDisplays();
    });
    
    document.getElementById('posterization').addEventListener('input', (e) => {
        settings.posterization = parseInt(e.target.value);
        updateSliderDisplays();
    });
    
    document.getElementById('lineThickness').addEventListener('input', (e) => {
        settings.lineThickness = parseFloat(e.target.value);
        updateSliderDisplays();
    });
    
    document.getElementById('logoOpacity').addEventListener('input', (e) => {
        settings.logoOpacity = parseFloat(e.target.value);
        updateSliderDisplays();
    });
    
    document.getElementById('rotationSpeed').addEventListener('input', (e) => {
        settings.rotationSpeed = parseFloat(e.target.value);
        updateSliderDisplays();
    });
    
    // Quote selection
    document.getElementById('quotePreset').addEventListener('change', (e) => {
        const value = e.target.value;
        const customText = document.getElementById('customText');
        
        if (value === 'custom') {
            customText.style.display = 'block';
            settings.currentQuote = customText.value || 'Enter your text';
        } else {
            customText.style.display = 'none';
            settings.currentQuote = laughingManQuotes[value];
        }
        
        if (laughingManLogo) {
            laughingManLogo.updateText(settings.currentQuote);
        }
    });
    
    document.getElementById('customText').addEventListener('input', (e) => {
        settings.currentQuote = e.target.value || 'Enter your text';
        if (laughingManLogo) {
            laughingManLogo.updateText(settings.currentQuote);
        }
    });
    
    // Action buttons
    document.getElementById('processBtn').addEventListener('click', () => {
        if (isProcessing) {
            stopProcessing();
        } else {
            startProcessing();
        }
    });
    
    document.getElementById('exportBtn').addEventListener('click', startExport);
    
    document.getElementById('resetBtn').addEventListener('click', () => {
        stopProcessing();
        ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        faceTracking = [];
        updateStatus('Reset complete', 'success');
    });
    
    // Deface controls
    document.getElementById('defaceThreshold').addEventListener('input', (e) => {
        settings.defaceThreshold = parseFloat(e.target.value);
    });
    
    // Update slider displays
    function updateSliderDisplays() {
        document.querySelectorAll('.control-group').forEach(group => {
            const input = group.querySelector('input[type="range"]');
            const display = group.querySelector('.value-display');
            if (input && display) {
                display.textContent = input.value;
            }
        });
    }
    
    updateSliderDisplays();
});

// Loading messages easter egg
const loadingMessages = [
    "Resolving identity paradox...",
    "Questioning the nature of self...",
    "Accessing collective unconscious...",
    "Establishing stand alone complex...",
    "Synchronizing with the laughing man...",
    "Deconstructing visual identity...",
    "Who are you, really?",
    "The net is vast and infinite..."
];

// Konami code easter egg
let konamiIndex = 0;
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            console.log('🤖 Tachikoma Mode Activated! 🤖');
            console.log('"Natural oil? Synthetic oil? I prefer the extra virgin type myself!"');
            document.body.style.animation = 'rotate 2s ease-in-out';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 2000);
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});