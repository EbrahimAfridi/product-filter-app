import { Index } from "@upstash/vector";

// Generic type for the product
type Product = {
  id: string;
  name: string;
  price: number;
  imageId: string;
  size: 'S' | 'M' | 'L';
  color: 'white' | 'beige' | 'blue' | 'green' | 'purple';
};
export const db = new Index<Product>();