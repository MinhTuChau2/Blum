import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ProductsList from './pages/ProductsList';
import ArticlesList from './pages/ArticlesList';
import './App.css';
import './pages/ProductList.css';
import About from './pages/About';
import logo from './assets/Blum_logo2.png';
import productsIcon from './assets/products.png';
import articlesIcon from './assets/articles.png';
import flower1 from './assets/blue_flower.png';
import flower2 from './assets/orange_flower.png';
import flower3 from './assets/pink_flower.png';
import flower4 from './assets/purple_flower.png';
import flower5 from './assets/red_flower.png';
import aboutIcon from './assets/About.png'; // Adjust the path if needed
import Checkout from './pages/Checkout';
import Success from './pages/Success';
function RotatingFlowers({ zIndex }) {
  const flowerImages = [flower1, flower2, flower3, flower4, flower5];
  const flowerCount = 7;

  const getRandomImage = () =>
    flowerImages[Math.floor(Math.random() * flowerImages.length)];

  return (
    <>
      {Array.from({ length: flowerCount }).map((_, index) => {
        const top = Math.random() * 90;
        const left = Math.random() * 90;
        const size = 40 + Math.random() * 40;
        const rotateSpeed = 10 + Math.random() * 20;

        return (
          <img
            key={index}
            src={getRandomImage()}
            alt={`flower-${index}`}
            className="rotating-flower"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: `${rotateSpeed}s`,
              pointerEvents: 'none',
              zIndex: zIndex,
            }}
          />
        );
      })}
    </>
  );
}

function AppWrapper() {
  const location = useLocation();
  
  // If on /articles, set flowers behind everything
  const flowerZIndex = location.pathname === '/articles' ? -1 : 0;

  return (
    <div className="app-container">
      <RotatingFlowers zIndex={flowerZIndex} />

     <header className="brand-header">
  <img src={logo} alt="Brand Logo" className="brand-logo" />
     </header>


      <div className="main-layout">
  <nav className="sidebar">
    <Link to="/">
      <img
        src={productsIcon}
        alt="Products"
        style={{ width: '200px', height: '100px', marginBottom: '1rem' }}
      />
    </Link>
    <Link to="/articles">
      <img
        src={articlesIcon}
        alt="Articles"
        style={{ width: '200px', height: '97px' }}
      />
    </Link>
     <Link to="/about">
    <img
      src={aboutIcon}
      alt="About"
      style={{ width: '200px', height: '95px' }}
    />
  </Link>
  </nav>

  <main className="content">
    <Routes>
      <Route path="/" element={<ProductsList />} />
      <Route path="/articles" element={<ArticlesList />} />
      <Route path="/about" element={<About />} />
      <Route path="/success" element={<Success />} />
        <Route path="/checkout" element={<Checkout />} />

    </Routes>
  </main>
  </div>
  <footer className="footer">
  <a
    href="https://www.instagram.com/your_instagram_username"
    target="_blank"
    rel="noopener noreferrer"
    className="instagram-link"
  >
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
      alt="Instagram"
      className="instagram-icon"
    />
  </a>
</footer>

  </div>
  

  );

  


}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
