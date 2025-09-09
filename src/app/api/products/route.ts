import { dodopayments } from "@/lib/dodopayments";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await dodopayments.products.list();
    const filteredProduct = products.items.find(product => product.product_id === 'pdt_btqLkOF7z76LCou4kORir');
    return NextResponse.json(filteredProduct ? [filteredProduct] : []);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
