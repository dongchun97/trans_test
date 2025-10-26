from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AffixAnalysis(BaseModel):
    type: str
    part: str
    meaning: str

class SimilarWord(BaseModel):
    word: str
    translation: str
    difference: str

class WordData(BaseModel):
    translation: str
    phonetic: Optional[str] = None
    wordClass: str
    meanings: List[str]
    affixAnalysis: List[AffixAnalysis]
    similarWords: List[SimilarWord]

class SearchResponse(BaseModel):
    success: bool
    word: str
    data: Optional[WordData] = None
    message: Optional[str] = None

class SuggestionsResponse(BaseModel):
    success: bool
    suggestions: List[str]
    count: int

class AffixExamplesResponse(BaseModel):
    success: bool
    affix: str
    examples: List[str]
    count: int