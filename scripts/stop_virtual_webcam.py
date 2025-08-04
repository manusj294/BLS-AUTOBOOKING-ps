#!/usr/bin/env python3
"""
Virtual Webcam Stopper
Stops all running virtual webcam processes
"""

import subprocess
import sys
import platform
import signal
import os

def stop_virtual_webcam():
    """Stop all virtual webcam processes"""
    
    print("🛑 Stopping virtual webcam processes...")
    
    system = platform.system().lower()
    stopped_processes = 0
    
    try:
        if system in ["linux", "darwin"]:  # Linux and macOS
            # Find and kill ffmpeg processes streaming to virtual cameras
            try:
                # Find ffmpeg processes
                result = subprocess.run(
                    ["pgrep", "-f", "ffmpeg.*v4l2"],
                    capture_output=True,
                    text=True
                )
                
                if result.returncode == 0:
                    pids = result.stdout.strip().split('\n')
                    for pid in pids:
                        if pid:
                            try:
                                os.kill(int(pid), signal.SIGTERM)
                                print(f"✅ Stopped process PID: {pid}")
                                stopped_processes += 1
                            except ProcessLookupError:
                                print(f"⚠️  Process {pid} already stopped")
                            except Exception as e:
                                print(f"❌ Error stopping process {pid}: {e}")
                
                # Also try to find any ffmpeg processes
                result = subprocess.run(
                    ["pgrep", "-f", "ffmpeg"],
                    capture_output=True,
                    text=True
                )
                
                if result.returncode == 0:
                    pids = result.stdout.strip().split('\n')
                    for pid in pids:
                        if pid:
                            try:
                                # Check if this is our virtual webcam process
                                cmd_result = subprocess.run(
                                    ["ps", "-p", pid, "-o", "command="],
                                    capture_output=True,
                                    text=True
                                )
                                
                                if "stream_loop" in cmd_result.stdout or "v4l2" in cmd_result.stdout:
                                    os.kill(int(pid), signal.SIGTERM)
                                    print(f"✅ Stopped virtual webcam process PID: {pid}")
                                    stopped_processes += 1
                                    
                            except ProcessLookupError:
                                pass
                            except Exception as e:
                                print(f"❌ Error checking process {pid}: {e}")
                                
            except subprocess.CalledProcessError:
                print("ℹ️  No ffmpeg processes found")
                
        elif system == "windows":
            # Windows process termination
            try:
                # Kill ffmpeg processes
                subprocess.run(
                    ["taskkill", "/F", "/IM", "ffmpeg.exe"],
                    capture_output=True
                )
                print("✅ Stopped Windows ffmpeg processes")
                stopped_processes += 1
            except subprocess.CalledProcessError:
                print("ℹ️  No ffmpeg processes found on Windows")
        
        # Additional cleanup for v4l2loopback on Linux
        if system == "linux":
            try:
                # Check if we can unload the module (optional)
                subprocess.run(
                    ["sudo", "modprobe", "-r", "v4l2loopback"],
                    capture_output=True
                )
                print("✅ Unloaded v4l2loopback module")
            except subprocess.CalledProcessError:
                print("ℹ️  v4l2loopback module still in use or not loaded")
        
        if stopped_processes > 0:
            print(f"✅ Successfully stopped {stopped_processes} virtual webcam process(es)")
        else:
            print("ℹ️  No virtual webcam processes were running")
            
    except Exception as e:
        print(f"❌ Error stopping virtual webcam: {str(e)}")
        raise

def main():
    """Main function for command line usage"""
    try:
        stop_virtual_webcam()
        print("SUCCESS: Virtual webcam stopped")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
