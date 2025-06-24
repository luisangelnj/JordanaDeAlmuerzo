export interface Ingredient {
    name: 'tomato' | 'lemon' | 'potato' | 'rice' | 'ketchup' | 'lettuce' | 'onion' | 'cheese' | 'meat' | 'chicken';
    quantity: number;
}

export interface Recipe {
    id: number;
    name: string;
    ingredients: Ingredient[];
}

export const recipes: Recipe[] = [
    {
        id: 1,
        name: "Ensalada de Pollo",
        ingredients: [
            {
                name: 'chicken',
                quantity: 1
            },
            {
                name: 'lettuce',
                quantity: 2
            },
            {
                name: 'tomato',
                quantity: 1
            },
            {
                name: 'lemon',
                quantity: 1
            }
        ]
    },
    {
        id: 2,
        name: "Arroz con Pollo",
        ingredients: [
            {
                name: 'chicken',
                quantity: 1
            },
            {
                name: 'rice',
                quantity: 2
            },
            {
                name: 'onion',
                quantity: 1
            }
        ]
    },
    {
        id: 3,
        name: "Hamburguesa Clásica",
        ingredients: [
            {
                name: 'meat',
                quantity: 1
            },
            {
                name: 'lettuce',
                quantity: 1
            },
            {
                name: 'onion',
                quantity: 1
            },
            {
                name: 'cheese',
                quantity: 1
            },
            {
                name: 'ketchup',
                quantity: 1
            }
        ]
    },
    {
        id: 4,
        name: "Papas a la Francesa con Queso",
        ingredients: [
            {
                name: 'potato',
                quantity: 3
            },
            {
                name: 'cheese',
                quantity: 2
            },
            {
                name: 'ketchup',
                quantity: 1
            }
        ]
    },
    {
        id: 5,
        name: "Filete de Carne con Arroz",
        ingredients: [
            {
                name: 'meat',
                quantity: 1
            },
            {
                name: 'rice',
                quantity: 2
            },
            {
                name: 'tomato',
                quantity: 1
            }
        ]
    },
    {
        id: 6,
        name: "Papas Rellenas",
        ingredients: [
            {
                name: 'potato',
                quantity: 2
            },
            {
                name: 'meat',
                quantity: 1
            },
            {
                name: 'onion',
                quantity: 1
            }
        ]
    }
];