/**
 * 双色球查询应用
 * 使用 TypeScript 代码
 */

// 类型定义
interface LotteryNumber {
    red_balls: number[];
    blue_ball: number;
}

interface LotteryResult {
    code: string;
    date: string;
    red_balls: number[];
    blue_ball: number;
    prize_type: number;
    prize_name: string;
    prize_count: string;
    prize_amount: string;
}

interface QueryResponse {
    input_numbers: LotteryNumber;
    matched_results: LotteryResult[];
    total_matches: number;
}

interface Statistics {
    total_draws: number;
    date_range: {
        earliest: string;
        latest: string;
    };
    prize_statistics: {
        "一等奖": number;
        "二等奖": number;
    };
}

// 最新开奖号码接口
interface LatestDraw {
    code: string;
    date: string;
    red_balls: number[];
    blue_ball: number;
    sales_amount?: string;
    prize_pool_amount?: string;
}

// 应用状态
class LotteryApp {
    private selectedRedBalls: Set<number> = new Set();
    private selectedBlueBall: number | null = null;
    private readonly API_BASE_URL: string = 'https://api.35mix.com/lottery';

    constructor() {
        this.initializeApp();
    }

    /**
     * 初始化应用
     */
    private initializeApp(): void {
        this.createBallElements();
        this.bindEvents();
        this.loadStatistics();
        this.loadLatestDraw();
    }

    /**
     * 创建球元素
     */
    private createBallElements(): void {
        // 创建红球
        const redContainer = document.getElementById('redBalls');
        if (redContainer) {
            for (let i = 1; i <= 33; i++) {
                const ball = this.createBall(i, false);
                redContainer.appendChild(ball);
            }
        }

        // 创建蓝球
        const blueContainer = document.getElementById('blueBalls');
        if (blueContainer) {
            for (let i = 1; i <= 16; i++) {
                const ball = this.createBall(i, true);
                blueContainer.appendChild(ball);
            }
        }
    }

    /**
     * 创建球元素
     */
    private createBall(number: number, isBlue: boolean): HTMLElement {
        const ball = document.createElement('div');
        ball.className = `ball ${isBlue ? 'blue-ball' : ''}`;
        ball.textContent = number.toString();
        ball.dataset.number = number.toString();
        ball.dataset.type = isBlue ? 'blue' : 'red';
        
        ball.addEventListener('click', () => this.handleBallClick(ball, isBlue));
        
        return ball;
    }

    /**
     * 处理球点击事件
     */
    private handleBallClick(ball: HTMLElement, isBlue: boolean): void {
        const number = parseInt(ball.dataset.number || '0');
        
        if (isBlue) {
            this.handleBlueBallClick(ball, number);
        } else {
            this.handleRedBallClick(ball, number);
        }
        
        this.updateSelectedInfo();
        this.updateQueryButton();
    }

    /**
     * 处理红球点击
     */
    private handleRedBallClick(ball: HTMLElement, number: number): void {
        if (this.selectedRedBalls.has(number)) {
            this.selectedRedBalls.delete(number);
            ball.classList.remove('selected');
        } else if (this.selectedRedBalls.size < 6) {
            this.selectedRedBalls.add(number);
            ball.classList.add('selected');
        } else {
            this.showError('最多只能选择6个红球');
        }
    }

    /**
     * 处理蓝球点击
     */
    private handleBlueBallClick(ball: HTMLElement, number: number): void {
        // 清除之前选中的蓝球
        const blueBalls = document.querySelectorAll('.ball.blue-ball');
        blueBalls.forEach(b => b.classList.remove('selected'));
        
        if (this.selectedBlueBall === number) {
            this.selectedBlueBall = null;
        } else {
            this.selectedBlueBall = number;
            ball.classList.add('selected');
        }
    }

    /**
     * 更新选择信息显示
     */
    private updateSelectedInfo(): void {
        const redSelected = document.getElementById('redSelected');
        const blueSelected = document.getElementById('blueSelected');
        
        if (redSelected) {
            redSelected.textContent = `已选择: ${this.selectedRedBalls.size}/6`;
        }
        
        if (blueSelected) {
            blueSelected.textContent = `已选择: ${this.selectedBlueBall ? 1 : 0}/1`;
        }
    }

    /**
     * 更新查询按钮状态
     */
    private updateQueryButton(): void {
        const queryBtn = document.getElementById('queryBtn') as HTMLButtonElement;
        if (queryBtn) {
            const isValid = this.selectedRedBalls.size === 6 && this.selectedBlueBall !== null;
            queryBtn.disabled = !isValid;
        }
    }

    /**
     * 绑定事件
     */
    private bindEvents(): void {
        // 清空按钮
        const clearRedBtn = document.getElementById('clearRed');
        const clearBlueBtn = document.getElementById('clearBlue');
        
        if (clearRedBtn) {
            clearRedBtn.addEventListener('click', () => this.clearRedBalls());
        }
        
        if (clearBlueBtn) {
            clearBlueBtn.addEventListener('click', () => this.clearBlueBalls());
        }

        // 查询按钮
        const queryBtn = document.getElementById('queryBtn');
        if (queryBtn) {
            queryBtn.addEventListener('click', () => this.queryPrize());
        }

        // 错误提示关闭按钮
        const closeErrorBtn = document.getElementById('closeError');
        if (closeErrorBtn) {
            closeErrorBtn.addEventListener('click', () => this.hideError());
        }
    }

    /**
     * 清空红球选择
     */
    private clearRedBalls(): void {
        this.selectedRedBalls.clear();
        const redBalls = document.querySelectorAll('.ball:not(.blue-ball)');
        redBalls.forEach(ball => ball.classList.remove('selected'));
        this.updateSelectedInfo();
        this.updateQueryButton();
    }

    /**
     * 清空蓝球选择
     */
    private clearBlueBalls(): void {
        this.selectedBlueBall = null;
        const blueBalls = document.querySelectorAll('.ball.blue-ball');
        blueBalls.forEach(ball => ball.classList.remove('selected'));
        this.updateSelectedInfo();
        this.updateQueryButton();
    }

    /**
     * 查询中奖情况
     */
    private async queryPrize(): Promise<void> {
        if (this.selectedRedBalls.size !== 6 || this.selectedBlueBall === null) {
            this.showError('请选择6个红球和1个蓝球');
            return;
        }

        const lotteryNumber: LotteryNumber = {
            red_balls: Array.from(this.selectedRedBalls).sort((a, b) => a - b),
            blue_ball: this.selectedBlueBall
        };

        this.setLoading(true);

        try {
            const response = await fetch(`${this.API_BASE_URL}/api/check-prize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lotteryNumber)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: QueryResponse = await response.json();
            this.displayResults(data);
        } catch (error) {
            console.error('查询失败:', error);
            this.showError('查询失败，请检查服务器连接');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * 显示查询结果
     */
    private displayResults(data: QueryResponse): void {
        const resultSection = document.getElementById('resultSection');
        if (!resultSection) return;

        // 显示输入号码
        this.displayInputNumbers(data.input_numbers);
        
        // 显示结果统计
        this.displayResultSummary(data);
        
        // 显示中奖记录
        this.displayPrizeList(data.matched_results);
        
        // 显示结果区域
        resultSection.style.display = 'block';
        
        // 滚动到结果区域
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * 显示输入号码
     */
    private displayInputNumbers(inputNumbers: LotteryNumber): void {
        const inputDisplay = document.getElementById('inputDisplay');
        if (!inputDisplay) return;

        inputDisplay.innerHTML = '';
        
        // 显示红球
        inputNumbers.red_balls.forEach(number => {
            const ball = this.createDisplayBall(number, false);
            inputDisplay.appendChild(ball);
        });
        
        // 显示蓝球
        const blueBall = this.createDisplayBall(inputNumbers.blue_ball, true);
        inputDisplay.appendChild(blueBall);
    }

    /**
     * 创建显示用的球元素
     */
    private createDisplayBall(number: number, isBlue: boolean): HTMLElement {
        const ball = document.createElement('div');
        ball.className = `ball ${isBlue ? 'blue-ball selected' : 'selected'}`;
        ball.textContent = number.toString();
        return ball;
    }

    /**
     * 显示结果统计
     */
    private displayResultSummary(data: QueryResponse): void {
        const resultSummary = document.getElementById('resultSummary');
        if (!resultSummary) return;

        if (data.total_matches === 0) {
            resultSummary.innerHTML = `
                <h3>🎉 恭喜！</h3>
                <p>您的号码在历史开奖中未中过一等奖或二等奖，说明这是一个独特的组合！</p>
            `;
        } else {
            resultSummary.innerHTML = `
                <h3>🏆 中奖记录</h3>
                <p>您的号码在历史开奖中中过 <strong>${data.total_matches}</strong> 次一等奖或二等奖</p>
            `;
        }
    }

    /**
     * 显示中奖记录列表
     */
    private displayPrizeList(results: LotteryResult[]): void {
        const prizeList = document.getElementById('prizeList');
        if (!prizeList) return;

        if (results.length === 0) {
            prizeList.innerHTML = '<p style="text-align: center; color: #718096;">暂无中奖记录</p>';
            return;
        }

        prizeList.innerHTML = results.map(result => `
            <div class="prize-item ${result.prize_type === 2 ? 'second-prize' : ''}">
                <div class="prize-header">
                    <div class="prize-title">${result.prize_name}</div>
                    <div class="prize-date">${result.date} (第${result.code}期)</div>
                </div>
                <div class="prize-numbers">
                    ${result.red_balls.map(num => `<div class="ball selected">${num}</div>`).join('')}
                    <div class="ball blue-ball selected">${result.blue_ball}</div>
                </div>
                <div class="prize-details">
                    <span>中奖注数: ${result.prize_count}</span>
                    <span class="prize-amount">奖金: ${result.prize_amount}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * 加载统计信息
     */
    private async loadStatistics(): Promise<void> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/statistics`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Statistics = await response.json();
            this.displayStatistics(data);
        } catch (error) {
            console.error('加载统计信息失败:', error);
        }
    }

    /**
     * 显示统计信息
     */
    private displayStatistics(data: Statistics): void {
        const totalDraws = document.getElementById('totalDraws');
        const firstPrize = document.getElementById('firstPrize');
        const secondPrize = document.getElementById('secondPrize');

        if (totalDraws) totalDraws.textContent = data.total_draws.toString();
        if (firstPrize) firstPrize.textContent = data.prize_statistics["一等奖"].toString();
        if (secondPrize) secondPrize.textContent = data.prize_statistics["二等奖"].toString();
    }

    /**
     * 设置加载状态
     */
    private setLoading(loading: boolean): void {
        const queryBtn = document.getElementById('queryBtn') as HTMLButtonElement;
        const btnText = queryBtn?.querySelector('.btn-text');
        const loadingSpinner = document.getElementById('loadingSpinner');

        if (queryBtn) {
            queryBtn.disabled = loading;
        }

        if (btnText) {
            btnText.textContent = loading ? '查询中...' : '查询中奖情况';
        }

        if (loadingSpinner) {
            loadingSpinner.style.display = loading ? 'inline-block' : 'none';
        }
    }

    /**
     * 显示错误信息
     */
    private showError(message: string): void {
        const errorToast = document.getElementById('errorToast');
        const errorMessage = document.getElementById('errorMessage');

        if (errorToast && errorMessage) {
            errorMessage.textContent = message;
            errorToast.style.display = 'flex';
            
            // 3秒后自动隐藏
            setTimeout(() => this.hideError(), 3000);
        }
    }

    /**
     * 隐藏错误信息
     */
    private hideError(): void {
        const errorToast = document.getElementById('errorToast');
        if (errorToast) {
            errorToast.style.display = 'none';
        }
    }

    /**
     * 加载最新开奖号码
     */
    private async loadLatestDraw(): Promise<void> {
        try {
            const response = await fetch(`${this.API_BASE_URL}/api/latest-draw`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: LatestDraw = await response.json();
            this.displayLatestDraw(data);
        } catch (error) {
            console.error('加载最新开奖号码失败:', error);
        }
    }

    /**
     * 显示最新开奖号码
     */
    private displayLatestDraw(data: LatestDraw): void {
        const latestDrawSection = document.getElementById('latestDrawSection');
        if (!latestDrawSection) return;

        // 格式化日期
        const formatDate = (dateStr: string) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        // 格式化金额
        const formatAmount = (amount: string | undefined) => {
            if (!amount) return '未知';
            return amount;
        };

        latestDrawSection.innerHTML = `
            <p><strong>第${data.code}期</strong> | 开奖日期: ${formatDate(data.date)}</p>
            <div style="margin: 15px 0;">
                <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
                    ${data.red_balls.map(num => `<span class="ball selected">${num}</span>`).join('')}
                    <span class="ball blue-ball selected">${data.blue_ball}</span>
                </div>
            </div>
        `;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new LotteryApp();
}); 