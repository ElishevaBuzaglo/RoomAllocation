import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="hero-section">
        <h1 className="hero-title">
          ניהול חדרים <span className="highlight">חכם</span> <br />
          לסמינר שלכם
        </h1>
        <p className="hero-subtitle">
          מערכת מתקדמת לשיבוץ, מעקב וניהול חדרים בזמן אמת. 
          ייעלו את העבודה וחסכו זמן יקר בניהול המשאבים.
        </p>
        <div className="hero-btns">
          <Link to="/roomList" className="btn-primary">לרשימת החדרים</Link>
          <button className="btn-secondary">למידע נוסף</button>
        </div>
      </header>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>מעקב בזמן אמת</h3>
          <p>צפייה בסטטוס החדרים המעודכן ביותר בכל רגע נתון.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>שיבוץ מהיר</h3>
          <p>ממשק משתמש נוח המאפשר שיבוץ חדרים בלחיצת כפתור.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>ניהול מאובטח</h3>
          <p>כל הנתונים שלכם שמורים ומגובים בענן בשיטות המתקדמות ביותר.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;