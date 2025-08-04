#!/usr/bin/env python3
"""
Virtual Webcam Starter
Streams the generated liveness video to a virtual webcam device
"""

import cv2
import sys
import os
import time
import subprocess
import platform
from pathlib import Path

def start_virtual_webcam(video_path):
    """
    Start virtual webcam with the provided video
    
    Args:
        video_path (str): Path to the video file to stream
    """
    
    print(f"📹 Starting virtual webcam...")
    print(f"Video source: {video_path}")
    
    # Verify video file exists
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")
    
    # Detect operating system and set up virtual camera
    system = platform.system().lower()
    print(f"🖥️  Operating system: {system}")
    
    if system == "linux":
        return start_linux_virtual_webcam(video_path)
    elif system == "darwin":  # macOS
        return start_macos_virtual_webcam(video_path)
    elif system == "windows":
        return start_windows_virtual_webcam(video_path)
    else:
        raise OSError(f"Unsupported operating system: {system}")

def start_linux_virtual_webcam(video_path):
    """Start virtual webcam on Linux using v4l2loopback"""
    
    print("🐧 Setting up Linux virtual webcam (v4l2loopback)...")
    
    # Check if v4l2loopback is available
    try:
        subprocess.run(["modinfo", "v4l2loopback"], check=True, capture_output=True)
        print("✅ v4l2loopback module found")
    except subprocess.CalledProcessError:
        print("❌ v4l2loopback not found. Please install: sudo apt install v4l2loopback-dkms")
        raise RuntimeError("v4l2loopback module not available")
    
    # Load v4l2loopback module if not already loaded
    try:
        subprocess.run(["sudo", "modprobe", "v4l2loopback"], check=True)
        print("✅ v4l2loopback module loaded")
    except subprocess.CalledProcessError as e:
        print(f"⚠️  Could not load v4l2loopback: {e}")
    
    # Find virtual camera device
    virtual_device = "/dev/video2"  # Common virtual camera device
    if not os.path.exists(virtual_device):
        virtual_device = "/dev/video1"
    if not os.path.exists(virtual_device):
        virtual_device = "/dev/video0"
    
    print(f"📷 Using virtual camera device: {virtual_device}")
    
    # Start streaming with ffmpeg
    ffmpeg_cmd = [
        "ffmpeg",
        "-re",  # Read input at native frame rate
        "-stream_loop", "-1",  # Loop infinitely
        "-i", video_path,
        "-vcodec", "rawvideo",
        "-pix_fmt", "yuv420p",
        "-f", "v4l2",
        virtual_device
    ]
    
    print(f"🚀 Starting ffmpeg stream: {' '.join(ffmpeg_cmd)}")
    
    # Start ffmpeg process
    process = subprocess.Popen(
        ffmpeg_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    print(f"✅ Virtual webcam started with PID: {process.pid}")
    print(f"📺 Streaming {video_path} to {virtual_device}")
    
    return process

def start_macos_virtual_webcam(video_path):
    """Start virtual webcam on macOS"""
    
    print("🍎 Setting up macOS virtual webcam...")
    
    # Check if ffmpeg is available
    try:
        subprocess.run(["ffmpeg", "-version"], check=True, capture_output=True)
        print("✅ ffmpeg found")
    except subprocess.CalledProcessError:
        print("❌ ffmpeg not found. Please install: brew install ffmpeg")
        raise RuntimeError("ffmpeg not available")
    
    # For macOS, we'll use a different approach with AVFoundation
    # This is a simplified version - in production, you might want to use
    # specialized tools like OBS Virtual Camera or CamTwist
    
    print("⚠️  macOS virtual webcam requires additional setup")
    print("💡 Consider using OBS Virtual Camera or CamTwist for better compatibility")
    
    # Basic ffmpeg streaming (may not work with all applications)
    ffmpeg_cmd = [
        "ffmpeg",
        "-re",
        "-stream_loop", "-1",
        "-i", video_path,
        "-vcodec", "libx264",
        "-pix_fmt", "yuv420p",
        "-f", "avfoundation",
        "-"
    ]
    
    process = subprocess.Popen(
        ffmpeg_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    print(f"✅ Virtual webcam process started with PID: {process.pid}")
    return process

def start_windows_virtual_webcam(video_path):
    """Start virtual webcam on Windows"""
    
    print("🪟 Setting up Windows virtual webcam...")
    
    # Check if ffmpeg is available
    try:
        subprocess.run(["ffmpeg", "-version"], check=True, capture_output=True)
        print("✅ ffmpeg found")
    except subprocess.CalledProcessError:
        print("❌ ffmpeg not found. Please install ffmpeg")
        raise RuntimeError("ffmpeg not available")
    
    print("⚠️  Windows virtual webcam requires additional software")
    print("💡 Consider using OBS Virtual Camera or ManyCam for better compatibility")
    
    # Basic approach using DirectShow (requires additional virtual camera software)
    ffmpeg_cmd = [
        "ffmpeg",
        "-re",
        "-stream_loop", "-1",
        "-i", video_path,
        "-vcodec", "libx264",
        "-pix_fmt", "yuv420p",
        "-f", "dshow",
        "-"
    ]
    
    process = subprocess.Popen(
        ffmpeg_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    print(f"✅ Virtual webcam process started with PID: {process.pid}")
    return process

def main():
    """Main function for command line usage"""
    if len(sys.argv) != 2:
        print("Usage: python start_virtual_webcam.py <video_path>")
        sys.exit(1)
    
    video_path = sys.argv[1]
    
    try:
        process = start_virtual_webcam(video_path)
        
        print("🎥 Virtual webcam is now active!")
        print("📱 You can now use it in video calls and applications")
        print("🛑 Press Ctrl+C to stop the virtual webcam")
        
        # Keep the script running
        try:
            process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping virtual webcam...")
            process.terminate()
            process.wait()
            print("✅ Virtual webcam stopped")
            
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
