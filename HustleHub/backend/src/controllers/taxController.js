const { getMonthlyIncomeArray, TaxCalc } = require('../utils/TaxCalc');

async function getSummary(req, res, next) {
    try {
        const freelancerId = req.user._id;
        const taxYearStart = parseInt(req.query.taxYearStart, 10) || 2026;
        
        const now = new Date();
        const currentMonth = now.getMonth(); // 0 - 11
        const currentYear = now.getFullYear();

        let elapsed = 12;
        if (currentYear === taxYearStart) {
            elapsed = currentMonth >= 2 ? currentMonth - 2 + 1 : 1;
        } else if (currentYear > taxYearStart + 1 || (currentYear === taxYearStart + 1 && currentMonth > 1)) {
            elapsed = 12;
        } else if (currentYear === taxYearStart + 1) {
            elapsed = currentMonth + 10; 
        }
        elapsed = Math.min(Math.max(elapsed, 1), 12);

        const monthlyIncomeArray = await getMonthlyIncomeArray(freelancerId, taxYearStart);
        const taxCalc = new TaxCalc(monthlyIncomeArray);

        const yearlyIncome = taxCalc.GetAnnualIncome(elapsed);
        const taxBracket = taxCalc.GetTaxBracket(yearlyIncome);
        const yearlyTax = taxCalc.CalcYearlyTax(yearlyIncome);
        const yearlyNetIncome = taxCalc.CalcYearlyNetIncome();
        const monthlyTax = taxCalc.CalcMonthlyTax(yearlyIncome);
        const monthlyNetIncome = taxCalc.CalcMonthlyNetIncome();

        // tax year months include the following
        const taxYearMonths = [
            'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February'
        ];

        const chartData = monthlyIncomeArray.map((income, index) => ({
            month: taxYearMonths[index],
            income
        }));

        return res.status(200).json({
            success: true, 
            taxYear: `${taxYearStart}/${taxYearStart + 1}`,
            monthsElapsed: elapsed,
            chartData,
            summary: {
                yearlyIncome,
                taxBracket,
                yearlyTax,
                yearlyNetIncome,
                monthlyTax,
                monthlyNetIncome
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { getSummary };
