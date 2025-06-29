export default {

    ResponseToDashboardStats: (response) => {
        const ingredientTranslations = {
            cheese: "queso",
            chicken: "pollo",
            ketchup: "catsup",
            lemon: "limón",
            lettuce: "lechuga",
            meat: "carne",
            onion: "cebolla",
            potato: "papa",
            rice: "arroz",
            tomato: "jitomate"
        };
        return {
            orderStats: {
                ordersInProgress: response.stats.ordersInProgress,
                ordersCompleted: response.stats.ordersCompleted,
                dishesCompleted: response.stats.dishesCompleted
            },
            recentOrders: response.recentOrders.map(item => {
                return {
                    id: item.id,
                    quantity: item.quantity,
                    status: item.status,
                    requestedAt: new Date( item.requestedAt ).toLocaleDateString('es-MX')
                }
            }),
            inventory: response.inventory.map(item => {
                return {
                    ingredientName: ingredientTranslations[item.ingredientName] || item.ingredientName,
                    quantity: item.quantity,
                    updatedAt: new Date ( item.updatedAt ).toLocaleDateString('es-MX')
                }
            }),
            recipes: response.recipes.map(item => {
                return {
                    name: item.name,
                    ingredients: item.ingredients.map(ingredient => {
                        return {
                            name: ingredientTranslations[ingredient.name] || ingredient.name,
                            quantity: ingredient.quantity
                        }
                    })
                }
            })
        }
    }

}