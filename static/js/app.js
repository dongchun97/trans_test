// API基础URL
const API_BASE = '/api';

class WordAnalyzer {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadWordCount();
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
        this.wordCount = document.getElementById('word-count');
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

    async loadWordCount() {
        try {
            const response = await fetch(`${API_BASE}/health`);
            const data = await response.json();
            this.wordCount.textContent = data.word_count || 0;
        } catch (error) {
            console.error('获取单词数量失败:', error);
        }
    }

    async showSuggestions() {
        const input = this.wordInput.value.trim().toLowerCase();
        if (!input) {
            this.hideSuggestions();
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/suggestions?prefix=${encodeURIComponent(input)}`);
            const data = await response.json();

            if (data.success && data.suggestions.length > 0) {
                this.suggestions.innerHTML = '';
                data.suggestions.forEach(word => {
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
            } else {
                this.hideSuggestions();
            }
        } catch (error) {
            console.error('获取建议失败:', error);
            this.hideSuggestions();
        }
    }

    hideSuggestions() {
        this.suggestions.style.display = 'none';
    }

    async searchWord(word) {
        this.showLoading();

        try {
            const response = await fetch(`${API_BASE}/word/${encodeURIComponent(word)}`);
            const data = await response.json();

            if (data.success) {
                this.displayWordData(data.data);
            } else {
                this.displayError(data.message || '查询失败');
            }
        } catch (error) {
            console.error('查询单词失败:', error);
            this.displayError('网络错误，请稍后重试');
        }
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
        this.phonetic.textContent = data.phonetic || '';
        this.wordClass.textContent = data.wordClass;

        // 显示含义列表
        this.meaningList.innerHTML = "";
        data.meanings.forEach(meaning => {
            const li = document.createElement('li');
            li.textContent = meaning;
            this.meaningList.appendChild(li);
        });

        // 显示词根词缀分析
        this.displayAffixAnalysis(data.affixAnalysis);

        // 显示单词辨析
        this.displayWordComparison(data.similarWords);
    }

    async displayAffixAnalysis(affixAnalysis) {
        this.affixAnalysis.innerHTML = "";

        if (!affixAnalysis || affixAnalysis.length === 0) {
            this.affixAnalysis.innerHTML = "<p>暂无词根词缀分析数据</p>";
            return;
        }

        affixAnalysis.forEach(affix => {
            const affixItem = document.createElement('div');
            affixItem.className = 'affix-item';
            affixItem.innerHTML = `
                <div class="affix-type">${affix.type}: <strong>${affix.part}</strong></div>
                <div class="affix-meaning">含义: ${affix.meaning}</div>
            `;
            this.affixAnalysis.appendChild(affixItem);
        });

        // 加载同词缀单词举例
        await this.displayAffixExamples(affixAnalysis);
    }

    async displayAffixExamples(affixAnalysis) {
        this.affixExamplesDiv.innerHTML = "";

        if (!affixAnalysis || affixAnalysis.length === 0) {
            this.affixExamplesDiv.innerHTML = "<p>暂无同词缀单词数据</p>";
            return;
        }

        for (const affix of affixAnalysis) {
            const affixPart = affix.part;
            try {
                const response = await fetch(`${API_BASE}/affix/${encodeURIComponent(affixPart)}/examples`);
                const data = await response.json();

                if (data.success && data.examples.length > 0) {
                    const exampleSection = document.createElement('div');
                    exampleSection.innerHTML = `
                        <h3>含有 "${affixPart}" 的单词:</h3>
                        <ul class="example-list">
                            ${data.examples.map(word => `<li>${word}</li>`).join('')}
                        </ul>
                    `;
                    this.affixExamplesDiv.appendChild(exampleSection);
                }
            } catch (error) {
                console.error(`获取词缀 ${affixPart} 的例子失败:`, error);
            }
        }

        if (this.affixExamplesDiv.children.length === 0) {
            this.affixExamplesDiv.innerHTML = "<p>暂无同词缀单词数据</p>";
        }
    }

    displayWordComparison(similarWords) {
        this.wordComparison.innerHTML = "";

        if (!similarWords || similarWords.length === 0) {
            this.wordComparison.innerHTML = "<p>暂无相似词对比数据</p>";
            return;
        }

        similarWords.forEach(similar => {
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
    new WordAnalyzer();
});