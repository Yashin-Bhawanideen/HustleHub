import { useEffect, useState } from 'react';

const emptyForm = {
  name: '',
  title: '',
  description: '',
  amount: ''
};

export default function GigForm({
  gig,
  onSubmit,
  onCancel,
  saving
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const editing = Boolean(gig);

  useEffect(() => {
    if (gig) {
      setForm({
        name: gig.name || '',
        title: gig.title || '',
        description: gig.description || '',
        amount: gig.amount ?? ''
      });
    } else {
      setForm(emptyForm);
    }

    setError('');
  }, [gig]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!form.title.trim()) {
      setError('Please enter a gig title.');
      return;
    }

    if (!form.description.trim()) {
      setError('Please enter a gig description.');
      return;
    }

    if (form.amount === '' || Number(form.amount) < 0) {
      setError('Please enter a valid amount.');
      return;
    }

    try {
      await onSubmit({
        name: form.name.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        amount: Number(form.amount)
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="gig-form-section">
      <h2>{editing ? 'Edit Gig' : 'Create Gig'}</h2>

      <form onSubmit={handleSubmit} className="gig-form">
        <label>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            maxLength={100}
            disabled={saving}
          />
        </label>

        <label>
          Title
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Software Developer"
            maxLength={100}
            disabled={saving}
          />
        </label>

        <label>
          Gig Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the service you provide..."
            maxLength={2000}
            rows={6}
            disabled={saving}
          />
        </label>

        <label>
          Amount
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="e.g. 5000"
            min="0"
            step="0.01"
            disabled={saving}
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="gig-form-actions">
          <button type="submit" disabled={saving}>
            {saving
              ? 'Saving...'
              : editing
                ? 'Update Gig'
                : 'Create Gig'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}