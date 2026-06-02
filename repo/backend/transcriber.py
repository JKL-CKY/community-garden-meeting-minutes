import os
from dotenv import load_dotenv
import whisper

load_dotenv()


class AudioTranscriber:
    def __init__(self, model_size: str = "base"):
        self.model = whisper.load_model(model_size)

    def transcribe(self, audio_path: str) -> dict:
        try:
            result = self.model.transcribe(
                audio_path,
                language="zh",
                verbose=False
            )
            
            segments = []
            for seg in result["segments"]:
                segments.append({
                    "start": seg["start"],
                    "end": seg["end"],
                    "text": seg["text"].strip()
                })
            
            return {
                "text": result["text"].strip(),
                "segments": segments
            }
        except Exception as e:
            return {
                "text": f"转写失败: {str(e)}",
                "segments": []
            }
