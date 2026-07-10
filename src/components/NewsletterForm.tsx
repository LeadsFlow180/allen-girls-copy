"use client";

export default function NewsletterForm() {
  return (
    <form
      className="newsletter-form"
      onSubmit={(e) => {
        e.preventDefault();
        alert("Thanks for subscribing! 🎉");
      }}
    >
      <input
        type="email"
        className="newsletter-input"
        placeholder="Your email address"
        required
      />
      <button type="submit" className="newsletter-btn">
        Subscribe →
      </button>
    </form>
  );
}
