export default {

    ResponseToAllPurchaseList: (data) => {
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
            values: data.data.map(item => {
                return {
                    id: item.id,
                    folio: item.folio,
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
            }),
            totalPages: data.lastPage,
            totalRecords: data.total
        }
    }

}