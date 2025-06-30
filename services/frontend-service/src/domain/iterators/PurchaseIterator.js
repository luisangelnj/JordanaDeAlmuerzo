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
                    purchasedAt: new Date( item.purchasedAt ).toLocaleDateString('es-MX'),
                }
            }),
            totalPages: data.lastPage,
            totalRecords: data.total
        }
    }

}