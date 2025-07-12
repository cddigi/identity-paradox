# IdentityParadox

> *"Who you are is not who you seem"*

A privacy-focused web application that transforms personal videos into anonymous art through three distinct modes: Rotoscope effects inspired by "A Scanner Darkly", Laughing Man overlays from Ghost in the Shell, and professional face anonymization using the deface library.

## 🎯 Features

### 🎨 Rotoscope Mode
- **Real-time artistic filters** with 5 style presets
- **Edge detection** using Sobel filters
- **Color posterization** with adjustable levels
- **Customizable effects** (line thickness, edge threshold)
- **Style presets**: Scanner Darkly, Comic Book, Film Noir, Neon Dreams, Watercolor

### 👻 Laughing Man Mode
- **Automatic face detection** using face-api.js
- **Dynamic logo overlay** with rotating text
- **5 preset quotes** plus custom text input
- **Smooth face tracking** with interpolation
- **Adjustable settings** (opacity, rotation speed)

### 🤖 Deface Mode
- **Neural network face detection** using CenterFace
- **Multiple anonymization styles** (blur, solid black, mosaic)
- **Adjustable detection sensitivity**
- **Performance optimization** with optional downscaling
- **Local processing** via Python server

### 🛡️ Privacy Features
- **Client-side processing** for Rotoscope/Laughing Man modes
- **Local server processing** for Deface mode (never leaves your machine)
- **No external API calls** - works offline
- **Metadata stripping** from exported videos
- **Local video export** using MediaRecorder API

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/identity-paradox.git
   cd identity-paradox
   ```

2. **For Deface mode (optional)**
   ```bash
   # Install deface
   pip install deface
   
   # Start the deface server
   python deface_server.py
   ```

3. **Open in browser**
   ```bash
   # Simply open index.html in any modern web browser
   open index.html
   ```

3. **Upload a video** and start processing!

## 💻 Usage

1. **Upload Video**: Click the upload button and select a video file
2. **Choose Mode**: Select Rotoscope, Laughing Man, or Deface mode
3. **Adjust Settings**: Use the controls to customize effects
4. **Process**: Click "Process Video" for real-time processing
5. **Export**: Click "Export Video" to save your creation

### Deface Mode
- Requires the deface server to be running (`python deface_server.py`)
- Offers professional-grade face anonymization
- Processes on local server for optimal performance

## 🛠️ Technical Details

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Video Processing**: Canvas API with real-time frame manipulation
- **Face Detection**: 
  - face-api.js (TensorFlow.js based) for Laughing Man mode
  - CenterFace neural network (via deface) for Deface mode
- **Export**: MediaRecorder API for WebM video output (Rotoscope/Laughing Man)
- **Export**: Direct MP4 download for Deface mode
- **Privacy**: All processing local (browser or local server)

## 🎨 Style Presets

### Rotoscope Mode
- **Scanner Darkly**: Classic rotoscope effect with edge detection
- **Comic Book**: High contrast with bold lines
- **Film Noir**: Black and white with dramatic shadows
- **Neon Dreams**: Vibrant colors with glowing effects
- **Watercolor**: Soft, artistic painting effect

### Laughing Man Mode
- **Original Quote**: "I thought what I'd do was..."
- **The Net**: "The net is vast and infinite"
- **Stand Alone Complex**: "A stand alone complex"
- **Custom Text**: Enter your own rotating message

## 🕹️ Easter Eggs

- **Konami Code**: ↑↑↓↓←→←→BA activates "Tachikoma Mode"
- **Console Quotes**: Philosophical messages from Ghost in the Shell
- **Loading Messages**: Existential questions about identity

## 🔧 Development

### File Structure
```
identity-paradox/
├── index.html          # Main application
├── style.css           # Cyberpunk styling
├── script.js           # Core functionality
├── deface_server.py    # Python server for deface mode
├── DEFACE_SETUP.md     # Deface installation guide
├── CLAUDE.md           # Claude Code instructions
├── IMPLEMENTATION_GUIDE.md # Detailed implementation
└── README.md           # This file
```

### Key Functions
- `processRotoscopeFrame()` - Real-time video processing
- `processLaughingManFrame()` - Face detection and logo overlay
- `detectEdges()` - Sobel edge detection algorithm
- `LaughingManLogo` - Dynamic logo rendering class

## 📱 Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may require HTTPS for some features)
- **Mobile**: Responsive design with touch support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Feel free to use for your creative projects!

## ⚠️ Disclaimer

This tool is for artistic and privacy purposes. Users are responsible for complying with local laws regarding face obscuration and video manipulation. The Laughing Man logo is inspired by Ghost in the Shell: Stand Alone Complex.

## 🎭 Philosophy

*"The self is an illusion created by our DNA and memories"*

IdentityParadox explores the paradox of digital identity in our surveillance age - the tension between being seen and being known, between public presence and private self. Through anonymization and artistic transformation, we question: who are you when your face is obscured, your voice is altered, your identity is fluid?

---

*The net is vast and infinite* 🌐