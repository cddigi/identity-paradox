# Deface Setup Guide

## Prerequisites

1. Python 3.6 or later
2. pip (Python package manager)

## Installation

1. Install deface:
   ```bash
   pip install deface
   ```

2. Start the deface server:
   ```bash
   python deface_server.py
   ```
   The server will run on http://localhost:8080

## Usage

1. Open `index.html` in your web browser
2. Select "Deface Mode" from the mode selector
3. Upload a video file
4. Configure settings:
   - **Anonymization Style**: Choose between Blur, Solid Black, or Mosaic
   - **Detection Sensitivity**: Adjust how sensitive face detection is (0.1-0.9)
   - **Downscale for Performance**: Optionally reduce resolution for faster processing
5. Click "Process Video" to anonymize faces
6. Click "Export Video" to download the processed video

## Features

- **Blur**: Applies gaussian blur to detected faces
- **Solid Black**: Covers faces with black rectangles
- **Mosaic**: Pixelates detected face regions

## Performance Tips

- Use downscaling for large videos to improve processing speed
- Lower detection sensitivity (e.g., 0.1) for faster but less accurate detection
- Higher sensitivity (e.g., 0.7) for more accurate face detection

## Hardware Acceleration (Optional)

For better performance, you can install hardware acceleration:

### NVIDIA GPU (CUDA)
```bash
pip install onnxruntime-gpu
```

### Windows (DirectML)
```bash
pip install onnxruntime-directml
```

### CPU Optimization (OpenVINO)
```bash
pip install onnxruntime-openvino
```

## Troubleshooting

If you get an error about the deface server:
1. Make sure you've installed deface: `pip install deface`
2. Check that the server is running: `python deface_server.py`
3. Verify it's accessible at http://localhost:8080

## Privacy Note

Unlike the Rotoscope and Laughing Man modes which process entirely in your browser, Deface mode sends video to a local Python server running on your computer. The video never leaves your machine, maintaining privacy.