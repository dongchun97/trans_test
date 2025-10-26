// 应用主逻辑
class WordAnalyzer {
    constructor() {
        this.wordData = null;
        this.affixData = null;
        this.rootsData = null;
        
        this.initializeElements();
        this.loadData();
        this.setupEventListeners();
    }
    
    initializeElements() {
        this.searchForm = document.getElementById('search-form');
        this.wordInput = document.getElementById('word-input');
        this.suggestions = document.getElementById('suggestions');
        this.translationResult = document.getElementById('translation-result');
        this.phonetic = document.getElementById('phonetic');
        this.wordClass = document.getElementById('word-class');
        this.meaningList = document.getElementById('meaning-list');
        this.affixAnalysis = document.getElementById('affix-analysis');
        this.affixExamplesDiv = document.getElementById('affix-examples');
        this.wordComparison = document.getElementById('word-comparison');
    }
    
    async loadData() {
        try {
            // 加载单词数据
            const wordsResponse = await fetch('data/words.json');
            this.wordData = await wordsResponse.json();
            
            // 加载词缀数据
            const affixResponse = await fetch('data/prefixes.json');
            this.affixData = await affixResponse.json();
            
            // 加载词根数据
            const rootsResponse = await fetch('data/roots.json');
            this.rootsData = await rootsResponse.json();
            
            console.log('数据加载完成');
        } catch (error) {
            console.error('数据加载失败:', error);
            this.displayError('数据加载失败，请检查数据文件');
        }
    }
    
    setupEventListeners() {
        this.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const word = this.wordInput.value.trim().toLowerCase();
            if (word) {
                this.searchWord(word);
            }
        });
        
        // 输入建议
        this.wordInput.addEventListener('input', () => {
            this.showSuggestions();
        });
        
        // 点击页面其他地方隐藏建议
        document.addEventListener('click', (e) => {
            if (!this.wordInput.contains(e.target) && !this.suggestions.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }
    
    showSuggestions() {
        const input = this.wordInput.value.trim().toLowerCase();
        if (!input || !this.wordData) {
            this.hideSuggestions();
            return;
        }
        
        const matches = Object.keys(this.wordData).filter(word => 
            word.startsWith(input)
        ).slice(0, 5);
        
        if (matches.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        this.suggestions.innerHTML = '';
        matches.forEach(word => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = word;
            div.addEventListener('click', () => {
                this.wordInput.value = word;
                this.searchWord(word);
                this.hideSuggestions();
            });
            this.suggestions.appendChild(div);
        });
        
        this.suggestions.style.display = 'block';
    }
    
    hideSuggestions() {
        this.suggestions.style.display = 'none';
    }
    
    searchWord(word) {
        if (!this.wordData) {
            this.displayError('数据尚未加载完成，请稍后再试');
            return;
        }
        
        this.showLoading();
        
        // 模拟网络延迟
        setTimeout(() => {
            if (this.wordData[word]) {
                this.displayWordData(this.wordData[word]);
            } else {
                this.displayError(`未找到单词 "${word}" 的信息`);
            }
        }, 500);
    }
    
    showLoading() {
        this.translationResult.textContent = "查询中...";
        this.phonetic.textContent = "";
        this.wordClass.textContent = "";
        this.meaningList.innerHTML = "";
        this.affixAnalysis.innerHTML = "<p>分析中...</p>";
        this.affixExamplesDiv.innerHTML = "<p>查询中...</p>";
        this.wordComparison.innerHTML = "<p>查询中...</p>";
    }
    
    displayWordData(data) {
        // 显示翻译结果
        this.translationResult.textContent = data.translation;
        this.phonetic.textContent = data.phonetic;
        this.wordClass.textContent = data.wordClass;
        
        // 显示含义列表
        this.meaningList.innerHTML = "";
        data.meanings.forEach(meaning => {
            const li = document.createElement('li');
            li.textContent = meaning;
            this.meaningList.appendChild(li);
        });
        
        // 显示词根词缀分析
        this.displayAffixAnalysis(data);
        
        // 显示同词缀单词举例
        this.displayAffixExamples(data);
        
        // 显示单词辨析
        this.displayWordComparison(data);
    }
    
    displayAffixAnalysis(data) {
        this.affixAnalysis.innerHTML = "";
        
        if (!data.affixAnalysis || data.affixAnalysis.length === 0) {
            this.affixAnalysis.innerHTML = "<p>暂无词根词缀分析数据</p>";
            return;
        }
        
        data.affixAnalysis.forEach(affix => {
            const affixItem = document.createElement('div');
            affixItem.className = 'affix-item';
            affixItem.innerHTML = `
                <div class="affix-type">${affix.type}: <strong>${affix.part}</strong></div>
                <div class="affix-meaning">含义: ${affix.meaning}</div>
            `;
            this.affixAnalysis.appendChild(affixItem);
        });
    }
    
    displayAffixExamples(data) {
        this.affixExamplesDiv.innerHTML = "";
        
        if (!data.affixAnalysis || data.affixAnalysis.length === 0) {
            this.affixExamplesDiv.innerHTML = "<p>暂无同词缀单词数据</p>";
            return;
        }
        
        data.affixAnalysis.forEach(affix => {
            const affixPart = affix.part;
            const examples = this.findAffixExamples(affixPart);
            
            if (examples && examples.length > 0) {
                const exampleSection = document.createElement('div');
                exampleSection.innerHTML = `
                    <h3>含有 "${affixPart}" 的单词:</h3>
                    <ul class="example-list">
                        ${examples.map(word => `<li>${word}</li>`).join('')}
                    </ul>
                `;
                this.affixExamplesDiv.appendChild(exampleSection);
            }
        });
        
        if (this.affixExamplesDiv.children.length === 0) {
            this.affixExamplesDiv.innerHTML = "<p>暂无同词缀单词数据</p>";
        }
    }
    
    findAffixExamples(affix) {
        // 在实际应用中，这里应该查询专门的词缀-单词映射数据
        // 这里简化处理，从现有单词数据中查找
        const examples = [];
        for (const word in this.wordData) {
            if (word.includes(affix.replace('-', '')) && examples.length < 5) {
                examples.push(word);
            }
        }
        return examples;
    }
    
    displayWordComparison(data) {
        this.wordComparison.innerHTML = "";
        
        if (!data.similarWords || data.similarWords.length === 0) {
            this.wordComparison.innerHTML = "<p>暂无相似词对比数据</p>";
            return;
        }
        
        data.similarWords.forEach(similar => {
            const similarWordDiv = document.createElement('div');
            similarWordDiv.className = 'similar-word';
            similarWordDiv.innerHTML = `
                <div>
                    <span class="word-name">${similar.word}</span> - ${similar.translation}
                </div>
                <div class="word-difference">${similar.difference}</div>
            `;
            this.wordComparison.appendChild(similarWordDiv);
        });
    }
    
    displayError(message) {
        this.translationResult.textContent = "查询失败";
        this.phonetic.textContent = "";
        this.wordClass.textContent = "";
        this.meaningList.innerHTML = "";
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        this.affixAnalysis.innerHTML = "";
        this.affixAnalysis.appendChild(errorDiv);
        
        this.affixExamplesDiv.innerHTML = "<p>无法获取数据</p>";
        this.wordComparison.innerHTML = "<p>无法获取数据</p>";
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new WordAnalyzer();
});