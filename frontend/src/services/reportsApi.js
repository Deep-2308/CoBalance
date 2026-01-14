import api from './api';

/**
 * Reports API Service
 * 
 * Handles calls to the /reports endpoints
 */

/**
 * Get monthly report data
 * 
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2026)
 * @returns {Promise} - { dailyTotals, monthlyTotals, todaySpending, transactions }
 */
export const getMonthlyReport = async (month, year) => {
    const response = await api.get('/reports/monthly', {
        params: { month, year }
    });
    return response.data;
};

export default {
    getMonthlyReport
};
