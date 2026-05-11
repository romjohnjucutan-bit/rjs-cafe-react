export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">RJ's <em>Café</em></div>
          <p>Crafted coffee, curated moments. A place to slow down and savor the everyday.</p>
        </div>
        <div>
          <h4>Visit Us</h4>
          <ul>
            <li><i className="fas fa-map-marker-alt"></i> Imus, Cavite, Philippines</li>
            <li><i className="fas fa-phone"></i> +63 917 123 4567</li>
            <li><i className="fas fa-envelope"></i> hello@rjscafe.ph</li>
          </ul>
        </div>
        <div>
          <h4>Hours</h4>
          <ul>
            <li><i className="fas fa-clock"></i> Mon–Thu · 7:00am – 9:00pm</li>
            <li><i className="fas fa-clock"></i> Fri–Sat · 7:00am – 10:00pm</li>
            <li><i className="fas fa-clock"></i> Sunday · 8:00am – 8:00pm</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        © {year} RJ's Café · All rights reserved · <a href="/admin/login" style={{ color: 'var(--text-l)' }}>Staff Portal</a>
      </div>
    </footer>
  )
}
