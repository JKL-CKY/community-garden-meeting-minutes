from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class PlantZone(BaseModel):
    id: str
    name: str
    description: str
    plants: List[str]
    area: float
    image_url: str


class Meeting(BaseModel):
    id: str
    title: str
    date: str
    location: str
    description: Optional[str] = None
    audio_processed: bool = False
    transcription: Optional[str] = None
    created_at: str


class Discussion(BaseModel):
    id: str
    meeting_id: str
    speaker: str
    content: str
    speaker_type: str
    timestamp: Optional[float] = None
    created_at: str


class BudgetItem(BaseModel):
    item: str
    quantity: int
    unit_price: float
    total_price: float


class WateringDuty(BaseModel):
    resident: str
    day: str
    zones: List[str]
    plants: List[str]


class MeetingMinutes(BaseModel):
    id: str
    meeting_id: str
    summary: str
    plant_diagram: str
    watering_schedule: List[WateringDuty]
    budget: List[BudgetItem]
    total_budget: Optional[float] = None
    created_at: str

    def model_post_init(self, __context):
        if self.total_budget is None:
            self.total_budget = sum(item.total_price for item in self.budget)

    def to_markdown(self, meeting: Meeting, discussions: List[Discussion]) -> str:
        organizer_comments = [d for d in discussions if d.speaker_type == "发起人"]
        resident_comments = [d for d in discussions if d.speaker_type == "居民"]
        
        md = f"# {meeting.title} - 会议纪要\n\n"
        md += f"**日期**: {meeting.date}\n\n"
        md += f"**地点**: {meeting.location}\n\n"
        md += "---\n\n"
        
        md += "## 会议摘要\n\n"
        md += f"{self.summary}\n\n"
        
        md += "---\n\n"
        
        md += "## 植物配置图\n\n"
        md += "```\n"
        md += self.plant_diagram
        md += "\n```\n\n"
        
        md += "## 浇水值日表\n\n"
        md += "| 居民 | 日期 | 负责区域 | 负责植物 |\n"
        md += "|------|------|----------|----------|\n"
        for duty in self.watering_schedule:
            md += f"| {duty.resident} | {duty.day} | {', '.join(duty.zones)} | {', '.join(duty.plants)} |\n"
        md += "\n"
        
        md += "## 预算明细\n\n"
        md += "| 项目 | 数量 | 单价 | 总价 |\n"
        md += "|------|------|------|------|\n"
        for item in self.budget:
            md += f"| {item.item} | {item.quantity} | ¥{item.unit_price:.2f} | ¥{item.total_price:.2f} |\n"
        md += f"\n**总计**: ¥{self.total_budget:.2f}\n\n"
        
        if organizer_comments:
            md += "---\n\n"
            md += "## 发起人发言\n\n"
            for d in organizer_comments:
                md += f"> {d.content}\n\n"
        
        if resident_comments:
            md += "---\n\n"
            md += "## 居民讨论\n\n"
            for d in resident_comments:
                md += f"- **{d.speaker}**: {d.content}\n"
        
        return md
