import type { BlogPost, Testimonial } from "@/types"

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "This is an super space for your customers qoute. Don't worry it works smooth as pie. You will get all what you need by writiing a text here",
    author: "Name and Surname",
  },
  {
    id: "t2",
    quote:
      "Ordering vegetables here is faster than walking to the market. Everything arrives crisp, cold and exactly on time.",
    author: "Lucy Martin",
  },
  {
    id: "t3",
    quote:
      "I love knowing which farm my food comes from. The carrots from Tomissy Farm are simply the best in town.",
    author: "Petr Svoboda",
  },
  {
    id: "t4",
    quote:
      "Great prices on the weekly deals and the customer support actually answers. Highly recommended for families.",
    author: "Anna Novak",
  },
  {
    id: "t5",
    quote: "Freshness you can taste. The bakery section has become our Sunday morning ritual.",
    author: "Tomas Dvorak",
  },
]

const lorem =
  "We work hard to ensure that the fruit and vegetables we sell are fresh and high in quality. If we don't grow them ourselves, we source them from carefully chosen suppliers, preferring to buy locally whenever possible."

function article(topic: string): BlogPost["content"] {
  return [
    { type: "paragraph", text: `${topic} doesn't have to be complicated. ${lorem}` },
    { type: "heading", text: "Start with seasonal ingredients" },
    {
      type: "paragraph",
      text: "Seasonal produce is cheaper, tastier and travels less. Visit the market section each week and build your menu around what's freshest — carrots, tomatoes and leafy greens are almost always a safe bet.",
    },
    { type: "image", caption: "Fresh produce straight from the farm" },
    {
      type: "list",
      items: [
        "Plan three dinners ahead and shop once",
        "Prep vegetables right after delivery",
        "Keep herbs in a glass of water on the counter",
        "Cook grains in bulk and freeze portions",
      ],
    },
    {
      type: "quote",
      text: "Good food is the foundation of genuine happiness — and it starts with what you put in your basket.",
    },
    { type: "heading", text: "Make it a family thing" },
    {
      type: "paragraph",
      text: "Let the kids pick one vegetable each week and cook it together. It's the easiest way to turn picky eaters into curious ones. From roasts, salads and soups to casseroles and cakes, vegetables lend sweetness, texture and colour to an enormous number of recipes.",
    },
  ]
}

const posts: Omit<BlogPost, "content">[] = [
  {
    slug: "chef-tips-tasty-dinner-in-20-minutes",
    title: "Our chef tips for a great and tasty dinner ready in 20 minutes",
    excerpt: "Quick, healthy and delicious: our head chef shares the tricks for weeknight dinners.",
    tag: "Dinner tips",
    author: "Petr Bilek",
    date: "2020-06-17T00:00:00Z",
    readMinutes: 6,
  },
  {
    slug: "which-vegetable-your-family-will-love",
    title: "Which vegetable your family will love and want's eat each day",
    excerpt: "We asked hundreds of families what makes vegetables disappear from the plate.",
    tag: "Vegetable",
    author: "Anna Novak",
    date: "2020-06-15T00:00:00Z",
    readMinutes: 4,
  },
  {
    slug: "salad-good-start-morning-routine",
    title: "Salat is kinda good start to your morning routines",
    excerpt: "A light, crunchy breakfast salad that keeps you full until lunch.",
    tag: "Breakfast",
    author: "Lucy Martin",
    date: "2020-01-14T00:00:00Z",
    readMinutes: 3,
  },
  {
    slug: "chef-tips-great-and-healthy-breakfast",
    title: "Our chef tips for a great and healthy breakfast",
    excerpt: "Five breakfast ideas that take less than ten minutes.",
    tag: "Breakfast",
    author: "Petr Bilek",
    date: "2020-01-14T00:00:00Z",
    readMinutes: 5,
  },
  {
    slug: "prepare-simple-and-delicious-breads",
    title: "Prepare a simple and delicious breads",
    excerpt: "No fancy equipment needed — just flour, water, salt and a little patience.",
    tag: "Bakery",
    author: "Tomas Dvorak",
    date: "2020-01-14T00:00:00Z",
    readMinutes: 7,
  },
  {
    slug: "how-to-store-fruit-longer",
    title: "How to store fruit so it stays fresh longer",
    excerpt: "Which fruit belongs in the fridge and which should never go there.",
    tag: "Fruit",
    author: "Emma Brown",
    date: "2020-01-10T00:00:00Z",
    readMinutes: 4,
  },
  {
    slug: "meet-the-farmers-tomissy-farm",
    title: "Meet the farmers: a day at Tomissy Farm",
    excerpt: "We spent a day in the fields with the family behind our best-selling carrots.",
    tag: "Farmers",
    author: "Anna Novak",
    date: "2020-01-05T00:00:00Z",
    readMinutes: 8,
  },
  {
    slug: "fish-on-friday-easy-recipes",
    title: "Fish on Friday: three easy oven recipes",
    excerpt: "Salmon, mackerel and cod — three foolproof ways to cook fish at home.",
    tag: "Dinner tips",
    author: "Lucy Martin",
    date: "2019-12-20T00:00:00Z",
    readMinutes: 5,
  },
  {
    slug: "smoothies-kids-actually-drink",
    title: "Smoothies your kids will actually drink",
    excerpt: "Sneak some greens into breakfast without any complaints.",
    tag: "Drinks",
    author: "Emma Brown",
    date: "2019-12-12T00:00:00Z",
    readMinutes: 3,
  },
]

export const blogPosts: BlogPost[] = posts.map((p) => ({ ...p, content: article(p.title) }))
