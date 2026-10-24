export const products = [
  { id: "shampoo", name: "Shampoo", icon: "🧴", note: "Everyday hair cleansing" },
  { id: "conditioner", name: "Conditioner", icon: "✨", note: "Softness and easy detangling" },
  { id: "hair-serum", name: "Hair Serum", icon: "💧", note: "A finishing touch for your style" },
  { id: "hair-mask", name: "Hair Mask", icon: "🫙", note: "A care treatment for your hair" },
];

export type SalonProduct = (typeof products)[number];
type Props = { onExplore: (product: SalonProduct) => void };

export default function ProductCards({ onExplore }: Props) {

  return (
    <>
      <div className="product-card-row">
        {products.map((product, index) => (
          <article className="product-card" key={product.name}>
            <div className={`product-card-art product-card-art-${index + 1}`} aria-hidden="true">
              <span>{product.icon}</span>
            </div>
            <div className="product-card-copy">
              <h3>{product.name}</h3>
              <p>{product.note}</p>
              <button className="product-explore-button" type="button" onClick={() => onExplore(product)}>
                Explore <span aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        ))}
      </div>

    </>
  );
}
