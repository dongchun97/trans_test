from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import json
import os

app = FastAPI()

# 静态文件路径
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

# 载入词根词缀数据
DATA_PATH = os.path.join("data", "roots_affixes.json")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    ROOTS = json.load(f)


@app.get("/api/analyze")
def analyze(word: str):
    result = {
        "word": word,
        "prefix": None,
        "suffix": None,
        "root": None
    }

    for item in ROOTS:
        affix = item["affix"]
        t = item["type"]

        if t == "prefix" and word.startswith(affix):
            result["prefix"] = item
        elif t == "suffix" and word.endswith(affix):
            result["suffix"] = item
        elif t == "root" and affix in word:
            result["root"] = item

    return JSONResponse(result)
