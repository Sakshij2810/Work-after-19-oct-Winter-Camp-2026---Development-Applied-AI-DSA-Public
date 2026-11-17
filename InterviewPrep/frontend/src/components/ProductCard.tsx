import React from "react";
import type { Product } from "./MemoHook";

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}
const ProductCard = React.memo(({ product, onAddToCart }: ProductCardProps) => {
  console.log("product card renders......");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10",
      }}
    >
      <p>
        {product.title} - {product.price}
      </p>

      <button onClick={onAddToCart}>Add to cart</button>
    </div>
  );
});

export default ProductCard;
