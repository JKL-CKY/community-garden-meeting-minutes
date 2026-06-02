from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import shutil
import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

from .models import Meeting, Discussion, PlantZone, MeetingMinutes
from .transcriber import AudioTranscriber
from .diarizer import SpeakerDiarizer
from .ai_processor import AIProcessor
from .email_sender import EmailSender

app = FastAPI(title="绿手指会议纪要系统", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("static/garden_photos", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")

transcriber = AudioTranscriber()
diarizer = SpeakerDiarizer()
ai_processor = AIProcessor()
email_sender = EmailSender()

meetings_db = {}
discussions_db = {}
minutes_db = {}


class MeetingCreate(BaseModel):
    title: str
    date: str
    location: str
    description: Optional[str] = None


class DiscussionCreate(BaseModel):
    meeting_id: str
    speaker: str
    content: str
    speaker_type: str


class GenerateMinutesRequest(BaseModel):
    meeting_id: str
    send_email: bool = False


@app.post("/api/meetings", response_model=Meeting)
async def create_meeting(meeting: MeetingCreate):
    meeting_id = str(uuid.uuid4())
    new_meeting = Meeting(
        id=meeting_id,
        title=meeting.title,
        date=meeting.date,
        location=meeting.location,
        description=meeting.description,
        created_at=datetime.now().isoformat()
    )
    meetings_db[meeting_id] = new_meeting
    return new_meeting


@app.get("/api/meetings", response_model=List[Meeting])
async def get_meetings():
    return list(meetings_db.values())


@app.get("/api/meetings/{meeting_id}", response_model=Meeting)
async def get_meeting(meeting_id: str):
    if meeting_id not in meetings_db:
        raise HTTPException(status_code=404, detail="会议不存在")
    return meetings_db[meeting_id]


@app.post("/api/meetings/{meeting_id}/upload-audio")
async def upload_audio(meeting_id: str, file: UploadFile = File(...)):
    if meeting_id not in meetings_db:
        raise HTTPException(status_code=404, detail="会议不存在")
    
    file_extension = os.path.splitext(file.filename)[1]
    audio_path = f"uploads/{meeting_id}{file_extension}"
    
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    transcription = transcriber.transcribe(audio_path)
    diarization = diarizer.diarize(audio_path)
    
    segments = []
    for seg in diarization:
        for trans_seg in transcription["segments"]:
            if abs(seg["start"] - trans_seg["start"]) < 1.0:
                segments.append({
                    "start": seg["start"],
                    "end": seg["end"],
                    "speaker": seg["speaker"],
                    "text": trans_seg["text"],
                    "speaker_type": "发起人" if seg["speaker"] == "SPEAKER_00" else "居民"
                })
    
    discussions_db[meeting_id] = []
    for seg in segments:
        discussion = DiscussionCreate(
            meeting_id=meeting_id,
            speaker=seg["speaker"],
            content=seg["text"],
            speaker_type=seg["speaker_type"]
        )
        discussions_db[meeting_id].append(Discussion(
            id=str(uuid.uuid4()),
            meeting_id=meeting_id,
            speaker=discussion.speaker,
            content=discussion.content,
            speaker_type=discussion.speaker_type,
            timestamp=seg["start"],
            created_at=datetime.now().isoformat()
        ))
    
    meetings_db[meeting_id].audio_processed = True
    meetings_db[meeting_id].transcription = transcription["text"]
    
    return {
        "transcription": transcription["text"],
        "discussions": discussions_db[meeting_id]
    }


@app.post("/api/discussions", response_model=Discussion)
async def create_discussion(discussion: DiscussionCreate):
    if discussion.meeting_id not in meetings_db:
        raise HTTPException(status_code=404, detail="会议不存在")
    
    discussion_id = str(uuid.uuid4())
    new_discussion = Discussion(
        id=discussion_id,
        meeting_id=discussion.meeting_id,
        speaker=discussion.speaker,
        content=discussion.content,
        speaker_type=discussion.speaker_type,
        created_at=datetime.now().isoformat()
    )
    
    if discussion.meeting_id not in discussions_db:
        discussions_db[discussion.meeting_id] = []
    discussions_db[discussion.meeting_id].append(new_discussion)
    
    return new_discussion


@app.get("/api/meetings/{meeting_id}/discussions", response_model=List[Discussion])
async def get_meeting_discussions(meeting_id: str):
    if meeting_id not in meetings_db:
        raise HTTPException(status_code=404, detail="会议不存在")
    return discussions_db.get(meeting_id, [])


@app.post("/api/minutes/generate", response_model=MeetingMinutes)
async def generate_minutes(request: GenerateMinutesRequest):
    meeting_id = request.meeting_id
    if meeting_id not in meetings_db:
        raise HTTPException(status_code=404, detail="会议不存在")
    
    meeting = meetings_db[meeting_id]
    discussions = discussions_db.get(meeting_id, [])
    
    plant_diagram = ai_processor.generate_plant_diagram(discussions)
    watering_schedule = ai_processor.generate_watering_schedule(discussions)
    budget = ai_processor.generate_budget(discussions)
    summary = ai_processor.generate_summary(meeting, discussions)
    
    minutes = MeetingMinutes(
        id=str(uuid.uuid4()),
        meeting_id=meeting_id,
        summary=summary,
        plant_diagram=plant_diagram,
        watering_schedule=watering_schedule,
        budget=budget,
        created_at=datetime.now().isoformat()
    )
    
    minutes_db[meeting_id] = minutes
    
    if request.send_email:
        markdown_content = minutes.to_markdown(meeting, discussions)
        email_sender.send_minutes_email(meeting, markdown_content)
    
    return minutes


@app.get("/api/minutes/{meeting_id}", response_model=Optional[MeetingMinutes])
async def get_minutes(meeting_id: str):
    return minutes_db.get(meeting_id)


@app.get("/api/garden/zones", response_model=List[PlantZone])
async def get_garden_zones():
    return [
        PlantZone(
            id="zone_1",
            name="阳光区",
            description="全日照区域，适合种植耐旱植物",
            plants=["玫瑰", "薰衣草", "迷迭香"],
            area=25.5,
            image_url="/static/garden_photos/sun_zone.jpg"
        ),
        PlantZone(
            id="zone_2",
            name="半阴区",
            description="部分遮阴区域，适合种植观叶植物",
            plants=["绿萝", "龟背竹", "蕨类"],
            area=18.0,
            image_url="/static/garden_photos/shade_zone.jpg"
        ),
        PlantZone(
            id="zone_3",
            name="蔬菜区",
            description="有机蔬菜种植区",
            plants=["番茄", "黄瓜", "生菜"],
            area=30.0,
            image_url="/static/garden_photos/vegetable_zone.jpg"
        )
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
