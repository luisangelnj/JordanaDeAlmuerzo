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
    }

}