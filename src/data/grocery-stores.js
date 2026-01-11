import { v5 as uuidv5 } from 'uuid';

const stores = [
  "Cub Foods - Richfield, MN",
  "Costco - Eden Prairie, MN"
]

const aisles = [
  {
    name: "Produce",
    categories: ["Fresh Fruits", "Fresh Vegetables", "Salad Greens", "Herbs"]
  },
  {
    name: "Dairy & Eggs",
    categories: ["Milk", "Cheese", "Yogurt", "Butter", "Eggs"]
  },
  {
    name: "Meat & Seafood",
    categories: ["Beef", "Chicken", "Pork", "Fish", "Shellfish"]
  },
  {
    name: "Bakery",
    categories: ["Bread", "Rolls", "Pastries", "Cakes", "Cookies"]
  },
  {
    name: "Frozen Foods",
    categories: ["Ice Cream", "Frozen Vegetables", "Frozen Meals", "Pizza"]
  },
  {
    name: "Beverages",
    categories: ["Soda", "Juice", "Water", "Coffee", "Tea"]
  },
  {
    name: "Snacks",
    categories: ["Chips", "Crackers", "Nuts", "Candy", "Popcorn"]
  },
  {
    name: "Canned Goods",
    categories: ["Soup", "Vegetables", "Beans", "Tomatoes", "Fruit"]
  },
  {
    name: "Pasta & Grains",
    categories: ["Pasta", "Rice", "Quinoa", "Couscous", "Noodles"]
  },
  {
    name: "Cereal & Breakfast",
    categories: ["Cereal", "Oatmeal", "Pancake Mix", "Syrup", "Granola"]
  },
  {
    name: "Condiments & Sauces",
    categories: ["Ketchup", "Mustard", "Mayo", "Salad Dressing", "Hot Sauce"]
  },
  {
    name: "Baking Supplies",
    categories: ["Flour", "Sugar", "Baking Soda", "Chocolate Chips", "Spices"]
  },
  {
    name: "International Foods",
    categories: ["Mexican", "Asian", "Italian", "Indian", "Mediterranean"]
  },
  {
    name: "Health & Wellness",
    categories: ["Vitamins", "Protein Bars", "Organic Foods", "Gluten-Free", "Supplements"]
  },
  {
    name: "Household & Cleaning",
    categories: ["Paper Towels", "Dish Soap", "Laundry Detergent", "Trash Bags", "Cleaning Spray"]
  }
];

export default stores.map(store => {
  return {
    id: uuidv5(store, uuidv5.URL),
    name: store,
    aisles
  }
})