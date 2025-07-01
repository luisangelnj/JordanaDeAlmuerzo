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
        const statusTranslations = {
            PENDING: "En cola",
            PURCHASING_INGREDIENTS: "Comprando ingredientes",
            PREPARING_DISHES: "Preparando platillos",
            COMPLETED: "Órden completada"
        }
        return {
            orderStats: {
                ordersInProgress: response.stats.ordersInProgress,
                ordersCompleted: response.stats.ordersCompleted,
                dishesCompleted: response.stats.dishesCompleted
            },
            recentOrders: response.recentOrders.map(item => {
                return {
                    id: item.id,
                    orderNo: item.orderNo,
                    quantity: item.quantity,
                    status: statusTranslations[item.status] || item.status,
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
            }),
            recentPurchases: response.recentPurchases.map(item => {
                return {
                    ingredientName: ingredientTranslations[item.ingredientName] || item.ingredientName,
                    quantity: item.quantityBought,
                    purchasedAt: new Date(item.purchasedAt).toLocaleString('es-MX', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                    })
                }
            })
        }
    }

}