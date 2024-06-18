"use client";
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
import { useCallback, useState } from "react";
import type { Product as TProduct } from "@/db";
import Product from "@/components/Products/Product";
import ProductSkeleton from "@/components/Products/ProductSkeleton";
import { Accordion, AccordionItem } from "@radix-ui/react-accordion";
import { AccordionContent, AccordionTrigger } from "@/components/ui/accordion";
import { ProductState } from "@/lib/validator/product-validator";
import { Slider } from "@/components/ui/slider";
import debounce from "lodash.debounce";
import EmptyState from "@/components/Products/EmptyState";

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

const COLOR_FILTER = {
  id: "color",
  name: "Color",
  options: [
    { value: "white", label: "White" },
    { value: "purple", label: "Purple" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "beige", label: "Beige" },
  ] as const,
};

const SIZE_FILTER = {
  id: "size",
  name: "Size",
  options: [
    { value: "S", label: "S" },
    { value: "M", label: "M" },
    { value: "L", label: "L" },
  ],
} as const;

const PRICE_FILTER = {
  id: "price",
  name: "Price",
  options: [
    { value: [0, 100], label: "Any Price" },
    { value: [0, 20], label: "Under $20" },
    { value: [0, 40], label: "Under $40" },
    // Custom option defined in JSX
  ],
} as const;

const DEFAULT_CUSTOM_PRICE = [0, 100] as [number, number];

export default function Home() {
  const [filter, setFilter] = useState<ProductState>({
    color: ["white", "blue", "beige", "purple", "green"],
    price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
    size: ["S", "M", "L"],
    sort: "none",
  });

  const { data: products, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<TProduct>[]>(
        "http://localhost:3000/api/products",
        {
          filter: {
            sort: filter.sort,
            color: filter.color,
            price: filter.price.range,
            size: filter.size,
          },
        }
      );
      return data;
    },
  });

  const onSubmit = () => refetch();

  const debouncedSubmit = debounce(onSubmit, 400);
  const _debouncedSubmit = useCallback(debouncedSubmit, []);

  function applyArrayFilter({
    category,
    value,
  }: {
    category: keyof Omit<typeof filter, "price" | "sort">;
    value: string;
  }) {
    const isFilterApplied = filter[category].includes(value as never);
    if (isFilterApplied) {
      setFilter((prev) => ({
        ...prev,
        [category]: prev[category].filter((v) => v !== value),
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        [category]: [...prev[category], value],
      }));
    }
    _debouncedSubmit();
  }

  const minPrice = Math.min(filter.price.range[0], filter.price.range[1]);
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1]);

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
                    _debouncedSubmit();
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
            {/* Color Filter */}
            <Accordion
              type="multiple"
              className="animate-none border-b border-gray-200"
            >
              <AccordionItem value="color">
                <AccordionTrigger className="py-3 text-gray-400 text-sm hover:text-gray-500">
                  <span className="text-gray-900 font-medium">Color</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {COLOR_FILTER.options.map((option, index) => (
                      <li key={option.value} className="flex items-center">
                        <input
                          onChange={() => {
                            applyArrayFilter({
                              category: "color",
                              value: option.value,
                            });
                          }}
                          checked={filter.color.includes(option.value)}
                          type="checkbox"
                          id={`color-${index}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`color-${index}`}
                          className="ml-3 text-sm text-gray-600"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Size Filter */}
            <Accordion
              type="multiple"
              className="animate-none border-b border-gray-200"
            >
              <AccordionItem value="size">
                <AccordionTrigger className="py-3 text-gray-400 text-sm hover:text-gray-500">
                  <span className="text-gray-900 font-medium">Size</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {SIZE_FILTER.options.map((option, index) => (
                      <li key={option.value} className="flex items-center">
                        <input
                          onChange={() => {
                            applyArrayFilter({
                              category: "size",
                              value: option.value,
                            });
                          }}
                          checked={filter.size.includes(option.value)}
                          type="checkbox"
                          id={`size-${index}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`size-${index}`}
                          className="ml-3 text-sm text-gray-600"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Price Filter */}
            <Accordion
              type="multiple"
              className="animate-none border-b border-gray-200"
            >
              <AccordionItem value="price">
                <AccordionTrigger className="py-3 text-gray-400 text-sm hover:text-gray-500">
                  <span className="text-gray-900 font-medium">Price</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {PRICE_FILTER.options.map((option, index) => (
                      <li key={option.label} className="flex items-center">
                        <input
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: false,
                                range: [...option.value],
                              },
                            }));
                            _debouncedSubmit();
                          }}
                          checked={
                            !filter.price.isCustom &&
                            filter.price.range[0] === option.value[0] &&
                            filter.price.range[1] === option.value[1]
                          }
                          type="radio"
                          id={`price-${index}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`price-${index}`}
                          className="ml-3 text-sm text-gray-600"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                    <li className="flex justify-center flex-col gap-2">
                      <div>
                        <input
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: true,
                                range: [0, 100],
                              },
                            }));
                            _debouncedSubmit();
                          }}
                          checked={filter.price.isCustom}
                          type="radio"
                          id={`price-${PRICE_FILTER.options.length}`}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`price-${PRICE_FILTER.options.length}`}
                          className="ml-3 text-sm text-gray-600"
                        >
                          Custom
                        </label>
                      </div>
                      {/* Slider */}
                      <div className="flex justify-between">
                        <p className="font-medium">Price</p>
                        <div>
                          $
                          {filter.price.isCustom
                            ? minPrice.toFixed(0)
                            : filter.price.range[0].toFixed(0)}{" "}
                          - $
                          {filter.price.isCustom
                            ? maxPrice.toFixed(0)
                            : filter.price.range[1].toFixed(0)}
                        </div>
                      </div>
                      <Slider
                        className={cn({ "opacity-50": !filter.price.isCustom })}
                        disabled={!filter.price.isCustom}
                        onValueChange={(range) => {
                          const [newMin, newMax] = range;
                          setFilter((prev) => ({
                            ...prev,
                            price: {
                              isCustom: true,
                              range: [newMin, newMax],
                            },
                          }));
                          _debouncedSubmit();
                        }}
                        value={
                          filter.price.isCustom
                            ? filter.price.range
                            : DEFAULT_CUSTOM_PRICE
                        }
                        min={DEFAULT_CUSTOM_PRICE[0]}
                        defaultValue={DEFAULT_CUSTOM_PRICE}
                        max={DEFAULT_CUSTOM_PRICE[1]}
                        step={5}
                      />
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Product Grid*/}
          <ul className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products && products.length === 0 ? <EmptyState /> : products
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
