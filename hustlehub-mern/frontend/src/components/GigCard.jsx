export default function GigCard({ gig, onEdit, onDelete }) {
  return (
    <article className="gig-card">
      <div className="gig-card-content">
        <h3>{gig.title}</h3>

        <p className="gig-name">
          {gig.name}
        </p>

        <p className="gig-description">
          {gig.description}
        </p>

        <p className="gig-amount">
          R {Number(gig.amount).toFixed(2)}
        </p>
      </div>

      <div className="gig-card-actions">
        <button
          type="button"
          onClick={() => onEdit(gig)}
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => onDelete(gig._id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}