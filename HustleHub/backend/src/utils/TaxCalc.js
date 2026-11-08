// month income * 12 = yearly income estimate
// get tax bracket
// calculate tax
// calculate net income

// https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/   (tax brackets for 1 march 2026 - 28 february 2027)


const Booking = require('../models/Booking');
require('../models/Gig');

// here we get the monthly income array based with in each taxable year aka from 1 march 20xx - end of february 20xx +1

async function getMonthlyIncomeArray(freelancerId, taxYearStart) {

    // The tax year runs from 1 March up to (but not including) 1 March of the next year.
    // Using "before 1 March" instead of "28 February" also includes 29 February in leap years.
    const startDate = new Date(Date.UTC(taxYearStart, 2, 1));
    const endDate = new Date(Date.UTC(taxYearStart + 1, 2, 1));

    const monthlyTotals = await Booking.aggregate([
        {
            $match: {
                freelancer: freelancerId,
                status: 'Accepted',
                bookingDate: { $gte: startDate, $lt: endDate }
            }
        },
        {
            $lookup: {
                from: 'gigs',
                localField: 'gig',
                foreignField: '_id',
                as: 'gigDetails'
            }
        },
        {
            $unwind: '$gigDetails' 
        },
        {
            $group: {
                _id: { month: { $month: '$bookingDate' } },
                totalIncome: { $sum: '$gigDetails.amount' }
            }
        },
        { $sort: { '_id.month': 1 } }
    ]);


    const incomeArray = new Array(12).fill(0); 

    monthlyTotals.forEach(item => {
        const calendarMonth = item._id.month; 
        const taxYearIndex = (calendarMonth >= 3) ? (calendarMonth - 3) : (calendarMonth + 9);
        incomeArray[taxYearIndex] = item.totalIncome;
    });

    return incomeArray;
}


// SARS rates of tax for individuals, 1 March 2026 - 28 February 2027.
// Each row: income up to "upTo" is taxed at "baseAmount" + "rate" of the amount above "minTaxable".
const TAX_BRACKETS = [
    { upTo: 245100,   rate: 0.18, baseAmount: 0,      minTaxable: 0 },
    { upTo: 383100,   rate: 0.26, baseAmount: 44118,  minTaxable: 245100 },
    { upTo: 530200,   rate: 0.31, baseAmount: 79998,  minTaxable: 383100 },
    { upTo: 695800,   rate: 0.36, baseAmount: 125599, minTaxable: 530200 },
    { upTo: 887000,   rate: 0.39, baseAmount: 185215, minTaxable: 695800 },
    { upTo: 1878600,  rate: 0.41, baseAmount: 259783, minTaxable: 887000 },
    { upTo: Infinity, rate: 0.45, baseAmount: 666339, minTaxable: 1878600 }
];


class TaxCalc {
    constructor(monthlyIncomeArray) {
        if (!Array.isArray(monthlyIncomeArray)) {
            throw new Error('Monthly income must be an array.');
        }

        this.monthlyIncomeArray = monthlyIncomeArray;
        this.currentTaxBracket = null;
        this.yearlyIncome = 0;
        this.yearlyTax = 0;
    }


    //calculate annual income based on the included months within the year
    // based on the monthly income average then * by 12
    GetAnnualIncome(monthsIncluded){
        if (monthsIncluded <= 0 || monthsIncluded > 12) {
            throw new Error('Months elapsed must be between 1 and 12.');
        }
        
        // sum of months included
        const elapsedIncomeSum = this.monthlyIncomeArray
            .slice(0, monthsIncluded)
            .reduce((sum, income) => sum + income, 0);

        // average monthly income
        const averageMonthlyIncome = elapsedIncomeSum / monthsIncluded;
        
        this.yearlyIncome = averageMonthlyIncome * 12;
        return this.yearlyIncome;

    }


    // here we get the tax bracket based on the projected annual income 
    // and the sars tax brackets of the 2026 / 2027 financial year
    GetTaxBracket(annualIncome){
        // South African Revenue Service (2026)
        // find the first bracket whose upper limit covers the income
        const bracket = TAX_BRACKETS.find((row) => annualIncome <= row.upTo);

        const bracketInfo = {
            rate: bracket.rate,
            baseAmount: bracket.baseAmount,
            minTaxable: bracket.minTaxable
        };

        this.currentTaxBracket = bracketInfo;
        return bracketInfo;
    }

    CalcYearlyTax(yearlyIncome){
        //variables
        const bracketInfo = this.GetTaxBracket(yearlyIncome);

        // get excess amount
        const excessAmount = yearlyIncome - bracketInfo.minTaxable;

        // calc % of excess amount
        this.yearlyTax = bracketInfo.baseAmount + (excessAmount * bracketInfo.rate);
        return this.yearlyTax;

    }

    CalcYearlyNetIncome(){
        return this.yearlyIncome - this.yearlyTax;
    }

    CalcMonthlyTax(yearlyIncome){
        return this.CalcYearlyTax(yearlyIncome) /12;
    }

    CalcMonthlyNetIncome(){
        return this.CalcYearlyNetIncome() /12;
    }

    

}


module.exports = { getMonthlyIncomeArray, TaxCalc };



//South African Revenue Service (2026). Rates of tax for individuals. [online] South African Revenue Service. Available at: 
// https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/ [Accessed 7 Nov. 2026].