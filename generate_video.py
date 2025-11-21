import os
from gtts import gTTS
from moviepy.editor import VideoFileClip, AudioFileClip, CompositeAudioClip, ImageClip, CompositeVideoClip
from PIL import Image, ImageDraw, ImageFont
import textwrap

def generate_narration(text, filename):
    tts = gTTS(text=text, lang='en')
    tts.save(filename)

def create_subtitle_image(text, fontsize=32, width=800, height=150):
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", fontsize)
    except IOError:
        font = ImageFont.load_default()

    lines = textwrap.wrap(text, width=45)
    
    # Calculate text height
    total_text_height = 0
    line_heights = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        h = bbox[3] - bbox[1]
        line_heights.append(h)
        total_text_height += h + 8
    
    # Draw Box
    box_width = width - 40
    box_height = total_text_height + 30
    box_x = 20
    box_y = (height - box_height) / 2
    
    draw.rectangle([box_x, box_y, box_x + box_width, box_y + box_height], fill=(0, 0, 0, 180), outline="white", width=2)
    
    # Draw Text
    current_y = box_y + 15
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        text_width = bbox[2] - bbox[0]
        x_text = (width - text_width) / 2
        draw.text((x_text, current_y), line, font=font, fill="white")
        current_y += line_heights[i] + 8

    return img

def process_video(video_path, output_path, script):
    if not os.path.exists(video_path):
        print(f"Video file {video_path} not found.")
        return

    video = VideoFileClip(video_path)
    audio_clips = []
    subtitle_clips = []
    
    for item in script:
        text = item['text']
        start_time = item['time']
        segment_file = f"temp_{start_time}.mp3"
        image_file = f"temp_sub_{start_time}.png"
        
        generate_narration(text, segment_file)
        audio_clip = AudioFileClip(segment_file).set_start(start_time)
        audio_clips.append(audio_clip)
        
        img = create_subtitle_image(text)
        img.save(image_file)
        
        sub_clip = ImageClip(image_file).set_start(start_time).set_duration(audio_clip.duration + 0.5).set_pos(('center', 0.80), relative=True)
        subtitle_clips.append(sub_clip)

    final_audio = CompositeAudioClip(audio_clips)
    final_video = video.set_audio(final_audio)
    final_video = CompositeVideoClip([final_video] + subtitle_clips)
    
    final_video.write_videofile(output_path, fps=24)

if __name__ == "__main__":
    # Adjusted timestamps to match Cypress flow better
    # Flow: Login(0-4s) -> Dashboard(4-6s) -> Appointments(6-10s) -> Doctors(10-14s) -> Records(14-18s) -> Logout(18s+)
    script = [
        {"time": 0, "text": "We begin by entering our credentials to log securely into the system."},
        {"time": 5, "text": "Welcome to the Dashboard. This is the central hub for all hospital activities."},
        {"time": 8, "text": "We can easily schedule and manage patient appointments here."},
        {"time": 12, "text": "Next, we can browse the directory of our specialist doctors."},
        {"time": 16, "text": "We also have instant access to detailed patient medical records."},
        {"time": 20, "text": "Finally, we securely logout of the system to protect patient data."}
    ]
    
    video_file = "frontend/cypress/videos/demo_flow.cy.js.mp4"
    process_video(video_file, "final_complete_demo.mp4", script)
