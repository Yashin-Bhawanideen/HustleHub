// month income * 12 = yearly income estimate
// get tax bracket
// calculate tax
// calculate net income

// https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/   (tax brackets for 1 march 2026 - 28 february 2027)


const Booking = require('../models/Booking');
require('../models/Gig');


async function getMonthlyIncomeArray(freelancerId, taxYearStart) {

    const startDate = new Date(`${taxYearStart}-03-01`);
    const endDate = new Date(`${taxYearStart + 1}-02-28T23:59:59.999Z`);

    const monthlyTotals = await Booking.aggregate([
        {
            $match: {
                freelancer: freelancerId,
                status: 'Accepted',
                bookingDate: { $gte: startDate, $lte: endDate }
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

    GetTaxBracket(annualIncome){
        // get tax bracket
        let bracketInfo = {};

        switch (true) {
            case annualIncome < 245100:
                bracketInfo = { rate: 0.18, baseAmount: 0, minTaxable: 0}
                break;
            case annualIncome < 383100:
                bracketInfo = {  rate: 0.31, baseAmount: 79998, minTaxable: 383100}
                break;
            case annualIncome < 530200:
                bracketInfo = { rate: 0.36, baseAmount: 125599, minTaxable: 530200 }
                break;
            case annualIncome < 695800:
                bracketInfo = { rate: 0.39, baseAmount: 185215, minTaxable: 695800 }
                break;
            case annualIncome < 887000:
                bracketInfo = { rate: 0.41, baseAmount: 259783, minTaxable: 887000 }
                break;
            case annualIncome < 1878600:
                bracketInfo = { rate: 0.45, baseAmount: 666339, minTaxable: 1878600 }
                break;        
        }

        this.currentTaxBracket = bracketInfo
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


module.exports = TaxCalc;