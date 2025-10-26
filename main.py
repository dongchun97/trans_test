from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os

from data_loader import DataLoader
from models import SearchResponse, SuggestionsResponse, AffixExamplesResponse

# 创建FastAPI应用
app = FastAPI(
    title="单词翻译与分析工具 API",
    description="提供单词翻译、词根词缀分析和相似词对比功能",
    version="1.0.0"
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化数据加载器
data_loader = DataLoader()

@app.on_event("startup")
async def startup_event():
    """应用启动时加载数据"""
    if not data_loader.load_all_data():
        raise Exception("数据加载失败")

@app.get("/", include_in_schema=False)
async def read_index():
    """服务根路径返回前端页面"""
    return FileResponse('static/index.html')

@app.get("/api/word/{word}", response_model=SearchResponse)
async def get_word_data(word: str):
    """获取单词数据"""
    word_data = data_loader.get_word_data(word)
    if not word_data:
        return SearchResponse(
            success=False,
            word=word,
            message=f"未找到单词 '{word}' 的信息"
        )
    
    return SearchResponse(
        success=True,
        word=word,
        data=word_data
    )

@app.get("/api/suggestions", response_model=SuggestionsResponse)
async def get_suggestions(prefix: str = Query(..., min_length=1), limit: int = Query(5, ge=1, le=10)):
    """获取输入建议"""
    suggestions = data_loader.get_suggestions(prefix, limit)
    return SuggestionsResponse(
        success=True,
        suggestions=suggestions,
        count=len(suggestions)
    )

@app.get("/api/affix/{affix}/examples", response_model=AffixExamplesResponse)
async def get_affix_examples(affix: str, limit: int = Query(5, ge=1, le=10)):
    """获取同词缀单词举例"""
    examples = data_loader.get_affix_examples(affix, limit)
    return AffixExamplesResponse(
        success=True,
        affix=affix,
        examples=examples,
        count=len(examples)
    )

@app.get("/api/words")
async def get_all_words():
    """获取所有单词列表"""
    words = data_loader.get_all_words()
    return {
        "success": True,
        "words": words,
        "count": len(words)
    }

@app.get("/api/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "word_count": len(data_loader.words_data),
        "prefix_count": len(data_loader.prefixes_data),
        "root_count": len(data_loader.roots_data)
    }

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/css", StaticFiles(directory="static/css"), name="css")
app.mount("/js", StaticFiles(directory="static/js"), name="js")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)