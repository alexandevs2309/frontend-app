export interface PosDailyStats {
    ventas: number;
    ingresos: number;
    ticketPromedio: number;
}

const EMPTY_STATS: PosDailyStats = { ventas: 0, ingresos: 0, ticketPromedio: 0 };

function getStatsKey(userId: number): string {
    return `estadisticas_pos_user_${userId}`;
}

function getStatsDateKey(userId: number): string {
    return `estadisticas_pos_fecha_user_${userId}`;
}

function getArqueoHistoryKey(userId: number): string {
    return `arqueos_historicos_user_${userId}`;
}

export function getUserIdFromStorage(): number {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return 0;
        const user = JSON.parse(userStr);
        return Number(user?.id) || 0;
    } catch {
        return 0;
    }
}

export function loadDailyStats(userId: number): PosDailyStats {
    try {
        const dateKey = getStatsDateKey(userId);
        const statsKey = getStatsKey(userId);
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem(dateKey);

        if (savedDate !== today) {
            localStorage.setItem(statsKey, JSON.stringify(EMPTY_STATS));
            localStorage.setItem(dateKey, today);
            return EMPTY_STATS;
        }

        const savedStats = localStorage.getItem(statsKey);
        if (!savedStats) {
            localStorage.setItem(dateKey, today);
            return EMPTY_STATS;
        }

        const parsed = JSON.parse(savedStats);
        return {
            ventas: Number(parsed?.ventas) || 0,
            ingresos: Number(parsed?.ingresos) || 0,
            ticketPromedio: Number(parsed?.ticketPromedio) || 0
        };
    } catch {
        return EMPTY_STATS;
    }
}

export function saveDailyStats(userId: number, stats: PosDailyStats): void {
    const dateKey = getStatsDateKey(userId);
    const statsKey = getStatsKey(userId);
    localStorage.setItem(statsKey, JSON.stringify(stats));
    localStorage.setItem(dateKey, new Date().toDateString());
}

export function saveArqueoHistory(userId: number, arqueo: any, maxEntries: number = 50): void {
    const key = getArqueoHistoryKey(userId);
    const saved = localStorage.getItem(key);
    const list = saved ? JSON.parse(saved) : [];
    list.unshift(arqueo);
    const trimmed = list.slice(0, maxEntries);
    localStorage.setItem(key, JSON.stringify(trimmed));
}

export function loadArqueoHistory(userId: number): any[] {
    const key = getArqueoHistoryKey(userId);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
}
