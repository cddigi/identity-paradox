#!/usr/bin/env python3
"""
Deface Server - Backend for IdentityParadox video anonymization
Provides HTTP API for face anonymization using the deface library
"""

import os
import sys
import json
import logging
import tempfile
import shutil
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import subprocess
from typing import Optional, Dict, Any

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DefaceHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/anonymize':
            self.handle_anonymize()
        else:
            self.send_error(404, "Not Found")

    def handle_anonymize(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse multipart form data
            boundary = self.headers['Content-Type'].split('boundary=')[1]
            parts = post_data.split(f'--{boundary}'.encode())
            
            video_data = None
            options = {
                'mode': 'blur',
                'threshold': 0.3,
                'scale': None
            }
            
            for part in parts:
                if b'name="video"' in part:
                    # Extract video data
                    video_data = part.split(b'\r\n\r\n', 1)[1].rsplit(b'\r\n', 1)[0]
                elif b'name="mode"' in part:
                    mode = part.split(b'\r\n\r\n', 1)[1].rsplit(b'\r\n', 1)[0].decode()
                    if mode in ['blur', 'solid', 'mosaic']:
                        options['mode'] = mode
                elif b'name="threshold"' in part:
                    thresh = float(part.split(b'\r\n\r\n', 1)[1].rsplit(b'\r\n', 1)[0].decode())
                    options['threshold'] = thresh
                elif b'name="scale"' in part:
                    scale = part.split(b'\r\n\r\n', 1)[1].rsplit(b'\r\n', 1)[0].decode()
                    if scale:
                        options['scale'] = scale
            
            if not video_data:
                self.send_error(400, "No video data provided")
                return
            
            # Process video with deface
            result = self.process_video(video_data, options)
            
            if result['success']:
                # Send anonymized video back
                self.send_response(200)
                self.send_header('Content-Type', 'video/mp4')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                with open(result['output_path'], 'rb') as f:
                    self.wfile.write(f.read())
                
                # Cleanup
                os.unlink(result['output_path'])
            else:
                self.send_error(500, result['error'])
                
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            self.send_error(500, str(e))

    def process_video(self, video_data: bytes, options: Dict[str, Any]) -> Dict[str, Any]:
        """Process video using deface CLI"""
        try:
            # Create temporary files
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_input:
                tmp_input.write(video_data)
                input_path = tmp_input.name
            
            output_path = input_path.replace('.mp4', '_anonymized.mp4')
            
            # Build deface command
            cmd = ['deface', input_path, '-o', output_path]
            
            # Add options
            cmd.extend(['--replacewith', options['mode']])
            cmd.extend(['--thresh', str(options['threshold'])])
            
            if options['scale']:
                cmd.extend(['--scale', options['scale']])
            
            # Execute deface
            logger.info(f"Running deface: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0 and os.path.exists(output_path):
                return {
                    'success': True,
                    'output_path': output_path
                }
            else:
                error = result.stderr or "Deface processing failed"
                logger.error(f"Deface error: {error}")
                return {
                    'success': False,
                    'error': error
                }
        
        except Exception as e:
            logger.error(f"Processing error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
        finally:
            # Cleanup input file
            if 'input_path' in locals() and os.path.exists(input_path):
                os.unlink(input_path)

def check_deface_installed():
    """Check if deface is installed"""
    try:
        result = subprocess.run(['deface', '--version'], capture_output=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def main():
    if not check_deface_installed():
        print("Error: deface is not installed.")
        print("Install it with: pip install deface")
        sys.exit(1)
    
    port = 8080
    server_address = ('', port)
    httpd = HTTPServer(server_address, DefaceHandler)
    
    print(f"Deface server running on http://localhost:{port}")
    print("Ready to process videos...")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.shutdown()

if __name__ == '__main__':
    main()