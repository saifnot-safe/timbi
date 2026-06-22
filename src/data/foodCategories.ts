export const categories = {
    pizza: {
        name: "Pizza",
        icon: "/pins/pizza.png",
    },
    coffee: {
        name: "Coffee",
        icon: "/pins/coffee.png",
    },
    meal: {
        name: "Meal",
        icon: "/pins/meal.png",
    },
    snack: {
        name: "Snack",
        icon: "/pins/snack.png",
    },
    drink: {
        name: "Drink",
        icon: "/pins/drink.png",
    },
    baked: {
        name: "Baked",
        icon: "/pins/baked.png",
    }
};

export const categoryKeywords = {
  pizza: ["pizza", "slice"],
  coffee: ["coffee", "latte", "espresso"],
  baked: ["cookie", "donut", "muffin", "croissant", "cake", "pastry", "brownie"],
  drink: ["juice", "pop", "soda", "coke", "water", "boba", "bubble tea"],
  snack: ["snack", "chips", "candy", "chocolate", "granola", "fruit", "nuts", "popcorn", "bar", "nachos"],
  meal: ["sandwich", "wrap", "burger", "shawarma", "sushi", "pasta"],
};

export type FoodCategory = keyof typeof categories;