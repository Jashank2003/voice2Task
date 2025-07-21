from flask import Flask, request
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import requests
import os
from dotenv import load_dotenv
import json
import re

load_dotenv()


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -------Hugging face tokens and fun. to transcibe -->

def transcribe_with_whisper(audio_path):
    API_URL = "https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3"
    headers = {
        "Authorization": f"Bearer {os.getenv('HF_TOKEN')}",
        "Content-Type": "audio/webm", 
    }

    try:
        with open(audio_path, "rb") as f:
            data = f.read()
        response = requests.post(API_URL, headers=headers, data=data)
        response.raise_for_status()
        result = response.json()
        print("Transcription result:", result)
        return result
    except Exception as e:
        print("Error during transcription:", e)
        return {"error": str(e)}


def extract_tasks_from_transcription(transcription_text):
    API_URL = "https://router.huggingface.co/novita/v3/openai/chat/completions"
    headers = {
        "Authorization": f"Bearer {os.getenv('HF_TOKEN')}",
        "Content-Type": "application/json"
    }

    prompt = f"""Extract all the tasks from the following paragraph and return a valid JSON object with the structure:

{{
  "tasks": [
    "task 1",
    "task 2",
    ...
  ]
}}

Input:
"{transcription_text}"

Output:"""

    payload = {
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "model": "baidu/ernie-4.5-21B-a3b"
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
    #     result = response.json()
    #     reply = result["choices"][0]["message"]["content"]
    #     print("Raw model reply:", reply)
    #     return reply  # Return raw JSON string (you can json.loads() it if needed)
    # except Exception as e:
    #     print("Error during task extraction:", e)
    #     return {"error": str(e)}
        raw_content = response.json()["choices"][0]["message"]["content"]

        # ✅ Strip ```json ... ``` formatting
        cleaned = re.sub(r"```json|```", "", raw_content).strip()

        # ✅ Convert to actual dict
        parsed = json.loads(cleaned)

        return parsed  # This will be a dict with key 'tasks'
    except Exception as e:
        print("Error extracting tasks:", e)
        return {"tasks": []}


# ---------API Endpoints for frontend-----

@app.route("/")
def home():
    return "Voice2Task Flask backend is running "



@app.route("/upload",methods=["POST"])
def upload_audio():
    if "audio" not in request.files:
        return {"error": "No audio file in request"},400
    
    audio_file = request.files["audio"]
    filename = secure_filename(audio_file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"],filename)
    audio_file.save(file_path)

    transcription_result = transcribe_with_whisper(file_path)
    transcription_text = transcription_result.get("text", "")
    # print(transcription_text)

    tasks_json = extract_tasks_from_transcription(transcription_text)
    print("Extracted tasks:", tasks_json["tasks"])

    return {
        "message": "Transcription successful",
        "transcription": transcription_text,
         "tasks": tasks_json["tasks"],
    }

    

if __name__ == "__main__":
    app.run(debug=True,port=5000)