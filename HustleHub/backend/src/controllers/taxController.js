const { getMonthlyIncomeArray, TaxCalc } = require('../utils/TaxCalc');
/**
 * getSummary
 * Returns the logged-in freelancer's tax summary for a tax year:
 * projected annual income, estimated tax, net income, and the monthly
 * income data used for the chart on the FreelancerTax page.
 */
async function getSummary(req, res, next) {
    try {
        const freelancerId = req.user._id;
        // The tax year can be chosen with ?taxYearStart=2026 in the URL.
        // parseInt(..., 10) converts it to a number; defaults to 2026 if missing or invalid
        const taxYearStart = parseInt(req.query.taxYearStart, 10) || 2026;
        
        const now = new Date();
        const currentMonth = now.getMonth(); // 0 - 11
        const currentYear = now.getFullYear();

        // Work out how many months of the tax year (March to February) have passed.
        // This is used to project a full-year income from the months so far.
        let elapsed = 12;
        if (currentYear === taxYearStart) {
            elapsed = currentMonth >= 2 ? currentMonth - 2 + 1 : 1;
        } else if (currentYear > taxYearStart + 1 || (currentYear === taxYearStart + 1 && currentMonth > 1)) {
            elapsed = 12;
        } else if (currentYear === taxYearStart + 1) {
            elapsed = currentMonth + 10; 
        }
        // Safety clamp so elapsed is always between 1 and 12
        // (also prevents dividing by zero in the projection)
        elapsed = Math.min(Math.max(elapsed, 1), 12);

        const monthlyIncomeArray = await getMonthlyIncomeArray(freelancerId, taxYearStart);
        const taxCalc = new TaxCalc(monthlyIncomeArray);

        // Projected income for the full year, based on the months elapsed so far
        const yearlyIncome = taxCalc.GetAnnualIncome(elapsed);
         // Find which SARS tax bracket that projected income falls into
        const taxBracket = taxCalc.GetTaxBracket(yearlyIncome);
        // Estimated tax for the year, and the income left after tax
        const yearlyTax = taxCalc.CalcYearlyTax(yearlyIncome);
        const yearlyNetIncome = taxCalc.CalcYearlyNetIncome();
        // The same figures broken down per month
        const monthlyTax = taxCalc.CalcMonthlyTax(yearlyIncome);
        const monthlyNetIncome = taxCalc.CalcMonthlyNetIncome();

       // tax year months include the following
        // The South African tax year runs March to February,
        // so index 0 of the income array is March and index 11 is February
        const taxYearMonths = [
            'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February'
        ];

        const chartData = monthlyIncomeArray.map((income, index) => ({
            month: taxYearMonths[index],
            income
        }));

        // Send everything back to the frontend (FreelancerTax page)
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
