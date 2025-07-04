# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IdentityParadox is a privacy-focused web application that transforms personal videos into anonymous art through two main modes:
- **Rotoscope Mode**: Applies artistic filters inspired by "A Scanner Darkly"
- **Laughing Man Mode**: Overlays Ghost in the Shell-inspired logos on detected faces

All processing happens client-side for privacy.

## Development Commands

Since this is a pure frontend project with vanilla JavaScript:
- **Run**: Open `index.html` in a web browser
- **Test**: Manual testing with video files as described in implementation docs
- **Lint**: No linting configured (vanilla JS project)
- **Deploy**: Static file hosting (GitHub Pages, Netlify, Vercel)

## Project Architecture

### File Structure
```
rotoscope-anonymizer/
├── index.html        # Main entry point with UI structure
├── style.css         # Application styling
├── script.js         # Core processing logic
├── models/          # Face detection models (for Laughing Man mode)
└── assets/          # SVG logos and other assets
```

### Key Components

1. **Video Processing Pipeline**
   - Canvas-based frame extraction
   - Real-time image processing using ImageData API
   - requestAnimationFrame for smooth playback

2. **Rotoscope Mode Architecture**
   - Edge detection (Sobel filter implementation)
   - Color posterization algorithm
   - Style presets with configurable parameters
   - No external dependencies

3. **Laughing Man Mode Architecture**
   - face-api.js integration for face detection
   - Custom LaughingManLogo class for rendering
   - Face tracking with smoothing to reduce jitter
   - Dynamic text rotation around detected faces

4. **Privacy-First Design**
   - All processing happens client-side
   - No server communication
   - MediaRecorder API for local video export
   - Metadata stripping functionality

### Core Processing Flow
1. User uploads video → FileReader API
2. Video element loads → Canvas captures frames
3. Mode-specific processing:
   - Rotoscope: Edge detection → Posterization → Style matrix
   - Laughing Man: Face detection → Logo overlay → Text rotation
4. Processed frames displayed on output canvas
5. Optional export using MediaRecorder

### Key Functions
- `processFrame()` - Main processing loop
- `detectEdges()` - Sobel edge detection
- `posterize()` - Color reduction
- `processLaughingManMode()` - Face tracking and logo overlay
- `smoothFaceTracking()` - Interpolation for smooth transitions

### External Dependencies
- **face-api.js** (0.22.2) - Only for Laughing Man mode
- Loaded via CDN: `https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js`

### Performance Considerations
- Use smaller face detection models for real-time performance
- Implement frame skipping for slower devices
- Consider Web Workers for heavy processing
- Cache face detection results between similar frames