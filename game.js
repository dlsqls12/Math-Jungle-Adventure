/**
 * Math Jungle Adventure - Core Game Logic
 */

/* --- Mathematics Engine --- */
class ProblemGenerator {
    static generate(grade, stage) {
        let problem = {};
        const isInfinite = stage > 10;
        // Infinite mode Scaling: Every 5 stages increases difficulty index
        const difficultyScale = isInfinite ? Math.floor((stage - 11) / 5) : 0;

        if (grade === 1) {
            // Grade 1: Counting Only (수세기)
            // Stage 1-3: 1~10
            // Stage 4-7: 1~30
            // Stage 8-10: 1~50 (Skip counting)
            // Infinite: 1~100+
            let max = 10;
            if (stage > 3) max = 30;
            if (stage > 7) max = 50;
            if (isInfinite) max = 50 + (difficultyScale * 10);

            if (stage > 7 || (isInfinite && stage % 2 === 0)) {
                return this.generateSkipCounting(max); 
            }
            return this.generateCounting(max);
        } 
        else if (grade === 2) {
            // Grade 2: Add/Sub Only (덧셈/뺄셈)
            // Stage 1-3: Simple Add (Sum <= 10)
            // Stage 4-6: Simple Sub (Single digit)
            // Stage 7-8: Add (2-digit, no carry -> carry)
            // Stage 9-10: Sub (2-digit, no borrow -> borrow)
            if (stage <= 3) return this.generateAddSub(1, 5, '+'); 
            if (stage <= 6) return this.generateAddSub(1, 9, '-');
            
            // Late Grade 2 & Infinite: 2-digit calculations
            let min = 10;
            let max = 20 + (isInfinite ? difficultyScale * 10 : 0);
            
            // Mix Add/Sub for late stages
            const op = (stage <= 8 && !isInfinite) ? '+' : (stage <= 10 && !isInfinite) ? '-' : Math.random() > 0.5 ? '+' : '-';
            return this.generateAddSub(min, max, op);
        }
        else if (grade === 3) {
            // Grade 3: Multiplication Only (구구단)
            // Stage 1-3: 2~5단
            // Stage 4-7: 6~9단
            // Stage 8-10: Mixed 2~9단
            let tables = [2, 3, 4, 5];
            if (stage > 3) tables = [6, 7, 8, 9];
            if (stage > 7 || isInfinite) tables = [2, 3, 4, 5, 6, 7, 8, 9];
            
            return this.generateMultiplication(tables);
        }
        else if (grade === 4) {
             // Grade 4: Division Only (나눗셈)
             // Stage 1-4: Basic (Divisors 2-5)
             // Stage 5-8: Advanced (Divisors 6-9)
             // Stage 9-10: Random (Divisors 2-9)
             let divisors = [2, 3, 4, 5];
             if (stage > 4) divisors = [6, 7, 8, 9];
             if (stage > 8 || isInfinite) divisors = [2, 3, 4, 5, 6, 7, 8, 9];

             return this.generateDivision(divisors);
        }
        
        // Fallback
        return this.generateAddSub(1, 10, '+');
    }

    static generateCounting(max) {
        let num = Math.floor(Math.random() * (max - 3)) + 1;
        if (num < 1) num = 1;
        return {
            type: 'counting',
            desc: "다음 숫자는?",
            problem: `${num}, ${num+1}, ${num+2}, ?`,
            answer: num + 3,
            options: this.generateOptions(num + 3),
            hintData: { type: 'sequence', step: 1, start: num, values: [num, num+1, num+2] }
        };
    }

    static generateSkipCounting(max) {
        let step = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, 5
        let start = Math.floor(Math.random() * (max - (step * 3))) + 1;
        if (start < 1) start = 1;
        
        let v1 = start;
        let v2 = start + step;
        let v3 = start + (step * 2);
        let answer = start + (step * 3);

        return {
            type: 'counting',
            desc: "규칙을 찾아보세요!",
            problem: `${v1}, ${v2}, ${v3}, ?`,
            answer: answer,
            options: this.generateOptions(answer),
            hintData: { type: 'sequence', step: step, start: start, values: [v1, v2, v3] }
        };
    }

    static generateAddSub(min, max, operator) {
        let a = Math.floor(Math.random() * (max - min + 1)) + min;
        let b = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // Ensure result is within reasoning bounds for Grade 1/2
        if (operator === '+') {
            // Cap sum if max is small (Simple addition)
            if (max <= 10) {
                while (a + b > 10) {
                    a = Math.floor(Math.random() * (max - min + 1)) + min;
                    b = Math.floor(Math.random() * (max - min + 1)) + min;
                }
            }
        } else {
             if (a < b) [a, b] = [b, a];
        }

        const answer = operator === '+' ? a + b : a - b;
        return {
            type: 'calc',
            desc: "계산해볼까요?",
            problem: `${a} ${operator} ${b} = ?`,
            answer: answer,
            options: this.generateOptions(answer),
            hintData: { type: 'calc', v1: a, v2: b, op: operator, answer: answer }
        };
    }

    static generateMultiplication(tables) {
        const table = tables[Math.floor(Math.random() * tables.length)];
        const multiplier = Math.floor(Math.random() * 9) + 1;
        const answer = table * multiplier;
        
        return {
            type: 'calc',
            desc: "구구단을 외자!",
            problem: `${table} x ${multiplier} = ?`,
            answer: answer,
            options: this.generateOptions(answer),
            hintData: { type: 'mult', table: table, step: multiplier, answer: answer }
        };
    }

    static generateDivision(minDivisor, maxDivisor) {
        const divisor = Math.floor(Math.random() * (maxDivisor - minDivisor + 1)) + minDivisor;
        const quotient = Math.floor(Math.random() * 9) + 1;
        const dividend = divisor * quotient;
        
        return {
            type: 'calc',
            desc: "나눗셈을 해볼까요?",
            problem: `${dividend} ÷ ${divisor} = ?`,
            answer: quotient,
            options: this.generateOptions(quotient),
            hintData: { type: 'div', total: dividend, perGroup: divisor, answer: quotient }
        };
    }

    static generateMixed() {
        // Simple mixed operation: A + B x C (teaching order of operations)
        // Or just big multiplication
        return this.generateMultiplication([11, 12, 13, 14, 15]);
    }

    static generateOptions(correctAnswer) {
        const options = new Set([correctAnswer]);
        while(options.size < 4) {
            let offset = Math.floor(Math.random() * 10) - 5;
            if (offset === 0) offset = 1;
            let val = correctAnswer + offset;
            if (val < 0) val = 0; // No negative options for elementary
            options.add(val);
        }
        return Array.from(options).sort(() => Math.random() - 0.5);
    }
}

/* --- Data Definitions --- */
const CHARACTER_DEFS = {
    monkey:   { name: '원숭이', emoji: '🐵', price: 0,    messages: ['좋아요!', '대단해!', '멋져요!'] },
    parrot:   { name: '앵무새', emoji: '🦜', price: 100,  messages: ['짹짹! 잘했어!', '날아올라!', '파이팅!'] },
    tiger:    { name: '호랑이', emoji: '🐯', price: 300,  messages: ['어흥! 최고야!', '용감해!', '으르렁!'] },
    elephant: { name: '코끼리', emoji: '🐘', price: 500,  messages: ['뿌우! 힘내!', '기억력 짱!', '잘한다!'] },
    lion:     { name: '사자',   emoji: '🦁', price: 800,  messages: ['왕의 실력!', '으하하!', '정글의 왕!'] },
    unicorn:  { name: '유니콘', emoji: '🦄', price: 1500, messages: ['마법같아!', '반짝반짝!', '무지개!'] },
    robot:    { name: '로봇',   emoji: '🤖', price: 1200, messages: ['계산 완료!', '비범해!', '삐리삐리!'] },
    panda:    { name: '팬더',   emoji: '🐼', price: 2000, messages: ['대나무 맛나!', '뒹굴뒹굴!', '느긋하게!'] },
    alien:    { name: '외계인', emoji: '👽', price: 2500, messages: ['우주급 실력!', '미지의 힘!', '텔레파시!'] },
    ghost:    { name: '유령',   emoji: '👻', price: 3000, messages: ['히히히!', '깜짝이야!', '보인다!'] },
    trex:     { name: '티라노', emoji: '🦖', price: 5000, messages: ['크아앙!', '최강 포식자!', '무적!'] }
};

const THEME_DEFS = {
    jungle: { name: '정글', emoji: '🌿', price: 0,   colors: null },
    ocean:  { name: '바다 탐험', emoji: '🌊', price: 200, colors: { primary: '200 80% 50%', secondary: '180 70% 45%', gradient: 'linear-gradient(135deg, #0077b6, #00b4d8, #90e0ef)' } },
    sakura: { name: '벚꽃 마을', emoji: '🌸', price: 300, colors: { primary: '330 70% 65%', secondary: '280 60% 60%', gradient: 'linear-gradient(135deg, #ffb7c5, #e0aaff, #ffc8dd)' } },
    desert: { name: '사막 모험', emoji: '🏜️', price: 400, colors: { primary: '30 80% 55%', secondary: '45 90% 50%', gradient: 'linear-gradient(135deg, #e6a057, #f0c27f, #fceabb)' } },
    space:  { name: '별빛 우주', emoji: '🌙', price: 500, colors: { primary: '260 70% 55%', secondary: '220 80% 40%', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' } },
    choco:  { name: '초코 랜드', emoji: '🍫', price: 600, colors: { primary: '25 60% 40%', secondary: '340 70% 60%', gradient: 'linear-gradient(135deg, #5d4037, #8d6e63, #ffccbc)' } },
    ice:    { name: '얼음 왕국', emoji: '❄️', price: 700, colors: { primary: '190 90% 60%', secondary: '200 80% 80%', gradient: 'linear-gradient(135deg, #a8dadc, #457b9d, #f1faee)' } },
    volcano:{ name: '화산 지대', emoji: '🌋', price: 800, colors: { primary: '0 80% 50%', secondary: '30 90% 50%', gradient: 'linear-gradient(135deg, #d00000, #ffba08, #370617)' } },
    magic:  { name: '마법의 성', emoji: '🏰', price: 1000, colors: { primary: '270 70% 50%', secondary: '50 90% 60%', gradient: 'linear-gradient(135deg, #7b2cbf, #c77dff, #e0aaff)' } }
};

const TITLE_DEFS = [
    { id: 'first_clear', name: '수학 새싹', icon: '🌱', desc: '첫 스테이지 클리어', check: s => s.totalCorrect >= 5 },
    { id: 'add_master', name: '덧셈의 달인', icon: '➕', desc: '덧셈 50개 정답', check: s => s.addCorrect >= 50 },
    { id: 'sub_warrior', name: '뺄셈 전사', icon: '➖', desc: '뺄셈 50개 정답', check: s => s.subCorrect >= 50 },
    { id: 'mult_master', name: '구구단 마스터', icon: '✖️', desc: '곱셈 100개 정답', check: s => s.multCorrect >= 100 },
    { id: 'div_doctor', name: '나눗셈 박사', icon: '➗', desc: '나눗셈 100개 정답', check: s => s.divCorrect >= 100 },
    { id: 'genius', name: '수학 천재', icon: '🧠', desc: '총 1000문제 정답', check: s => s.totalCorrect >= 1000 },
    { id: 'speed', name: '빛의 속도', icon: '⚡', desc: '타이머 55초 이상 남기고 정답', check: s => s.fastAnswer >= 1 },
    { id: 'perfectionist', name: '완벽주의자', icon: '💎', desc: '힌트 없이 스테이지 클리어', check: s => s.noHintClears >= 1 },
    { id: 'streak', name: '철인', icon: '🔥', desc: '연속 10문제 정답', check: s => s.streakMax >= 10 },
    { id: 'explorer', name: '탐험가', icon: '🗺️', desc: '모든 단계 스테이지1 클리어', check: (s, p) => [1,2,3,4].every(g => (p[g]||0) >= 1) },
    { id: 'conqueror', name: '정복자', icon: '👑', desc: '한 단계 10스테이지 전부 클리어', check: (s, p) => Object.values(p).some(v => v >= 10) },
    { id: 'legend', name: '전설의 모험가', icon: '🌟', desc: '모든 단계 전 스테이지 클리어', check: (s, p) => [1,2,3,4].every(g => (p[g]||0) >= 10) },
    { id: 'shopper', name: '쇼핑의 왕', icon: '🛒', desc: '캐릭터 3개 구매', check: s => s.charsBought >= 3 },
    { id: 'fashionista', name: '패셔니스타', icon: '👗', desc: '테마 3개 구매', check: s => s.themesBought >= 3 },
    { id: 'max_level', name: '만렙 달성', icon: '⭐', desc: '캐릭터 1개 Lv.5 달성', check: s => s.maxCharLevel >= 5 }
];

const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500];
const LEVEL_BONUSES = [
    { coinMult: 1.0, hintDelay: 3000, desc: '' },
    { coinMult: 1.0, hintDelay: 2000, desc: '힌트 대기시간 단축!' },
    { coinMult: 1.2, hintDelay: 2000, desc: '코인 1.2배!' },
    { coinMult: 1.5, hintDelay: 1000, desc: '코인 1.5배 + 힌트 초고속!' },
    { coinMult: 2.0, hintDelay: 1000, desc: '코인 2배! 전설 달성!' }
];

/* --- Game Engine --- */
class Game {
    constructor() {
        this.currentGrade = 0;
        this.currentStage = 0;
        this.score = 0;
        this.timer = 60;
        this.usedHintThisStage = false;
        
        this.timerInterval = null;
        this.maxQuestions = 5;
        this.currentQuestionCount = 0;
        this.currentProblem = null;
        this.hintLevel = 0;

        // UI References
        this.screens = {
            title: document.getElementById('screen-title'),
            map: document.getElementById('screen-map'),
            game: document.getElementById('screen-game'),
            result: document.getElementById('screen-result'),
            shop: document.getElementById('screen-shop'),
            titles: document.getElementById('screen-titles')
        };
        
        this.els = {
            score: document.getElementById('score'),
            timer: document.getElementById('timer'),
            progressBar: document.getElementById('progress-fill'),
            problemText: document.getElementById('problem-text'),
            answerButtons: document.getElementById('answer-buttons'),
            hintArea: document.getElementById('hint-area'),
            btnHint: document.getElementById('btn-hint'),
            resultStars: document.getElementById('result-stars'),
            finalScore: document.getElementById('final-score-val'),
            stageList: document.getElementById('stage-list'),
            hintDrawer: document.getElementById('hint-drawer'),
            btnFold: document.getElementById('btn-fold-hint'),
            hudCoins: document.getElementById('hud-coins'),
            titleCoins: document.getElementById('title-coins'),
            titleChar: document.getElementById('title-character'),
            titleBadge: document.getElementById('title-badge'),
            playerChar: document.getElementById('player-char'),
            charLevelBadge: document.getElementById('char-level-badge'),
            charSpeech: document.getElementById('char-speech'),
            coinsEarned: document.getElementById('coins-earned'),
            expEarned: document.getElementById('exp-earned'),
            shopCoinDisplay: document.getElementById('shop-coin-display'),
            shopGrid: document.getElementById('shop-grid'),
            titlesGrid: document.getElementById('titles-grid')
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadAllData();
        this.updateTitleScreen();
    }

    loadAllData() {
        // Stage Progress
        const saved = localStorage.getItem('mathJungle_progress');
        this.progress = saved ? JSON.parse(saved) : { 1: 0, 2: 0, 3: 0, 4: 0 };

        // Shop Data
        const shopSaved = localStorage.getItem('mathJungle_shop');
        if (shopSaved) {
            this.shopData = JSON.parse(shopSaved);
        } else {
            this.shopData = {
                coins: 0,
                characters: { monkey: { owned: true, level: 1, exp: 0 } },
                equippedChar: 'monkey',
                themes: { jungle: { owned: true } },
                equippedTheme: 'jungle'
            };
        }

        // Achievement Data
        const achSaved = localStorage.getItem('mathJungle_achievements');
        if (achSaved) {
            this.achData = JSON.parse(achSaved);
        } else {
            this.achData = {
                equippedTitle: null,
                unlocked: [],
                stats: {
                    totalCorrect: 0, addCorrect: 0, subCorrect: 0,
                    multCorrect: 0, divCorrect: 0,
                    streakCurrent: 0, streakMax: 0,
                    noHintClears: 0, fastAnswer: 0,
                    charsBought: 0, themesBought: 0, maxCharLevel: 1
                }
            };
        }
    }

    saveShopData() {
        localStorage.setItem('mathJungle_shop', JSON.stringify(this.shopData));
    }

    saveAchData() {
        localStorage.setItem('mathJungle_achievements', JSON.stringify(this.achData));
    }

    loadProgress() {
        const saved = localStorage.getItem('mathJungle_progress');
        this.progress = saved ? JSON.parse(saved) : { 1: 0, 2: 0, 3: 0, 4: 0 };
    }

    bindEvents() {
        // Grade Selection
        document.querySelectorAll('.btn-grade').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const grade = parseInt(e.currentTarget.dataset.grade);
                this.selectGrade(grade);
            });
        });

        // Map back button
        document.querySelector('#screen-map .btn-back').addEventListener('click', () => {
            this.showScreen('title');
            this.updateTitleScreen();
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            this.startGame(this.currentStage);
        });

        document.getElementById('btn-next').addEventListener('click', () => {
            this.startGame(this.currentStage + 1);
        });

        document.getElementById('btn-result-map').addEventListener('click', () => {
            this.showScreen('map');
            this.renderStageMap(this.currentGrade);
        });
        
        // Resize Handler for Map Alignment
        window.addEventListener('resize', () => {
            if (!this.screens.map.classList.contains('hidden')) {
                if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.renderStageMap(this.currentGrade);
                }, 100);
            }
        });

        // Pause & Exit Handlers
        document.getElementById('btn-pause').addEventListener('click', () => this.togglePause(true));
        document.getElementById('btn-resume').addEventListener('click', () => this.togglePause(false));
        document.getElementById('btn-exit-map').addEventListener('click', () => this.exitToMap());
        document.getElementById('btn-exit-title').addEventListener('click', () => this.exitToTitle());
        
        // Hint Drawer
        this.els.btnFold.addEventListener('click', () => this.toggleHintDrawer(false));
        
        // Hint System
        this.els.btnHint.addEventListener('click', () => {
            if (this.hintLevel === 0) {
                 this.showNextHint();
            } else {
                 this.toggleHintDrawer(true);
            }
        });

        // Shop Navigation
        document.getElementById('btn-open-shop').addEventListener('click', () => {
            this.showScreen('shop');
            this.renderShop('characters');
        });
        document.getElementById('btn-back-shop').addEventListener('click', () => {
            this.showScreen('title');
            this.updateTitleScreen();
        });

        // Titles Navigation
        document.getElementById('btn-open-titles').addEventListener('click', () => {
            this.showScreen('titles');
            this.renderTitlesScreen();
        });
        document.getElementById('btn-back-titles').addEventListener('click', () => {
            this.showScreen('title');
            this.updateTitleScreen();
        });

        // Shop Tabs
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.renderShop(e.currentTarget.dataset.tab);
            });
        });

        // Level Up Modal Close
        document.getElementById('btn-close-levelup').addEventListener('click', () => {
            document.getElementById('modal-levelup').classList.add('hidden');
        });

        // Title Unlock Modal Close
        document.getElementById('btn-close-title-unlock').addEventListener('click', () => {
            document.getElementById('modal-title-unlock').classList.add('hidden');
        });
    }

    // Duplicate endGame removed from here


    toggleHintDrawer(show) {
        if (show) {
            this.els.hintDrawer.classList.add('expanded');
            this.els.btnHint.classList.add('hidden');
        } else {
            this.els.hintDrawer.classList.remove('expanded');
            this.els.btnHint.classList.remove('hidden');
        }
    }

    selectGrade(grade) {
        this.currentGrade = grade;
        this.showScreen('map');
        this.renderStageMap(grade);
    }

    renderStageMap(grade) {
        this.loadProgress(); // Ensure latest progress
        
        // ... (existing cleanup)
        this.els.stageList.innerHTML = '';
        this.els.stageList.className = 'stage-scroll-container';
        this.els.stageList.style = '';

        const container = this.els.stageList;
        const stages = 10;
        const verticalGap = 120;
        const waveWidth = 200;
        const startY = 50;
        
        // Get progress for this grade
        const maxCleared = this.progress[grade] || 0;
        
        // Create SVG
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "map-path-svg");
        container.appendChild(svg);
        const coords = [];

        for(let i=1; i<=stages + 1; i++) {
            const btn = document.createElement('div');
            const rowIndex = i - 1;
            const xOffset = Math.sin(rowIndex * 0.8) * waveWidth; 
            const topPos = startY + (rowIndex * verticalGap);
            
            btn.className = 'stage-node';
            if (i > stages) btn.classList.add('infinite');
            
            // Locking Logic - Per Grade
            const isLocked = i > maxCleared + 1;
            if (isLocked) {
                btn.classList.add('locked');
                btn.innerHTML = "🔒";
            } else {
                 if (i <= stages) {
                    btn.innerText = i;
                    btn.onclick = () => this.startGame(i);
                } else {
                    btn.innerHTML = "✨<br>무한";
                    btn.onclick = () => this.startGame(11);
                }
            }

            btn.style.top = `${topPos}px`;
            btn.style.left = `calc(50% + ${xOffset}px - ${i > stages ? 50 : 40}px)`; 
            container.appendChild(btn);
            coords.push({ x: xOffset, y: topPos + (i > stages ? 50 : 40) });
        }
        
        // ... (SVG Path Generation code same as before)
        let pathD = "";
        const centerX = container.clientWidth / 2 || 400;
        
        coords.forEach((pos, idx) => {
            const realX = centerX + pos.x;
            if (idx === 0) {
                pathD += `M ${realX} ${pos.y} `;
            } else {
                const prev = coords[idx-1];
                const prevX = centerX + prev.x;
                const prevY = prev.y;
                const cp1x = prevX;
                const cp1y = prevY + (verticalGap / 2);
                const cp2x = realX;
                const cp2y = pos.y - (verticalGap / 2);
                pathD += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${realX} ${pos.y} `;
            }
        });

        const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathEl.setAttribute("d", pathD);
        pathEl.setAttribute("stroke", "rgba(255,255,255,0.6)");
        pathEl.setAttribute("stroke-width", "10");
        pathEl.setAttribute("fill", "none");
        pathEl.setAttribute("stroke-dasharray", "20 10");
        pathEl.setAttribute("stroke-linecap", "round");
        svg.appendChild(pathEl);
        
        const totalHeight = startY + ((stages + 1) * verticalGap);
        svg.style.height = `${totalHeight}px`;
        
        const spacer = document.createElement('div');
        spacer.style.height = `${totalHeight + 100}px`;
        spacer.style.width = '1px';
        container.appendChild(spacer);
    }
    
    // ... (showScreen, startGame, startTimer, nextQuestion, checkAnswer, showNextHint, updateHUD, updateProgress)

    // Old endGame removed


    showScreen(screenName) {
        Object.values(this.screens).forEach(s => s.classList.remove('active', 'hidden'));
        Object.values(this.screens).forEach(s => s.classList.add('hidden'));
        
        const target = this.screens[screenName];
        target.classList.remove('hidden');
        setTimeout(() => target.classList.add('active'), 10);
    }

    startGame(stage) {
        this.currentStage = stage;
        this.score = 0;
        this.timer = this.getStageTimeLimit(this.currentGrade, stage);
        this.currentQuestionCount = 0;
        this.hintLevel = 0;
        this.usedHintThisStage = false;
        
        // Set equipped character
        const charId = this.shopData.equippedChar;
        const charDef = CHARACTER_DEFS[charId];
        const charData = this.shopData.characters[charId];
        this.els.playerChar.innerText = charDef.emoji;
        this.els.charLevelBadge.innerText = `Lv.${charData ? charData.level : 1}`;
        this.els.charSpeech.innerText = '';
        this.els.charSpeech.classList.remove('visible');

        this.updateHUD();
        this.showScreen('game');
        this.nextQuestion();
        this.startTimer();
    }

    startTimer() {
        if(this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.els.timer.innerText = this.timer;
            if(this.timer <= 0) {
                // Infinite Mode: Time Attack end is SUCCESS
                if (this.currentStage > 10) {
                    this.endGame(true);
                } else {
                    this.endGame(false);
                }
            }
        }, 1000);
    }

    getStageTimeLimit(grade, stage) {
        if (stage > 10) return 45; // Infinite mode base (Time Attack)
        
        if (grade === 1) return 60; // Counting
        
        if (grade === 2) {
            return stage <= 6 ? 60 : 80; // Add/Sub: 60s -> 80s
        }
        
        if (grade === 3) {
            return stage <= 4 ? 60 : 80; // Mult: 60s -> 80s
        }
        
        if (grade === 4) {
            return stage <= 4 ? 60 : 90; // Div: 60s -> 90s
        }
        
        return 60; // Default fallback
    }

    nextQuestion() {
        const isInfinite = this.currentStage > 10;
        if (!isInfinite && this.currentQuestionCount >= this.maxQuestions) {
            this.endGame(true);
            return;
        }

        this.currentQuestionCount++;
        this.updateProgress();
        this.hintLevel = 0;
        this.els.hintArea.innerHTML = '';
        this.toggleHintDrawer(false); // Close drawer
        this.els.btnHint.classList.add('hidden');
        
        // Generate Problem
        this.currentProblem = ProblemGenerator.generate(this.currentGrade, this.currentStage);
        
        // Render Problem
        this.els.problemText.innerHTML = `
            <div class="problem-desc">${this.currentProblem.desc}</div>
            <div class="problem-main">${this.currentProblem.problem}</div>
        `;
        
        // Render Options
        this.els.answerButtons.innerHTML = '';
        this.currentProblem.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn-option';
            btn.innerText = opt;
            btn.onclick = () => this.checkAnswer(opt, btn);
            this.els.answerButtons.appendChild(btn);
        });

        // Show Hint button after delay (based on character level)
        const hintDelay = this.getHintDelay();
        setTimeout(() => {
            this.els.btnHint.classList.remove('hidden');
        }, hintDelay);
    }

    checkAnswer(selected, btnElement) {
        if (selected === this.currentProblem.answer) {
            // Correct
            btnElement.style.background = '#4CAF50';
            btnElement.style.color = 'white';
            this.score += 100 + (this.timer * 2);
            this.playSound('correct');

            // Track stats
            this.achData.stats.totalCorrect++;
            this.achData.stats.streakCurrent++;
            if (this.achData.stats.streakCurrent > this.achData.stats.streakMax) {
                this.achData.stats.streakMax = this.achData.stats.streakCurrent;
            }
            if (this.timer >= 55) this.achData.stats.fastAnswer++;

            // Track operation type
            const h = this.currentProblem.hintData;
            if (h.type === 'calc' && h.op === '+') this.achData.stats.addCorrect++;
            if (h.type === 'calc' && h.op === '-') this.achData.stats.subCorrect++;
            if (h.type === 'mult') this.achData.stats.multCorrect++;
            if (h.type === 'div') this.achData.stats.divCorrect++;

            // Character speech
            this.showCharSpeech(true);

            // Add EXP
            this.addExp(1);
            this.saveAchData();

            setTimeout(() => this.nextQuestion(), 500);
        } else {
            // Incorrect
            btnElement.style.background = '#F44336';
            btnElement.style.color = 'white';
            this.achData.stats.streakCurrent = 0;
            this.shakeScreen();
            this.showNextHint();
            this.usedHintThisStage = true;
            this.showCharSpeech(false);
        }
        this.updateHUD();
    }

    showNextHint() {
        if (this.hintLevel >= 3) return;
        this.hintLevel++;
        this.toggleHintDrawer(true);
        
        const h = this.currentProblem.hintData;
        let hintHtml = '';
        
        // Helper for splitting tens/ones
        const getTens = (n) => Math.floor(n / 10) * 10;
        const getOnes = (n) => n % 10;

        // Check if it's a 2-digit calc (Grade 2 style)
        const isTwoDigit = h.type === 'calc' && h.v1 >= 10 && h.v2 >= 10;
        
        // --- Level 1: Visual / Concept ---
        if (this.hintLevel === 1) {
            if (isTwoDigit) {
                if (h.op === '+') {
                    hintHtml = `<div class="hint-text">십의 자리와 일의 자리를 나눠서 볼까요?</div>`;
                    hintHtml += `<div class="hint-group" style="flex-direction:column; gap:5px;">
                        <div>${h.v1} ➡ <span style="color:var(--primary);">${getTens(h.v1)}</span> 과 <span style="color:var(--accent);">${getOnes(h.v1)}</span></div>
                        <div>${h.v2} ➡ <span style="color:var(--primary);">${getTens(h.v2)}</span> 과 <span style="color:var(--accent);">${getOnes(h.v2)}</span></div>
                    </div>`;
                } else {
                    // Subtraction
                    const borrow = getOnes(h.v1) < getOnes(h.v2);
                    if (borrow) {
                        hintHtml = `<div class="hint-text">일의 자리끼리 뺄 수 없으니 빌려와요!</div>`;
                        hintHtml += `<div class="hint-group">${h.v1} ➡ <span style="color:var(--primary);">${getTens(h.v1)-10}</span> + <span style="color:var(--accent);">${getOnes(h.v1)+10}</span></div>`;
                    } else {
                        hintHtml = `<div class="hint-text">십의 자리와 일의 자리를 나눠서 볼까요?</div>`;
                        hintHtml += `<div class="hint-group" style="flex-direction:column; gap:5px;">
                            <div>${h.v1} ➡ ${getTens(h.v1)} 과 ${getOnes(h.v1)}</div>
                            <div>${h.v2} ➡ ${getTens(h.v2)} 과 ${getOnes(h.v2)}</div>
                        </div>`;
                    }
                }
            } else if (h.type === 'sequence') {
                hintHtml = `<div class="hint-text">숫자가 커지는 규칙을 찾아보세요!</div>`;
                hintHtml += `<div class="hint-group" style="margin-top:10px; font-size:1.5rem;">${h.values.join(' ➡ ')} ➡ ❓</div>`;
            } else if (h.type === 'calc') {
                // Single digit or simple
                if (h.op === '+') {
                    hintHtml = `<div class="hint-text">두 숫자를 더하면 몇 개가 될까요?</div>`;
                    hintHtml += `<div class="hint-group">
                        <span>🔵 x ${h.v1}</span> + <span>🔴 x ${h.v2}</span>
                    </div>`;
                } else {
                    hintHtml = `<div class="hint-text">${h.v1}개에서 ${h.v2}개를 빼면?</div>`;
                    hintHtml += `<div class="hint-group">
                        <span>🔵 x ${h.v1}</span> ➡ <span>❌ ${h.v2}개 지우기</span>
                    </div>`;
                }
            } else if (h.type === 'mult') {
                hintHtml = `<div class="hint-text">${h.table}개씩 ${h.step}묶음이 있어요!</div>`;
                hintHtml += `<div style="display:flex; flex-wrap:wrap; justify-content:center; gap:5px; margin-top:10px;">`;
                for(let i=0; i<h.step; i++) {
                    hintHtml += `<div class="hint-group" style="padding:5px;">${'🍎'.repeat(h.table)}</div>`;
                }
                hintHtml += `</div>`;
            } else if (h.type === 'div') {
                 hintHtml = `<div class="hint-text">${h.total}개를 ${h.perGroup}명에게 똑같이 나누어 주면?</div>`;
                 hintHtml += `<div class="hint-group" style="margin-top:10px;">🍪 ${h.total}개 준비!</div>`;
            }
        }
        
        // --- Level 2: Pattern / Meaning ---
        else if (this.hintLevel === 2) {
            if (isTwoDigit) {
                if (h.op === '+') {
                    const tenSum = getTens(h.v1) + getTens(h.v2);
                    const oneSum = getOnes(h.v1) + getOnes(h.v2);
                    hintHtml = `<div class="hint-text">끼리끼리 더해볼까요?</div>`;
                    hintHtml += `<div class="hint-group" style="flex-direction:column; gap:5px;">
                        <div>십의 자리: <span style="color:var(--primary);">${getTens(h.v1)} + ${getTens(h.v2)} = ${tenSum}</span></div>
                        <div>일의 자리: <span style="color:var(--accent);">${getOnes(h.v1)} + ${getOnes(h.v2)} = ${oneSum}</span></div>
                    </div>`;
                } else {
                    const borrow = getOnes(h.v1) < getOnes(h.v2);
                    if (borrow) {
                        const tens = getTens(h.v1) - 10;
                        const ones = getOnes(h.v1) + 10;
                        hintHtml = `<div class="hint-text">끼리끼리 빼볼까요?</div>`;
                        hintHtml += `<div class="hint-group" style="flex-direction:column; gap:5px;">
                            <div>십의 자리: ${tens} - ${getTens(h.v2)} = ${tens - getTens(h.v2)}</div>
                            <div>일의 자리: ${ones} - ${getOnes(h.v2)} = ${ones - getOnes(h.v2)}</div>
                        </div>`;
                    } else {
                        hintHtml = `<div class="hint-text">끼리끼리 빼볼까요?</div>`;
                        hintHtml += `<div class="hint-group" style="flex-direction:column; gap:5px;">
                            <div>십의 자리: ${getTens(h.v1)} - ${getTens(h.v2)} = ${getTens(h.v1) - getTens(h.v2)}</div>
                            <div>일의 자리: ${getOnes(h.v1)} - ${getOnes(h.v2)} = ${getOnes(h.v1) - getOnes(h.v2)}</div>
                        </div>`;
                    }
                }
            } else if (h.type === 'sequence') {
                hintHtml = `<div class="hint-text">숫자가 <strong>${h.step}</strong>씩 커지고 있어요!</div>`;
            } else if (h.type === 'calc') {
                hintHtml = `<div class="hint-text">손가락으로 세어볼까요?</div>
                            <div class="hint-group" style="font-size:1.2rem;">${h.v1} ${h.op} ${h.v2}</div>`;
            } else if (h.type === 'mult') {
                const addStr = Array(h.step).fill(h.table).join(" + ");
                hintHtml = `<div class="hint-text">덧셈으로 바꿔볼까요?</div>
                            <div class="hint-group" style="font-size:1.2rem;">${addStr}</div>`;
            } else if (h.type === 'div') {
                hintHtml = `<div class="hint-text">${h.perGroup}단 구구단을 외워볼까요?</div>
                            <div class="hint-group">${h.perGroup} x ❓ = ${h.total}</div>`;
            }
        }
        
        // --- Level 3: Near Answer ---
        else if (this.hintLevel === 3) {
            if (isTwoDigit) {
                 if (h.op === '+') {
                    const tenSum = getTens(h.v1) + getTens(h.v2);
                    const oneSum = getOnes(h.v1) + getOnes(h.v2);
                    hintHtml = `<div class="hint-text">이제 두 값을 합쳐보세요!</div>`;
                    hintHtml += `<div class="hint-group" style="font-size:1.5rem;">${tenSum} + ${oneSum} = ❓</div>`;
                 } else {
                    // Subtraction final step
                     hintHtml = `<div class="hint-text" style="background:var(--accent);">정답은 <strong>${h.answer}</strong> 입니다!</div>`;
                 }
            } else if (h.type === 'sequence') {
                hintHtml = `<div class="hint-text" style="background:var(--accent);">정답은 <strong>${h.values[h.values.length-1] + h.step}</strong> 입니다!</div>`;
            } else if (h.type === 'div') {
                hintHtml = `<div class="hint-text" style="background:var(--accent);">정답은 <strong>${h.answer}</strong> 입니다!</div>`;
            } else {
                let near = h.answer + (Math.random() > 0.5 ? 1 : -1);
                hintHtml = `<div class="hint-text" style="background:var(--accent);">정답은 <strong>${h.answer}</strong> 입니다!</div>`;
            }
        }

        this.els.hintArea.innerHTML = hintHtml;
    }



    updateHUD() {
        this.els.score.innerText = this.score;
        this.els.timer.innerText = this.timer;
        this.els.hudCoins.innerText = this.shopData.coins;
    }

    updateProgress() {
        const isInfinite = this.currentStage > 10;
        const pct = isInfinite ? 100 : (this.currentQuestionCount / this.maxQuestions) * 100;
        this.els.progressBar.style.width = `${pct}%`;
    }

    endGame(success) {
        clearInterval(this.timerInterval);
        this.showScreen('result');
        this.els.finalScore.innerText = this.score;
        
        let coinsGained = 0;
        let expGained = 0;

        if (success) {
            this.els.resultStars.innerText = "⭐⭐⭐";
            
            if (this.currentStage > 10) {
                document.querySelector('.result-title').innerText = "무한 도전 종료! 🔥";
                // Infinite mode: Retry button instead of Next
                document.getElementById('btn-next').style.display = 'none'; 
                // Maybe change "Next" button text to "Retry"? Or just hide it and rely on map/restart.
                // Actually, let's keep Next as "Replay" or hide it. 
                // Let's hide it for now as per "Time Attack" feel, user goes back to map or restarts.
                // Or better: Show a "Retry" button. For now, hiding 'btn-next' is safe.
            } else {
                document.querySelector('.result-title').innerText = "스테이지 클리어! 🎉";
                document.getElementById('btn-next').style.display = '';
            }

            this.playSound('correct');
            
            // Unlock Next Stage Logic
            const currentMax = this.progress[this.currentGrade] || 0;
            // Only unlock up to stage 10. Infinite stages (11+) are always open if 10 is cleared.
            if (this.currentStage <= 10 && this.currentStage > currentMax) {
                this.progress[this.currentGrade] = this.currentStage;
                localStorage.setItem('mathJungle_progress', JSON.stringify(this.progress));
            }

            // Award coins (Enable for all stages, including infinite)
            const mult = this.getCoinMultiplier();
            coinsGained = Math.floor((this.score / 10) * mult);
            
            // Bonus for Infinite Mode (Optional: higher rewards for higher difficulty)
            if (this.currentStage > 10) {
                 coinsGained += Math.floor((this.currentStage - 10) * 10);
            }

            this.shopData.coins += coinsGained;
            this.saveShopData();

            // Award bonus EXP
            expGained = 5; // Stage clear bonus
            if (this.currentStage > 10) expGained += 2; // Extra EXP for infinite

            if (!this.usedHintThisStage) {
                expGained += 3;
                this.achData.stats.noHintClears++;
            }
            this.addExp(expGained);
            this.saveAchData();

            // Check title unlocks
            this.checkTitleUnlocks();
        } else {
            this.els.resultStars.innerText = "⭐";
            document.querySelector('.result-title').innerText = "시간 초과! 😢";
            document.getElementById('btn-next').style.display = 'none';
        }

        // Display earned rewards
        this.els.coinsEarned.innerText = `+${coinsGained}`;
        this.els.expEarned.innerText = success ? `+${expGained} EXP` : '';
    }

    shakeScreen() {
        this.screens.game.style.transform = "translateX(10px)";
        setTimeout(() => this.screens.game.style.transform = "translateX(-10px)", 50);
        setTimeout(() => this.screens.game.style.transform = "translateX(0)", 100);
    }
    
    playSound(type) {
        console.log(`Playing sound: ${type}`);
    }

    togglePause(pause) {
        const modal = document.getElementById('modal-pause');
        if (pause) {
            clearInterval(this.timerInterval);
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
            this.startTimer();
        }
    }

    exitToMap() {
        clearInterval(this.timerInterval);
        document.getElementById('modal-pause').classList.add('hidden');
        this.showScreen('map');
        this.renderStageMap(this.currentGrade);
    }

    exitToTitle() {
        clearInterval(this.timerInterval);
        document.getElementById('modal-pause').classList.add('hidden');
        this.showScreen('title');
        this.updateTitleScreen();
    }

    // --- Coin Multiplier ---
    getCoinMultiplier() {
        const charId = this.shopData.equippedChar;
        const charData = this.shopData.characters[charId];
        if (!charData) return 1.0;
        const lvl = Math.min(charData.level - 1, LEVEL_BONUSES.length - 1);
        return LEVEL_BONUSES[lvl].coinMult;
    }

    getHintDelay() {
        const charId = this.shopData.equippedChar;
        const charData = this.shopData.characters[charId];
        if (!charData) return 3000;
        const lvl = Math.min(charData.level - 1, LEVEL_BONUSES.length - 1);
        return LEVEL_BONUSES[lvl].hintDelay;
    }

    // --- Character Speech ---
    showCharSpeech(correct) {
        const charId = this.shopData.equippedChar;
        const charDef = CHARACTER_DEFS[charId];
        if (!charDef) return;

        const msgs = correct ? charDef.messages : ['다시 해보자!', '힘내!', '괜찮아!'];
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        this.els.charSpeech.innerText = msg;
        this.els.charSpeech.classList.add('visible');
        setTimeout(() => this.els.charSpeech.classList.remove('visible'), 1500);
    }

    // --- EXP / Leveling ---
    addExp(amount) {
        const charId = this.shopData.equippedChar;
        const charData = this.shopData.characters[charId];
        if (!charData) return;

        charData.exp += amount;
        const currentLevel = charData.level;

        // Check level up
        if (currentLevel < LEVEL_THRESHOLDS.length) {
            const nextThreshold = LEVEL_THRESHOLDS[currentLevel]; // next level threshold
            if (charData.exp >= nextThreshold) {
                charData.level++;
                this.saveShopData();

                // Update max level stat
                if (charData.level > this.achData.stats.maxCharLevel) {
                    this.achData.stats.maxCharLevel = charData.level;
                }

                // Show level up modal
                const charDef = CHARACTER_DEFS[charId];
                document.getElementById('levelup-icon').innerText = charDef.emoji;
                document.getElementById('levelup-text').innerText = `${charDef.name} Lv.${charData.level} 달성!`;
                const bonus = LEVEL_BONUSES[Math.min(charData.level - 1, LEVEL_BONUSES.length - 1)];
                document.getElementById('levelup-bonus').innerText = bonus.desc;
                document.getElementById('modal-levelup').classList.remove('hidden');

                // Update badge
                this.els.charLevelBadge.innerText = `Lv.${charData.level}`;
            }
        }
        this.saveShopData();
    }

    // --- Title Screen ---
    updateTitleScreen() {
        this.els.titleCoins.innerText = this.shopData.coins;
        const charDef = CHARACTER_DEFS[this.shopData.equippedChar];
        this.els.titleChar.innerText = charDef ? charDef.emoji : '🐵';

        if (this.achData.equippedTitle) {
            const title = TITLE_DEFS.find(t => t.id === this.achData.equippedTitle);
            this.els.titleBadge.innerText = title ? `${title.icon} ${title.name}` : '';
            this.els.titleBadge.style.display = 'inline-block';
        } else {
            this.els.titleBadge.innerText = '';
            this.els.titleBadge.style.display = 'none';
        }

        // Apply theme
        this.applyTheme(this.shopData.equippedTheme);
    }

    // --- Theme ---
    applyTheme(themeId) {
        const theme = THEME_DEFS[themeId];
        const root = document.documentElement;
        if (theme && theme.colors) {
            root.style.setProperty('--primary', theme.colors.primary);
            root.style.setProperty('--secondary', theme.colors.secondary);
            document.querySelector('.background-layer').style.background = theme.colors.gradient;
        } else {
            // Reset to default jungle
            root.style.setProperty('--primary', '130 60% 45%');
            root.style.setProperty('--secondary', '45 100% 55%');
            document.querySelector('.background-layer').style.background = '';
        }
    }

    // --- Shop ---
    renderShop(tab) {
        this.els.shopCoinDisplay.innerText = this.shopData.coins;
        const scrollPos = this.els.shopGrid.scrollTop;
        this.els.shopGrid.innerHTML = '';

        if (tab === 'characters') {
            Object.entries(CHARACTER_DEFS).forEach(([id, def]) => {
                const owned = this.shopData.characters[id]?.owned;
                const equipped = this.shopData.equippedChar === id;
                const charData = this.shopData.characters[id];
                const level = charData ? charData.level : 0;
                const canAfford = this.shopData.coins >= def.price;

                const card = document.createElement('div');
                card.className = `shop-card ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''} ${!owned && !canAfford ? 'locked' : ''}`;
                card.dataset.id = id;
                card.innerHTML = `
                    <div class="shop-card-emoji">${def.emoji}</div>
                    <div class="shop-card-name">${def.name}</div>
                    ${owned ? `<div class="shop-card-level">Lv.${level}</div>` : `<div class="shop-card-price">🪙 ${def.price}</div>`}
                    <button class="shop-card-btn">
                        ${equipped ? '✅ 착용 중' : owned ? '착용하기' : canAfford ? '구매하기' : '🔒 부족'}
                    </button>
                `;

                const btn = card.querySelector('.shop-card-btn');
                if (equipped) {
                    btn.disabled = true;
                } else if (owned) {
                    btn.addEventListener('click', () => this.equipCharacter(id));
                } else if (canAfford) {
                    btn.addEventListener('click', () => this.buyCharacter(id));
                } else {
                    btn.disabled = true;
                }

                this.els.shopGrid.appendChild(card);
            });
        } else {
            // Themes
            Object.entries(THEME_DEFS).forEach(([id, def]) => {
                const owned = this.shopData.themes[id]?.owned;
                const equipped = this.shopData.equippedTheme === id;
                const canAfford = this.shopData.coins >= def.price;

                const card = document.createElement('div');
                card.className = `shop-card theme-card ${owned ? 'owned' : ''} ${equipped ? 'equipped' : ''} ${!owned && !canAfford ? 'locked' : ''}`;
                card.dataset.id = id;
                
                // Theme preview
                let previewStyle = '';
                if (def.colors) {
                    previewStyle = `background: ${def.colors.gradient};`;
                } else {
                    previewStyle = 'background: linear-gradient(135deg, #2d5016, #4a7c23, #7bc74d);';
                }

                card.innerHTML = `
                    <div class="theme-preview" style="${previewStyle}"></div>
                    <div class="shop-card-emoji">${def.emoji}</div>
                    <div class="shop-card-name">${def.name}</div>
                    ${owned ? '' : `<div class="shop-card-price">🪙 ${def.price}</div>`}
                    <button class="shop-card-btn">
                        ${equipped ? '✅ 적용 중' : owned ? '적용하기' : canAfford ? '구매하기' : '🔒 부족'}
                    </button>
                `;

                const btn = card.querySelector('.shop-card-btn');
                if (equipped) {
                    btn.disabled = true;
                } else if (owned) {
                    btn.addEventListener('click', () => this.equipTheme(id));
                } else if (canAfford) {
                    btn.addEventListener('click', () => this.buyTheme(id));
                } else {
                    btn.disabled = true;
                }

                this.els.shopGrid.appendChild(card);
            });
        }
        this.els.shopGrid.scrollTop = scrollPos;
    }

    buyCharacter(id) {
        const def = CHARACTER_DEFS[id];
        if (this.shopData.coins < def.price) return;

        this.shopData.coins -= def.price;
        this.shopData.characters[id] = { owned: true, level: 1, exp: 0 };
        this.achData.stats.charsBought++;
        this.saveShopData();
        this.saveAchData();
        this.checkTitleUnlocks();
        this.renderShop('characters');
    }

    buyTheme(id) {
        const def = THEME_DEFS[id];
        if (this.shopData.coins < def.price) return;

        this.shopData.coins -= def.price;
        this.shopData.themes[id] = { owned: true };
        this.achData.stats.themesBought++;
        this.saveShopData();
        this.saveAchData();
        this.checkTitleUnlocks();
        this.renderShop('themes');
    }

    equipCharacter(id) {
        this.shopData.equippedChar = id;
        this.saveShopData();
        // In-place update instead of full re-render
        this.els.shopGrid.querySelectorAll('.shop-card').forEach(card => {
            const btn = card.querySelector('.shop-card-btn');
            if (card.dataset.id === id) {
                card.classList.add('equipped');
                btn.textContent = '✅ 착용 중';
                btn.disabled = true;
            } else {
                if (card.classList.contains('equipped')) {
                    card.classList.remove('equipped');
                    btn.textContent = '착용하기';
                    btn.disabled = false;
                    btn.onclick = () => this.equipCharacter(card.dataset.id);
                }
            }
        });
    }

    equipTheme(id) {
        this.shopData.equippedTheme = id;
        this.applyTheme(id);
        this.saveShopData();
        // In-place update instead of full re-render
        this.els.shopGrid.querySelectorAll('.shop-card').forEach(card => {
            const btn = card.querySelector('.shop-card-btn');
            if (card.dataset.id === id) {
                card.classList.add('equipped');
                btn.textContent = '✅ 적용 중';
                btn.disabled = true;
            } else {
                if (card.classList.contains('equipped')) {
                    card.classList.remove('equipped');
                    btn.textContent = '적용하기';
                    btn.disabled = false;
                    btn.onclick = () => this.equipTheme(card.dataset.id);
                }
            }
        });
    }

    // --- Titles ---
    renderTitlesScreen() {
        const scrollPos = this.els.titlesGrid.scrollTop;
        this.els.titlesGrid.innerHTML = '';

        // Unlocked titles first
        const unlocked = TITLE_DEFS.filter(t => this.achData.unlocked.includes(t.id));
        const locked = TITLE_DEFS.filter(t => !this.achData.unlocked.includes(t.id));

        if (unlocked.length > 0) {
            const header = document.createElement('h3');
            header.className = 'titles-section-header';
            header.innerText = '✨ 획득한 칭호';
            this.els.titlesGrid.appendChild(header);

            unlocked.forEach(t => {
                const isEquipped = this.achData.equippedTitle === t.id;
                const card = document.createElement('div');
                card.className = `title-card ${isEquipped ? 'equipped' : ''}`;
                card.dataset.id = t.id;
                card.innerHTML = `
                    <span class="title-icon">${t.icon}</span>
                    <div class="title-info">
                        <strong>${t.name}</strong>
                        <small>${t.desc}</small>
                    </div>
                    <button class="title-equip-btn">${isEquipped ? '✅ 착용 중' : '착용'}</button>
                `;
                if (!isEquipped) {
                    card.querySelector('.title-equip-btn').addEventListener('click', () => this.equipTitle(t.id));
                }
                this.els.titlesGrid.appendChild(card);
            });
        }

        if (locked.length > 0) {
            const header = document.createElement('h3');
            header.className = 'titles-section-header';
            header.innerText = '🔒 미획득';
            this.els.titlesGrid.appendChild(header);

            locked.forEach(t => {
                const card = document.createElement('div');
                card.className = 'title-card locked';
                card.innerHTML = `
                    <span class="title-icon">🔒</span>
                    <div class="title-info">
                        <strong>${t.name}</strong>
                        <small>${t.desc}</small>
                    </div>
                `;
                this.els.titlesGrid.appendChild(card);
            });
        }
        this.els.titlesGrid.scrollTop = scrollPos;
    }

    checkTitleUnlocks() {
        let newUnlocks = [];
        TITLE_DEFS.forEach(t => {
            if (!this.achData.unlocked.includes(t.id)) {
                if (t.check(this.achData.stats, this.progress)) {
                    this.achData.unlocked.push(t.id);
                    newUnlocks.push(t);
                }
            }
        });

        if (newUnlocks.length > 0) {
            this.saveAchData();
            // Show first new title unlock
            const t = newUnlocks[0];
            document.getElementById('title-unlock-icon').innerText = t.icon;
            document.getElementById('title-unlock-text').innerText = `${t.icon} "${t.name}" — ${t.desc}`;
            document.getElementById('modal-title-unlock').classList.remove('hidden');
        }
    }

    equipTitle(id) {
        this.achData.equippedTitle = id;
        this.saveAchData();
        // In-place update instead of full re-render
        this.els.titlesGrid.querySelectorAll('.title-card').forEach(card => {
            const btn = card.querySelector('.title-equip-btn');
            if (!btn) return; // locked cards have no button
            if (card.dataset.id === id) {
                card.classList.add('equipped');
                btn.textContent = '✅ 착용 중';
                btn.disabled = true;
            } else {
                if (card.classList.contains('equipped')) {
                    card.classList.remove('equipped');
                    btn.textContent = '착용';
                    btn.disabled = false;
                    btn.onclick = () => this.equipTitle(card.dataset.id);
                }
            }
        });
    }
}

// Initialize Game on Load
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
