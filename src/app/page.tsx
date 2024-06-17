"use client";
import Providers from "@/components/Providers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@upstash/vector";
import axios from "axios";
import { ChevronDown, Filter } from "lucide-react";
import { useState } from "react";
import type { Product as TProduct } from "@/db";
import Product from "@/components/Products/Product";
import ProductSkeleton from "@/components/Products/ProductSkeleton";
import { Accordion } from "@radix-ui/react-accordion";

const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
] as const;

const SUB_CATEGORIES = [
  { name: "T-Shirts", href: "#", selected: true },
  { name: "Hoodies", href: "#", selected: false },
  { name: "Sweatshirts", href: "#", selected: false },
  { name: "Accessories", href: "#", selected: false },
];

export default function Home() {
  const [filter, setFilter] = useState({
    sort: "none",
  });
  // console.log(filter);
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<TProduct>[]>(
        "http://localhost:3000/api/products",
        {
          filter: {
            sort: filter.sort,
          },
        }
      );
      return data;
    },
  });

  console.log(products);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          High-quality cotton selection
        </h1>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 hover:cursor-pointer">
              Sort
              <ChevronDown className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((option) => (
                <button
                  className={cn(
                    "text-left w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                    {
                      "text-gray-900 bg-gray-100": option.value === filter.sort,
                      "text-gray-500": option.value !== filter.sort,
                    }
                  )}
                  key={option.name}
                  onClick={() => {
                    setFilter((prev) => ({ ...prev, sort: option.value }));
                  }}
                >
                  {option.name}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>
      <section className="pb-24 pt-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Filters */}
          <div className="hidden lg:block">
            <ul className="space-y-1 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
              {SUB_CATEGORIES.map((category) => (
                <li key={category.name} className="">
                  <button
                    disabled={category.selected}
                    className="w-full h-full rounded-sm hover:cursor-pointer text-left hover:bg-gray-200 p-2 disabled:cursor-not-allowed disabled:opacity-50 hover:text-gray-900"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
            <Accordion type='multiple' className="animate-none">
              {/* Color Filter */}
            </Accordion>
          </div>

          {/* Product Grid*/}
          <ul className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products
              ? products.map((product, index) => (
                  <Product product={product.metadata!} key={index} />
                ))
              : new Array(12)
                  .fill(null)
                  .map((_, index) => <ProductSkeleton key={index} />)}
          </ul>
        </div>
      </section>
    </main>
  );
}
