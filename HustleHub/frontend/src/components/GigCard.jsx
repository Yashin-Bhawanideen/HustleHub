export default function GigCard({ gig, onEdit, onDelete }) {
  return (
    // article is a semantic HTML element for a self-contained piece of
    // content, such as a card
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

// Reference List
// MDN Web Docs Destructuring assignment. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring (Accessed: 12 October 2026).
// MDN Web Docs <article>: The Article Contents element. Available at: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/article (Accessed: 12 October 2026).
