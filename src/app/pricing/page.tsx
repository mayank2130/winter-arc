import ProductCard from "@/components/ProductCard";
export default async function Home() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/products`, {
    cache: "no-store",
  });
  const products = await response.json();
  type Product = {
    product_id: number;
    name: string;
    description: string;
    price: number;
    is_recurring: boolean;
  };

  const checkoutProduct = async (productId: number) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/checkout?productId=${productId}`,
      {
        cache: "no-store",
      }
    );
    const data = await response.json();
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">
        Dodo Payments Product List
      </h1>
      <div className="flex flex-col sm:flex-row">
        {products.map((product: Product) => (
          <ProductCard key={product.product_id} product={product} />
        ))}
      </div>
    </div>
  );
}
