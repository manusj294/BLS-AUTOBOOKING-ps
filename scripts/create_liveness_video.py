#!/usr/bin/env python3
"""
BLS Liveness Video Generator
Creates realistic animated liveness videos from ID photos for webcam verification
"""

import cv2
import numpy as np
import mediapipe as mp
import sys
import os
from pathlib import Path
import random
import math

def create_liveness_video(id_photo_path, output_video_path):
    """
    Generate an animated liveness video from an ID photo
    
    Args:
        id_photo_path (str): Path to the input ID photo
        output_video_path (str): Path for the output video file
    """
    
    Generate an animated liveness video from a static ID photo
    
    Args:
        id_photo_path (str): Path to the ID photo
        video_output_path (str): Path where the output video will be saved
    """
    try:
        print(f"🎬 Starting liveness video generation...")
        print(f"Input photo: {id_photo_path}")
        print(f"Output video: {output_video_path}")
        
        # Verify input file exists
        if not os.path.exists(id_photo_path):
            raise FileNotFoundError(f"ID photo not found: {id_photo_path}")
        
        # Initialize MediaPipe Face Detection
        mp_face_detection = mp.solutions.face_detection
        mp_drawing = mp.solutions.drawing_utils
        
        # Load the ID photo
        image = cv2.imread(id_photo_path)
        if image is None:
            raise ValueError(f"Could not load image: {id_photo_path}")
        
        height, width = image.shape[:2]
        print(f"📸 Image dimensions: {width}x{height}")
        
        # Detect face in the image
        with mp_face_detection.FaceDetection(model_selection=0, min_detection_confidence=0.5) as face_detection:
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = face_detection.process(rgb_image)
            
            if not results.detections:
                print("⚠️  No face detected, using full image")
                face_bbox = None
            else:
                # Get the first detected face
                detection = results.detections[0]
                bbox = detection.location_data.relative_bounding_box
                
                # Convert to pixel coordinates
                x = int(bbox.xmin * width)
                y = int(bbox.ymin * height)
                w = int(bbox.width * width)
                h = int(bbox.height * height)
                
                face_bbox = (x, y, w, h)
                print(f"👤 Face detected at: {face_bbox}")
        
        # Video settings
        fps = 30
        duration = 5  # seconds
        total_frames = fps * duration
        
        # Create video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_video_path, fourcc, fps, (width, height))
        
        print(f"🎥 Generating {total_frames} frames at {fps} FPS...")
        
        # Generate frames with realistic animations
        for frame_num in range(total_frames):
            # Create a copy of the original image
            frame = image.copy()
            
            # Calculate animation progress (0 to 1)
            progress = frame_num / total_frames
            
            # Add subtle head movement (simulated by slight image translation)
            if face_bbox:
                # Subtle horizontal movement
                offset_x = int(3 * math.sin(progress * 4 * math.pi))  # ±3 pixels
                offset_y = int(2 * math.sin(progress * 6 * math.pi))  # ±2 pixels
                
                # Apply translation
                M = np.float32([[1, 0, offset_x], [0, 1, offset_y]])
                frame = cv2.warpAffine(frame, M, (width, height))
            
            # Add subtle lighting variations
            brightness_factor = 1.0 + 0.05 * math.sin(progress * 2 * math.pi)
            frame = cv2.convertScaleAbs(frame, alpha=brightness_factor, beta=0)
            
            # Add very subtle blinking effect (darkening eye region briefly)
            if face_bbox and frame_num % 90 == 0:  # Blink every 3 seconds
                x, y, w, h = face_bbox
                eye_region = frame[y:y+int(h*0.4), x:x+w]  # Upper part of face
                eye_region = cv2.convertScaleAbs(eye_region, alpha=0.8, beta=0)
                frame[y:y+int(h*0.4), x:x+w] = eye_region
            
            # Add minimal camera noise for realism
            noise = np.random.normal(0, 1, frame.shape).astype(np.uint8)
            frame = cv2.add(frame, noise)
            
            # Write frame to video
            out.write(frame)
            
            # Progress indicator
            if frame_num % 30 == 0:
                percent = (frame_num / total_frames) * 100
                print(f"📊 Progress: {percent:.1f}%")
    
        # Release video writer
        out.release()
        
        print(f"✅ Liveness video created successfully!")
        print(f"📁 Output file: {output_video_path}")
        print(f"📊 Video stats: {duration}s, {fps} FPS, {total_frames} frames")
        
        return output_video_path

    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

def main():
    """Main function for command line usage"""
    if len(sys.argv) != 3:
        print("Usage: python create_liveness_video.py <id_photo_path> <output_video_path>")
        sys.exit(1)
    
    id_photo_path = sys.argv[1]
    output_video_path = sys.argv[2]
    
    try:
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_video_path), exist_ok=True)
        
        # Generate the liveness video
        result_path = create_liveness_video(id_photo_path, output_video_path)
        
        print(f"SUCCESS: Liveness video generated at {result_path}")
        
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
