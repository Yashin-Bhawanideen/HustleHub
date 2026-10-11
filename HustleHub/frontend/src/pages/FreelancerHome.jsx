import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; //
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import GigForm from '../components/GigForm.jsx';
import GigCard from '../components/GigCard.jsx';

export default function FreelancerHome() {
  const { user, logout } = useAuth();

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingGig, setEditingGig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadGigs() {
      try {
        setError('');

        const data = await api.getMyGigs();

        setGigs(data.gigs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadGigs();
  }, []);

  async function handleCreateOrUpdate(gigData) {
    setSaving(true);

    try {
      if (editingGig) {
        const data = await api.updateGig(
          editingGig._id,
          gigData
        );

        setGigs((current) =>
          current.map((gig) =>
            gig._id === editingGig._id
              ? data.gig
              : gig
          )
        );
      } else {
        const data = await api.createGig(gigData);

        setGigs((current) => [
          data.gig,
          ...current
        ]);
      }

      setShowForm(false);
      setEditingGig(null);
    } finally {
      setSaving(false);
    }
  }

  function handleCreateClick() {
    setEditingGig(null);
    setShowForm(true);
  }

  function handleEdit(gig) {
    setEditingGig(gig);
    setShowForm(true);
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this gig?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await api.deleteGig(id);

      setGigs((current) =>
        current.filter((gig) => gig._id !== id)
      );
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCancel() {
    setShowForm(false);
    setEditingGig(null);
  }

  return (
    <main className="freelancer-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Freelancer Dashboard</h1>

          <p>
            Welcome, {user?.name}
          </p>
        </div>

      <div>
        <Link to="/freelancer/bookings">View Bookings</Link>

        <button
          type="button"
          className="link-button"
          onClick={logout}
        >
          Log out
        </button>
      </div>
        
      </header>

      <section className="gig-dashboard">
        <div className="gig-section-header">
          <div>
            <h2>My Gigs</h2>

            <p>
              Create and manage the services you offer.
            </p>
          </div>

          {!showForm && (
            <button
              type="button"
              onClick={handleCreateClick}
            >
              + Create Gig
            </button>
          )}
        </div>

        {showForm && (
          <GigForm
            gig={editingGig}
            onSubmit={handleCreateOrUpdate}
            onCancel={handleCancel}
            saving={saving}
          />
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading your gigs...</p>
        ) : gigs.length === 0 ? (
          <p>
            You have not created any gigs yet.
          </p>
        ) : (
          <div className="gig-list">
            {gigs.map((gig) => (
              <GigCard
                key={gig._id}
                gig={gig}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}