// services/kitchen-service/src/__tests__/ingredient-calculator.test.ts

// Asumimos que la lógica de cálculo está en una función exportada.
// Para este ejemplo, la pondremos aquí mismo para que sea más claro.

// --- Lógica a Probar ---
// Imagina que esta función está en otro archivo y la estás importando.
function calculateTotalIngredients(dishes: any[]) {
    const requiredIngredients = new Map();
    dishes.forEach(dish => {
        dish.ingredients.forEach((ingredient: { name: any; quantity: any; }) => {
            const currentQuantity = requiredIngredients.get(ingredient.name) || 0;
            requiredIngredients.set(ingredient.name, currentQuantity + ingredient.quantity);
        });
    });
    return Array.from(requiredIngredients.entries()).map(([name, quantity]) => ({ name, quantity }));
}

// --- Inicio de las Pruebas ---
describe('Ingredient Calculator', () => {

    // Prueba 1: Verifica que calcula correctamente para un solo plato.
    it('should correctly calculate ingredients for a single dish', () => {
        const singleDish = [{
            name: 'Dish A',
            ingredients: [{ name: 'Tomato', quantity: 2 }, { name: 'Onion', quantity: 1 }]
        }];

        const result = calculateTotalIngredients(singleDish);

        // Verificamos que el resultado sea el esperado.
        expect(result).toEqual([
            { name: 'Tomato', quantity: 2 },
            { name: 'Onion', quantity: 1 }
        ]);
    });

    // Prueba 2: Verifica que agrega correctamente los ingredientes de múltiples platos.
    it('should aggregate ingredients from multiple dishes correctly', () => {
        const multipleDishes = [
            { name: 'Dish A', ingredients: [{ name: 'Tomato', quantity: 2 }, { name: 'Onion', quantity: 1 }] },
            { name: 'Dish B', ingredients: [{ name: 'Tomato', quantity: 3 }, { name: 'Cheese', quantity: 5 }] }
        ];

        const result = calculateTotalIngredients(multipleDishes);

        // Usamos 'expect.arrayContaining' porque el orden del array resultante no nos importa.
        expect(result).toEqual(expect.arrayContaining([
            { name: 'Tomato', quantity: 5 }, // 2 + 3
            { name: 'Onion', quantity: 1 },
            { name: 'Cheese', quantity: 5 }
        ]));
        expect(result.length).toBe(3); // Nos aseguramos de que no haya ingredientes extra.
    });

    // Prueba 3: Verifica que maneja una lista de platos vacía.
    it('should return an empty array for an empty list of dishes', () => {
        const result = calculateTotalIngredients([]);
        expect(result).toEqual([]);
    });

});