// month income * 12 = yearly income estimate
// get tax bracket
// calculate tax
// calculate net income

// https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/   (tax brackets for 1 march 2026 - 28 february 2027)


const Booking = require('../models/Booking');
require('../models/Gig');


async function getMonthlyIncomeArray(freelancerId, year){
    const monthlyTotals = await Booking.aggregate([
        {
            $match: {
                freelancer: freelancerId,
                createdAt: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
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
            unwind: '$gigDetails'
        },
        {
            $group: {
                _id: {
                    month: { $month: '$bookingDate'}
                },
                totalIncome: { $sum: '$gigDetails.amount'} //sum amount per month
            }
        },
        { 
            $sort: {
                '_id.month': 1
            }
        }
    ])


    const incomeArray = new Array(12).fill(0); 

    monthlyTotals.forEach(item => {
        const monthIndex = item._id.month - 1;
        incomeArray[monthIndex] = item.totalIncome;
    })

    return incomeArray;
}

class TaxCalc {
    constructor(monthlyIncomeArray, ) {

        // check that its a array
        if (!Array.isArray(monthlyIncome)) {
            throw new Error('Monthly income must be an array.');
        }

        this.monthlyIncomeArray = monthlyIncomeArray;
        this.currentTaxBracket = null;
    
    }

    GetAnnualIncome(monthsIncluded){
        if (monthsElapsed <= 0 || monthsElapsed > 12) {
            throw new Error('Months elapsed must be between 1 and 12.');
        }
        
        // sum of months included
        const elapsedIncomeSum = this.monthlyIncome
            .slice(0, monthsElapsed)
            .reduce((sum, income) => sum + income, 0);

        // average monthly income
        const averageMonthlyIncome = elapsedIncomeSum / monthsElapsed;
        return averageMonthlyIncome * 12;
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

    // CalculateTax(incomeTax)

}