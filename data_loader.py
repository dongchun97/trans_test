import json
import os
from typing import Dict, Any, List
from models import WordData

class DataLoader:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.words_data: Dict[str, Any] = {}
        self.prefixes_data: Dict[str, Any] = {}
        self.roots_data: Dict[str, Any] = {}
        
    def load_all_data(self) -> bool:
        """加载所有数据文件"""
        try:
            # 加载单词数据
            words_path = os.path.join(self.data_dir, "words.json")
            with open(words_path, "r", encoding="utf-8") as f:
                raw_words_data = json.load(f)
                # 转换为WordData对象
                for word, data in raw_words_data.items():
                    self.words_data[word] = WordData(**data)
            
            # 加载词缀数据
            prefixes_path = os.path.join(self.data_dir, "prefixes.json")
            with open(prefixes_path, "r", encoding="utf-8") as f:
                self.prefixes_data = json.load(f)
            
            # 加载词根数据
            roots_path = os.path.join(self.data_dir, "roots.json")
            with open(roots_path, "r", encoding="utf-8") as f:
                self.roots_data = json.load(f)
                
            print(f"数据加载完成: {len(self.words_data)} 个单词")
            return True
        except Exception as e:
            print(f"数据加载失败: {e}")
            return False
    
    def get_word_data(self, word: str) -> WordData:
        """获取单词数据"""
        return self.words_data.get(word.lower())
    
    def get_suggestions(self, prefix: str, limit: int = 5) -> List[str]:
        """获取输入建议"""
        prefix = prefix.lower()
        suggestions = [
            word for word in self.words_data.keys() 
            if word.startswith(prefix)
        ]
        return suggestions[:limit]
    
    def get_affix_examples(self, affix: str, limit: int = 5) -> List[str]:
        """获取同词缀单词示例"""
        # 首先检查专门的词缀数据
        if affix in self.prefixes_data:
            return self.prefixes_data[affix].get("examples", [])[:limit]
        
        # 如果没有专门数据，从单词中查找
        examples = []
        clean_affix = affix.replace("-", "")
        for word in self.words_data.keys():
            if clean_affix in word and word not in examples:
                examples.append(word)
                if len(examples) >= limit:
                    break
        return examples
    
    def get_all_words(self) -> List[str]:
        """获取所有单词列表"""
        return list(self.words_data.keys())
    
    def word_exists(self, word: str) -> bool:
        """检查单词是否存在"""
        return word.lower() in self.words_data