import os
import json
import requests
from gtts import gTTS
from moviepy.editor import VideoFileClip, AudioFileClip, CompositeAudioClip, ImageClip, CompositeVideoClip, concatenate_videoclips, ColorClip
from PIL import Image, ImageDraw, ImageFont
import textwrap
import numpy as np

# Configuration
ELEVENLABS_API_KEY = "sk_bdaa4e3c86673d5758630e65e4e26eff37f18607a27e0416".strip()
VOICE_ID = "OaQfGOEvUip9NEh44CYG".strip()
TIMELINE_FILE = "frontend/cypress/logs/timeline.json"
VIDEO_FILE = "frontend/cypress/videos/demo_flow.cy.js.mp4"
OUTPUT_FILE = "final_pro_demo.mp4"
SRT_FILE = "subtitles.srt"

def generate_audio_elevenlabs(text, filename):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.5
        }
    }
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            with open(filename, 'wb') as f:
                f.write(response.content)
            return True
        else:
            print(f"ElevenLabs Error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"ElevenLabs Exception: {e}")
        return False

def generate_audio_gtts(text, filename):
    print(f"Fallback to gTTS for: {text[:20]}...")
    tts = gTTS(text=text, lang='en')
    tts.save(filename)
    return True

def create_subtitle_image(text, fontsize=32, width=800, height=150):
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", fontsize)
    except IOError:
        font = ImageFont.load_default()

    lines = textwrap.wrap(text, width=45)
    
    total_text_height = 0
    line_heights = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        h = bbox[3] - bbox[1]
        line_heights.append(h)
        total_text_height += h + 8
    
    box_width = width - 40
    box_height = total_text_height + 30
    box_x = 20
    box_y = (height - box_height) / 2
    
    draw.rectangle([box_x, box_y, box_x + box_width, box_y + box_height], fill=(0, 0, 0, 180), outline="white", width=2)
    
    current_y = box_y + 15
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x_text = (width - text_width) / 2
        draw.text((x_text, current_y), line, font=font, fill="white")
        current_y += line_heights[i] + 8

    return img

def create_click_overlay(clicks, duration, video_width, video_height):
    """Creates a transparent video clip with click animations"""
    clips = []
    
    # Pre-generate animation frames to avoid runtime make_frame issues
    # Animation duration 0.6s at 24fps = ~15 frames
    anim_duration = 0.6
    minutes %= 60
    seconds %= 60
    return f"{hours:02}:{minutes:02}:{seconds:02},{millis:03}"

def format_time_srt(seconds):
    millis = int((seconds - int(seconds)) * 1000)
    seconds = int(seconds)
    minutes = seconds // 60
    hours = minutes // 60
    minutes %= 60
    seconds %= 60
    return f"{hours:02}:{minutes:02}:{seconds:02},{millis:03}"

def generate_srt(final_timeline):
    with open(SRT_FILE, 'w', encoding='utf-8') as f:
        for i, item in enumerate(final_timeline):
            start_time = item['start']
            end_time = item['end']
            text = item['text']
            
            f.write(f"{i+1}\n")
            f.write(f"{format_time_srt(start_time)} --> {format_time_srt(end_time)}\n")
            f.write(f"{text}\n\n")
    print(f"Generated {SRT_FILE}")

def process_video():
    if not os.path.exists(TIMELINE_FILE):
        print(f"Timeline file {TIMELINE_FILE} not found.")
        return

    with open(TIMELINE_FILE, 'r') as f:
        data = json.load(f)
        timeline = data.get('steps', [])
        clicks = data.get('clicks', [])

    if not os.path.exists(VIDEO_FILE):
        print(f"Video file {VIDEO_FILE} not found.")
        return

    original_video = VideoFileClip(VIDEO_FILE)
    final_clips = []
    current_video_time = 0
    final_timeline_data = []
    accumulated_time = 0

    print(f"Processing {len(timeline)} steps...")

    for i, item in enumerate(timeline):
        text = item['text']
        step_start_time = item['start']
        
        # Determine segment end time (next step start or video end)
        if i < len(timeline) - 1:
            step_end_time = timeline[i+1]['start']
        else:
            step_end_time = original_video.duration

        # Slice video segment
        # Ensure we don't go beyond video duration
        if step_start_time >= original_video.duration:
            print(f"Warning: Step start {step_start_time} is beyond video duration {original_video.duration}")
            break
            
        segment_end = min(step_end_time, original_video.duration)
        video_segment = original_video.subclip(step_start_time, segment_end)
        
        # Generate Audio
        audio_file = f"temp_eleven_{i}.mp3"
        if not os.path.exists(audio_file):
            print(f"Generating audio for segment {i}...")
            if not generate_audio_elevenlabs(text, audio_file):
                generate_audio_gtts(text, audio_file)
        
        audio_clip = AudioFileClip(audio_file)
        audio_duration = audio_clip.duration
        video_duration = video_segment.duration
        
        # Synchronization Logic
        if audio_duration > video_duration:
            # Freeze the last frame to extend video
            freeze_duration = audio_duration - video_duration
            # Create a freeze frame clip
            last_frame = video_segment.to_ImageClip(t=video_duration - 0.01).set_duration(freeze_duration)
            final_segment = concatenate_videoclips([video_segment, last_frame])
        else:
            # Audio fits in video, just use video segment (maybe slightly longer, which is fine)
            final_segment = video_segment
            
        # Set audio to the segment
        final_segment = final_segment.set_audio(audio_clip)
        
        # Add Subtitles
        subtitle_img_file = f"temp_sub_{i}.png"
        img = create_subtitle_image(text)
        img.save(subtitle_img_file)
        subtitle_clip = ImageClip(subtitle_img_file).set_duration(final_segment.duration).set_pos(('center', 0.80), relative=True)
            
        # Composite segment
        final_segment_composite = CompositeVideoClip([final_segment, subtitle_clip])
        final_clips.append(final_segment_composite)
        
        # Record for SRT
        final_timeline_data.append({
            'start': accumulated_time,
            'end': accumulated_time + final_segment_composite.duration,
            'text': text
        })
        accumulated_time += final_segment_composite.duration

    # Concatenate all segments
    print("Concatenating segments...")
    final_video = concatenate_videoclips(final_clips)
    
    # Write output
    final_video.write_videofile(OUTPUT_FILE, fps=24)
    
    # Generate SRT
    generate_srt(final_timeline_data)
    print(f"Done! Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    process_video()
