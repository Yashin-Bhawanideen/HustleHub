const { getMonthlyIncomeArray, TaxCalc } = require('../utils/TaxCalc');

async function getSummary(req, res, next) {
    try {
        const freelancerId = req.user._id;
        const taxYearStart = parseInt(req.query.taxYearStart, 10) || 2026;
        const monthsElapsed = parseInt(req.query.monthsElapsed, 10) || new Date().getMonth() >= 2 ? new Date().getMonth() - 2 + 1 : new Date().getMonth() + 10;

        const elapsed = Math.min(Math.max(monthsElapsed, 1), 12);

        const monthlyIncomeArray = await getMonthlyIncomeArray(freelancerId, taxYearStart);
        const taxCalc = new TaxCalc(monthlyIncomeArray);

        const yearlyIncome = taxCalc.GetAnnualIncome(elapsed);
        const taxBracket = taxCalc.GetTaxBracket(yearlyIncome);
        const yearlyTax = taxCalc.CalcYearlyTax(yearlyIncome);
        const yearlyNetIncome = taxCalc.CalcYearlyNetIncome(yearlyIncome);
        const monthlyTax = taxCalc.CalcMonthlyTax(yearlyIncome);
        const monthlyNetIncome = taxCalc.CalcMonthlyNetIncome(yearlyIncome);

        //tax year months incude the following
        const taxYearMonths = [
            'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February'
        ];

        const chartData = monthlyIncomeArray.map((income, index) => ({
            month: taxYearMonths[index],
            income
        }));

        return res.status(200).json({
            success: true, 
            taxYear: '${taxYearStart}/${taxYearStart + 1}',
            monthsElapsed, elapsed,
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

module.exports = { getSummary};