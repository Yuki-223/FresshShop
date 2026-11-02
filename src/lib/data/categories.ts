import type { Category } from "@/types"

export const categories: Category[] = [
  { slug: "bakery", name: "Bakery", subcategories: ["Bread", "Pastry", "Cakes", "Cookies"] },
  {
    slug: "fruit-and-vegetables",
    name: "Fruit and vegetables",
    subcategories: ["Vegetables", "Fruit", "Herbs", "Mushrooms"],
  },
  { slug: "meat-and-fish", name: "Meat and fish", subcategories: ["Chicken", "Pork", "Beef", "Fish"] },
  { slug: "drinks", name: "Drinks", subcategories: ["Juices", "Water", "Tea", "Coffee"] },
  { slug: "kitchen", name: "Kitchen", subcategories: ["Oils", "Spices", "Pasta", "Sauces"] },
  {
    slug: "special-nutrition",
    name: "Special nutrition",
    subcategories: ["Gluten free", "Vegan", "Protein", "Low sugar"],
  },
  { slug: "baby", name: "Baby", subcategories: ["Baby food", "Snacks", "Care"] },
  { slug: "pharmacy", name: "Pharmacy", subcategories: ["Vitamins", "Herbal", "Care"] },
]

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug)
}

export const productTags = [
  "Beans",
  "Carrots",
  "Apples",
  "Garlic",
  "Mushrooms",
  "Tomatoes",
  "Chilli peppers",
  "Broccoli",
  "Watermelons",
  "Oranges",
  "Bananas",
  "Grapes",
  "Cherries",
  "Meat",
  "Fish",
  "Fresh food",
  "Lemons",
]
