# IdentityParadox Implementation Guide

## Project Overview

Create a web-based application that transforms personal videos into anonymous art, featuring both rotoscoping effects (like "A Scanner Darkly") and a Laughing Man mode that automatically overlays the iconic Ghost in the Shell logo on detected faces. This tool explores the paradox of digital identity - being seen without being known.

## Features

### Core Modes

1. **Rotoscope Mode**
   - Real-time video processing with artistic filters
   - Multiple style presets (Scanner Darkly, Comic Book, Film Noir, Neon Dreams, Watercolor)
   - Adjustable edge detection, posterization, and line thickness

2. **Laughing Man Mode**
   - Automatic face detection and tracking
   - Iconic circular logo overlay with rotating text
   - Customizable quotes that orbit around faces
   - Original "I thought what I'd do was..." text option
   - Custom text input for personalized messages

### Privacy Features
- Client-side processing (no data leaves your device)
- Export processed frames/videos
- Metadata stripping
- Voice modulation options

## Prerequisites

- Modern web browser with HTML5 video support
- Basic understanding of video processing concepts
- (Optional) Node.js for advanced features

### Required Libraries

**For Rotoscope Mode:**
- No external dependencies (vanilla JavaScript)

**For Laughing Man Mode:**
- face-api.js for face detection
- Optional: TensorFlow.js for advanced face tracking

```html
<!-- Add to HTML head -->
<script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"></script>
```

## Step-by-Step Guide

### 1. Initial Setup

Start by creating the project structure:

```
rotoscope-anonymizer/
├── index.html
├── style.css
├── script.js
└── README.md
```

### 2. Core Implementation

Create the main HTML structure with video input, canvas output, and controls:

```html
<!-- Main structure -->
<div class="container">
    <h1>IdentityParadox</h1>
    <p class="tagline">Who you are is not who you seem</p>
    
    <!-- Mode Selection -->
    <div class="mode-selector">
        <button class="mode-btn active" data-mode="rotoscope">Rotoscope Mode</button>
        <button class="mode-btn" data-mode="laughing-man">Laughing Man Mode</button>
    </div>
    
    <div class="upload-section">
        <input type="file" id="videoInput" accept="video/*">
    </div>
    
    <div class="video-section">
        <video id="originalVideo" controls></video>
        <canvas id="outputCanvas"></canvas>
    </div>
    
    <!-- Rotoscope Controls -->
    <div class="controls rotoscope-controls">
        <!-- Sliders and style buttons -->
    </div>
    
    <!-- Laughing Man Controls -->
    <div class="controls laughing-man-controls" style="display: none;">
        <div class="control-group">
            <label>Quote Selection</label>
            <select id="quotePreset">
                <option value="default">I thought what I'd do was...</option>
                <option value="net">The net is vast and infinite</option>
                <option value="complex">A stand alone complex</option>
                <option value="custom">Custom Text</option>
            </select>
            <input type="text" id="customText" placeholder="Enter custom text">
        </div>
        <div class="control-group">
            <label>Logo Opacity</label>
            <input type="range" id="logoOpacity" min="0.5" max="1" step="0.1" value="0.9">
        </div>
    </div>
</div>
```

### 3. Video Processing Pipeline

Implement the core processing functions:

```javascript
// Edge detection using Sobel filter
function detectEdges(imageData) {
    const threshold = 30; // Adjustable
    // Apply Sobel operator for edge detection
    // Return edge map
}

// Color posterization
function posterize(data, levels) {
    const factor = 255 / (levels - 1);
    // Reduce color levels
}

// Apply style-specific color matrix
function applyColorMatrix(data, matrix) {
    // Transform colors based on style
}
```

### 4. Style Presets

Define artistic style configurations:

```javascript
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
    }
    // Additional styles...
};
```

### 5. Laughing Man Mode Implementation

#### Face Detection Setup

Use face-api.js or similar library for real-time face detection:

```javascript
// Load face detection model
async function loadFaceDetection() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
}

// Detect faces in video frame
async function detectFaces(video) {
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
}
```

#### Laughing Man Logo Renderer

Create the iconic circular logo with rotating text:

```javascript
class LaughingManLogo {
    constructor(text = "I thought what I'd do was, I'd pretend I was one of those deaf-mutes") {
        this.text = text;
        this.rotation = 0;
        this.logoImage = new Image();
        this.logoImage.src = 'laughing-man-logo.svg';
    }
    
    draw(ctx, x, y, radius) {
        ctx.save();
        ctx.translate(x, y);
        
        // Draw circular background
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0, 206, 209, 0.9)';
        ctx.fill();
        
        // Draw center logo
        const logoSize = radius * 0.6;
        ctx.drawImage(
            this.logoImage,
            -logoSize/2, -logoSize/2,
            logoSize, logoSize
        );
        
        // Draw rotating text
        this.drawRotatingText(ctx, radius * 0.8);
        
        ctx.restore();
        
        // Update rotation for next frame
        this.rotation += 0.02;
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
}
```

#### Integration with Video Processing

Combine face detection with logo overlay:

```javascript
const laughingManLogo = new LaughingManLogo();
let faceTracking = [];

async function processLaughingManMode() {
    if (originalVideo.paused || originalVideo.ended) return;
    
    // Detect faces
    const faces = await detectFaces(originalVideo);
    
    // Update face tracking (smooth transitions)
    faceTracking = smoothFaceTracking(faces, faceTracking);
    
    // Draw original video
    ctx.drawImage(originalVideo, 0, 0, canvas.width, canvas.height);
    
    // Overlay Laughing Man logo on each face
    faceTracking.forEach(face => {
        const centerX = face.x + face.width / 2;
        const centerY = face.y + face.height / 2;
        const radius = Math.max(face.width, face.height) * 0.7;
        
        laughingManLogo.draw(ctx, centerX, centerY, radius);
    });
    
    requestAnimationFrame(processLaughingManMode);
}

// Smooth face tracking to reduce jitter
function smoothFaceTracking(newFaces, oldTracking) {
    return newFaces.map(newFace => {
        // Find closest matching face from previous frame
        const match = findClosestFace(newFace, oldTracking);
        if (match) {
            // Smooth transition using interpolation
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

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}
```

#### Custom Text Options

Allow users to customize the rotating text:

```javascript
// Preset quotes
const laughingManQuotes = [
    "I thought what I'd do was, I'd pretend I was one of those deaf-mutes",
    "The net is vast and infinite",
    "A stand alone complex",
    "I'll be a catcher in the rye",
    "There's nothing sadder than a puppet without a ghost"
];

// UI for custom text
<div class="laughing-man-options">
    <select id="quotePreset">
        <option value="custom">Custom Text</option>
        <option value="0">Original Quote</option>
        <option value="1">The Net is Vast</option>
        <!-- More options -->
    </select>
    <input type="text" id="customText" placeholder="Enter custom rotating text">
</div>
```

### 6. Real-time Processing

Set up frame-by-frame processing:

```javascript
function processFrame() {
    if (video.paused || video.ended) return;
    
    // Draw current frame
    ctx.drawImage(video, 0, 0);
    
    // Apply effects
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const edges = detectEdges(imageData);
    posterize(imageData.data, posterizationLevel);
    applyColorMatrix(imageData.data, currentStyle.colorMatrix);
    combineEdges(imageData.data, edges);
    
    // Update canvas
    ctx.putImageData(imageData, 0, 0);
    
    requestAnimationFrame(processFrame);
}
```

### 6. Advanced Features

#### Vision LLM Integration

For enhanced anonymization using AI:

```javascript
// Pseudo-code for vision model integration
async function enhancedAnonymization(frame) {
    // Send frame to vision API
    const analysis = await visionAPI.analyze(frame, {
        detectFaces: true,
        detectObjects: true,
        segmentPeople: true
    });
    
    // Apply stronger effects to identified regions
    analysis.faces.forEach(face => {
        applyExtraBlur(frame, face.bounds);
    });
    
    return frame;
}
```

#### Video Export

Implement video recording:

### Creating the Laughing Man Logo

Create an SVG file for the logo or generate it dynamically:

```javascript
function createLaughingManSVG() {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <!-- Outer circle -->
        <circle cx="100" cy="100" r="90" fill="none" stroke="#00CED1" stroke-width="3"/>
        
        <!-- Inner design -->
        <g transform="translate(100, 100)">
            <!-- Smiling face -->
            <circle cx="0" cy="-10" r="40" fill="#00CED1"/>
            <circle cx="-15" cy="-20" r="5" fill="#1a1a1a"/>
            <circle cx="15" cy="-20" r="5" fill="#1a1a1a"/>
            <path d="M -20 -5 Q 0 5 20 -5" stroke="#1a1a1a" stroke-width="3" fill="none"/>
            
            <!-- Hat -->
            <rect x="-30" y="-50" width="60" height="10" fill="#FF6B35"/>
            <rect x="-20" y="-60" width="40" height="15" fill="#FF6B35"/>
        </g>
    </svg>`;
    
    return 'data:image/svg+xml;base64,' + btoa(svg);
}
```

### Video Export

Implement video recording for both modes:

```javascript
const mediaRecorder = new MediaRecorder(canvas.captureStream(30), {
    mimeType: 'video/webm'
});

const chunks = [];
mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    downloadVideo(blob);
};
```

## Mode Switching Logic

```javascript
let currentMode = 'rotoscope';

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentMode = btn.dataset.mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show/hide appropriate controls
        if (currentMode === 'laughing-man') {
            document.querySelector('.rotoscope-controls').style.display = 'none';
            document.querySelector('.laughing-man-controls').style.display = 'block';
            initializeFaceDetection();
        } else {
            document.querySelector('.rotoscope-controls').style.display = 'block';
            document.querySelector('.laughing-man-controls').style.display = 'none';
        }
    });
});

// Main processing dispatcher
function startProcessing() {
    if (currentMode === 'laughing-man') {
        processLaughingManMode();
    } else {
        processRotoscopeMode();
    }
}
```

### 7. Privacy Enhancements

Add additional anonymization features:

```javascript
// Voice modulation
const audioContext = new AudioContext();
const pitchShift = audioContext.createBiquadFilter();
pitchShift.type = 'allpass';
pitchShift.frequency.value = 1000;

// Metadata removal
function stripMetadata(videoBlob) {
    // Remove EXIF and other identifying data
}

// Background blur
function blurBackground(frame, segmentation) {
    // Apply gaussian blur to non-person regions
}
```

## Testing Instructions

1. **Rotoscope Mode Testing**
   - Load a test video with clear human subjects
   - Try each style preset and verify anonymization
   - Test export functionality
   - Verify no metadata leaks in output

2. **Laughing Man Mode Testing**
   - Test with videos containing multiple faces
   - Verify face tracking smoothness
   - Test custom text rotation
   - Check logo sizing on different face sizes
   - Ensure logos track faces during movement

## Deployment Options

### Static Hosting
- GitHub Pages
- Netlify/Vercel
- AWS S3 + CloudFront

### Server-side Processing
For longer videos or advanced features:

```bash
# Python backend with OpenCV
pip install opencv-python flask

# FFmpeg integration
ffmpeg -i input.mp4 -vf "edgedetect=low=0.1:high=0.4" output.mp4
```

## Performance Optimization

- Use Web Workers for processing
- Implement frame skipping for real-time preview
- Cache processed frames
- Use WebGL for GPU acceleration

### Laughing Man Mode Specific:
- Cache face detection results between similar frames
- Use smaller face detection models for real-time performance
- Implement face tracking to avoid re-detection every frame
- Pre-render logo at different sizes

## Future Enhancements

1. **AI-Powered Features**
   - Automatic scene detection
   - Intelligent style selection
   - Motion tracking for temporal coherence

2. **Additional Styles**
   - Anime/manga style
   - Oil painting effect
   - Pixel art transformation

3. **Batch Processing**
   - Multiple video support
   - Command-line interface
   - Cloud processing pipeline

4. **Laughing Man Enhancements**
   - Multiple logo styles (different hackers from the series)
   - AR mode for real-time camera feed
   - Network-connected mode for synchronized "stand alone complex" events

## Easter Eggs & Philosophy

### Hidden Features
- Konami code (↑↑↓↓←→←→BA) activates "Tachikoma Mode" with playful sound effects
- Console logs philosophical quotes from Ghost in the Shell
- Hidden Salinger references in code comments
- Type "ghost" in the custom text field for secret messages

### Loading Messages
```javascript
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
```

### About Page Philosophy
Include quotes that explore identity themes:
- "The self is an illusion created by our DNA and memories"
- "If everyone is anonymous, no one is"
- "Your face is just another interface"

## Common Issues & Solutions

### Issue: Flickering between frames
**Solution**: Implement temporal smoothing
```javascript
function temporalSmooth(currentFrame, previousFrame, alpha = 0.7) {
    // Blend current with previous frame
}
```

### Issue: Performance on long videos
**Solution**: Process in chunks
```javascript
async function processVideoChunks(video, chunkSize = 100) {
    // Process video in manageable segments
}
```

### Issue: Face still recognizable
**Solution**: Add face-specific distortion
```javascript
function distortFaces(frame, faceRegions) {
    // Apply swirl or pixelation to face areas
}
```

## Resources

- [Web Video Processing Guide](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [WebCodecs API](https://developer.chrome.com/articles/webcodecs/)
- [OpenCV.js Documentation](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html)
- [face-api.js Documentation](https://github.com/justadudewhohacks/face-api.js)
- [A Scanner Darkly Technique Analysis](https://en.wikipedia.org/wiki/Rotoscoping)
- [The Laughing Man - Ghost in the Shell Wiki](https://ghostintheshell.fandom.com/wiki/Laughing_Man)

## License

MIT License - Feel free to modify and use for your creative projects!

## Disclaimer

This tool is for artistic and privacy purposes. Users are responsible for complying with local laws regarding face obscuration and video manipulation. The Laughing Man logo is inspired by Ghost in the Shell: Stand Alone Complex.