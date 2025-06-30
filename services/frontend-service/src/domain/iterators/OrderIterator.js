export default {

    RequestToCreateOrder: (orderModel) => {
        return {
            quantity: orderModel.quantity
        }
    },

    ResponseToRegisteredOrderModel: (response) => {
        return {
            orderId: response.orderId,
            quantity: response.quantity
        }
    },

    ResponseToAllOrderList: (data) => {
        const statusTranslations = {
            PENDING: "En cola",
            PURCHASING_INGREDIENTS: "Comprando ingredientes",
            PREPARING_DISHES: "Preparando platillos",
            COMPLETED: "Órden completada"
        }
        return {
            values: data.data.map(item => {
                return {
                    id: item.id,
                    orderNo: item.orderNo,
                    quantity: item.quantity,
                    status: statusTranslations[item.status] || item.status,
                    requestedAt: new Date( item.requestedAt ).toLocaleDateString('es-MX'),
                    preparedDishes: item.preparedDishes || []
                }
            }),
            totalPages: data.lastPage,
            totalRecords: data.total
        }
    }

}