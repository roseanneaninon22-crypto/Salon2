"use client";

import { useState } from "react";
import SalonLogo from "./SalonLogo";
import { products, SalonProduct } from "./ProductCards";

type Props = {
  product: SalonProduct;
  cartCount: number;
  onBack: () => void;
  onAddToCart: (product: SalonProduct) => void;
};

export default function ProductDetailsPage({ product, cartCount, onBack, onAddToCart }: Props) {
  const [cartMessage, setCartMessage] = useState("");
  const [buyMessage, setBuyMessage] = useState(false);
  const artIndex = products.findIndex(item => item.id === product.id) + 1;

  const addToCart = () => {
    onAddToCart(product);
    setCartMessage(`${product.name} added to your cart.`);
  };

  return (
    <main className="product-details-page">
      <nav className="site-nav">
        <SalonLogo />
        <div className="product-details-nav-actions">
          <span className="product-cart-count">Cart: {cartCount}</span>
          <button className="btn-ghost" type="button" onClick={onBack}>Back to Products</button>
        </div>
      </nav>

      <section className="product-details-content">
        <p className="landing-eyebrow">Salon Care</p>
        <h1>Product Details</h1>
        <article className="product-detail-card">
          <div className={`product-card-art product-card-art-${artIndex}`} aria-hidden="true"><span>{product.icon}</span></div>
          <div className="product-detail-copy">
            <p className="landing-eyebrow">Rosseygirl Salon</p>
            <h2>{product.name}</h2>
            <p>{product.note}</p>
            <p className="product-detail-description">Ask our salon team which product is right for your hair and check current availability during your visit.</p>
            <div className="product-detail-actions">
              <button className="btn-outline" type="button" onClick={addToCart}>Add to Cart</button>
              <button className="btn-pink" type="button" onClick={() => setBuyMessage(true)}>Buy Now</button>
            </div>
            {cartMessage && <p className="product-cart-message" role="status">{cartMessage}</p>}
          </div>
        </article>
      </section>

      {buyMessage && (
        <div className="product-explore-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setBuyMessage(false); }}>
          <section className="product-explore-dialog" role="dialog" aria-modal="true" aria-labelledby="product-buy-title">
            <button className="product-explore-close" type="button" aria-label="Close" onClick={() => setBuyMessage(false)}>×</button>
            <h3 id="product-buy-title">Purchase {product.name}</h3>
            <p>Online checkout is not available yet. Please contact the salon to confirm availability and price.</p>
            <button className="btn-pink" type="button" onClick={() => setBuyMessage(false)} style={{ marginTop: 20 }}>Got it</button>
          </section>
        </div>
      )}
    </main>
  );
}
