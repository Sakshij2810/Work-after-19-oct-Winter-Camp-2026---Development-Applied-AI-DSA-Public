import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";

export interface Product {
  id: number;
  title: string;
  price: number;
  brand: string;
  category: string;
  description: string;
  stock: number;
}
const MemoHook = () => {
  const [count, setCount] = useState<number>(0);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [cartCount, setCartCount] = useState<number>(0);

  const resultRef = useRef<number>(0); // if this gets updated component doesnt re-render

  useEffect(() => {
    fetch("https://dummyjson.com/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products));
  }, []);

  const filteredProducts = useMemo(() => {
    console.log("Filtering products...");

    return (
      products &&
      products.filter((item) =>
        item.title.toLowerCase().includes(searchText.toLowerCase()),
      )
    );
  }, [searchText, products]);

  // const filteredProducts = () => {
  //   console.log("Filtering products...");

  //   return (
  //     products &&
  //     products.filter((item) =>
  //       item.title.toLowerCase().includes(searchText.toLowerCase()),
  //     )
  //   );
  // };

  const addToCart = useCallback(() => {
    console.log("add to cart triggered....");
    setCartCount((prev) => prev + 1);
  }, []);

  const handleRefClick = () => {
    resultRef.current += 10;

    console.log("Ref value:", resultRef.current);
  };
  console.log("rendered");

  return (
    <div>
      <h1>count : {count}</h1>
      <button onClick={() => setCount((prev) => prev + 1)}>
        increase count state
      </button>
      <br />
      <button onClick={handleRefClick}>increase ref</button>

      <br />
      <div>
        <h1>Cart count : {cartCount}</h1>
        <h1>Products list</h1>
        <input
          type="text"
          value={searchText}
          placeholder="Search products here..."
          onChange={(e) => setSearchText(e.target.value)}
        />
        {/* without useMemo */}
        {/* {filteredProducts()?.map((item) => (
          <p key={item.id}>{item.title}</p>
        ))} */}
        {/* with useMemo , without useCallback */}
        {/* {filteredProducts?.map((item) => (
          <div key={item.id}>
            <p>{item.title}</p>
            <button onClick={addToCart}>add to cart</button>
          </div>
        ))} */}
        {/* with useCallback */}
        {filteredProducts?.map((item) => (
          <ProductCard key={item.id} onAddToCart={addToCart} product={item} />
        ))}
      </div>
    </div>
  );
};

export default MemoHook;
