import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Notifications from '../components/Notifications.jsx';
/**
 * FreelancerTax page
 * Shows a freelancer their projected annual income, estimated tax
 * (based on SARS tax brackets), projected net income, and a bar chart
 * of accepted booking revenue for each month of the tax year.
 */
export default function FreelancerTax() {
     // Tax summary and chart data returned from the API (null until loaded)
    const { user, logout } = useAuth();
    // True while the tax data is still being fetched
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
     // Holds an error message if the request fails
    const [error, setError] = useState('');

    // Runs once when the component mounts (empty dependency array)
    useEffect(() => {
        async function loadTaxData() {
            try {
                const response = await api.getSummary();
                setData(response);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadTaxData();
    }, []);

     // The highest monthly income, used to scale the bar heights in the chart.
    // 1000 is included as a minimum so the chart still scales sensibly
    // when income is low or zero (and avoids dividing by zero).
    const maxIncome = data?.chartData ? Math.max(...data.chartData.map(d => d.income), 1000) : 1000;

    return (
        <main className="freelancer-Dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Tax Summary</h1>
                    <p>SARS Tax Year {data?.taxYear || '2026/2027'} Projections</p>
                </div>

                <div>
                    <Link to="/freelancer">Back to dashboard</Link>
                    <button type="button" className="link-button" onClick={logout}>Logout</button> 
                </div>
            </header>

            <section className="gig-dashboard">
                {error && <p className="form-error" role="alert"> {error} </p>}

                {loading ? (
                    <p>Calculate tax estimation...</p>
                ) : !data ? (
                    <p>No data available</p>
                ) : (
                    <>
                        {/* summary */}
                        <div className="gig-list" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginBottom: '2rem' }}>
                            <article className="gig-card" style={{ minHeight: 'auto' }}>
                                <div className="gig-card-content">
                                    <p className="gig-name">Projected Annual Income</p>
                                    <p className="gig-amount">R {Number(data.summary.yearlyIncome || 0).toFixed(2)}</p>
                                </div>
                            </article>

                            <article className="gig-card" style={{ minHeight: 'auto' }}>
                                <div className="gig-card-content">
                                    <p className="gig-name">Estimated Annual Tax ({Number(data.summary.taxBracket?.rate || 0) * 100}%)</p>
                                    <p className="gig-amount" style={{ color: 'var(--danger)' }}>R {Number(data.summary.yearlyTax || 0).toFixed(2)}</p>
                                </div>
                            </article>

                            <article className="gig-card" style={{ minHeight: 'auto' }}> 
                                <div className="gig-card-content"> 
                                    <p className="gig-name">Projected Net Annual Income</p>
                                    <p className="gig-amount" style={{ color: 'var(--ok)' }}>R {Number(data.summary.yearlyNetIncome || 0).toFixed(2)}</p>
                                </div>
                            </article>
                        </div>

                        {/* explanation of the tax calculation */}
                        <details
                            style={{
                                border: '1px solid var(--line)',
                                borderRadius: '6px',
                                padding: '0.75rem 1rem',
                                marginBottom: '2rem'
                            }}
                        >
                            <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                                How the tax is calculated
                            </summary>

                            <p style={{ marginTop: '0.75rem' }}>
                                Using the SARS rates of tax for individuals from 1 March 2026 to 28 February 2027,
                                the projected annual income decides which tax bracket applies. Income up to R245,100
                                is taxed at 18%. The rates are 26% up to R383,100, 31% up to R530,200, 36% up to
                                R695,800, 39% up to R887,000, 41% up to R1,878,600, and 45% above that.
                            </p>

                            <p>
                                The yearly tax for each bracket is a fixed base amount plus the rate of the bracket
                                applied to the part of the income above the start of the bracket. For example, a
                                projected income of R300,000 is in the 26% bracket, so the tax is R44,118 plus 26%
                                of the R54,900 above R245,100, which is R58,392. The projected net annual income is
                                the projected income minus this tax. The yearly amounts are divided by twelve to get
                                the monthly tax and monthly net income.
                            </p>
                        </details>

                        {/* chart */}
                        <div className="gig-form-section"> 
                            <h2>Monthly Income Breakdown (March – February)</h2>
                            <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>
                                Actual accepted booking revenue per tax month.
                            </p>

                            <div style={{ display: 'flex', alignItems: 'flex-end', height: '220px', gap: '12px', paddingBottom: '10px', borderBottom: '2px solid var(--line)' }}>
                                {data.chartData.map((item, idx) => {
                                    const heightPercent = (item.income / maxIncome) * 100;

                                    return (
                                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                                                {item.income > 0 ? `R${item.income}` : ''}
                                            </span>

                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: `${Math.max(heightPercent, 4)}%`,
                                                    background: item.income > 0 ? 'var(--freelancer)' : 'var(--line)',
                                                    borderRadius: '4px 4px 0 0',
                                                    transition: 'height 0.3s ease'
                                                }}
                                                title={`${item.month}: R ${item.income}`}
                                            />

                                            <span style={{ fontSize: '0.75rem', marginTop: '8px', color: 'var(--muted)' }}>
                                                {item.month.slice(0, 3)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
