export const foods = {
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
        name: "Baked Goods",
        icon: "/pins/baked.png",
    }
};

export type FoodId = keyof typeof foods;