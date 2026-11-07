import {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Notifications from '../components/Notifications.jsx';

export default function FreelancerTax() {
    const {user, logout } = useAuth();
    const { data, setData} = useState(null);
    const { loading, setLoading } = useState(true);
    const { error, setError } = useState('');

    
    useEffect(() => {
        async function loadTaxData() {
            try {
                const response = await api.getSummary();
                setData(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadTaxData();
    }, []);

    const maxIncome = data ? chartData ? Math.max(...data.chartData.map(d => d.income), 1000) : 1000 : 1000;

    return (
        <main className="freelancer-Dashboard">
            <header className="dashboard-header">

                <div>

                    <h1>Tax Summary</h1>
                    <p>SARS Tax Year {data?.taxYear || '2026/2027'} Projections</p>

                </div>

                <div>
                    <Link to="/freelancer">Back to dashboard</Link>
                    <button type="button" className="Link-Button" onClick={logout}>Logout</button> 
                </div>

            </header>

            <Notifications />

            <section className="gig-dashboard">
                {error && <p className="form-error" role="alert"> {error} </p>}

                {loading ? (
                    <p>Calculate tax estimation...</p>
                ) :  !data ? (
                    <p>No data available</p>
                ) : (

                    <>
                        {/* summary*/}
                        <div className="gig-list" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginBottom: '2rem' }}>
                            <article className="gig-card" style={{ minHeight: 'auto' }}>
                                
                                <div className="gig-card-content">

                                    <p className="gig-name">Estimated Annual Tax ({data.summary.taxBracket.rate * 100}%)</p>
                                    <p className="gig-amount" style={{ color: 'var(--danger)' }}>R {data.summary.yearlyTax.toFixed(2)}</p>

                                </div>

                            </article>

                            <article className="gig-card" style={{ minHeight: 'auto' }}> 

                                <div className="gig-card-content"> 

                                    <p className="gig-name">Projected Net Annual Income</p>
                                    <p className="gig-amount" style={{ color: 'var(--ok)' }}>R {data.summary.yearlyNetIncome.toFixed(2)}</p>

                                </div>

                            </article>

                        </div>



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
                                                    height: '${Math.max(heightPercent, 4)}%',
                                                    background: item.income > 0 ? 'var(--freelancer)' : 'var(--line)',
                                                    borderRadius: '4px 4px 0 0',
                                                    transition: 'height 0.3s ease'
                                                }}

                                                title={`${item.month}: R ${item.income}`}

                                            />

                                            <span style={{ fontSize: '0.75rem', marginTop: '8px', color: 'var(--muted)', writingMode: 'horizontal-tb' }}>
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
