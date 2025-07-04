import OrderIterator from "@/domain/iterators/OrderIterator"
import OrderRepository from "@/data/OrderRepository"

export default {

    createOrder: async (orderModel) => {
        const request = OrderIterator.RequestToCreateOrder(orderModel);
        const response = await OrderRepository.createOrder(request);
        return (response.success && response.data) ? OrderIterator.ResponseToRegisteredOrderModel(response.data) : response
    },

    getAllOrders: async (page, perPage) => {
        const response = await OrderRepository.getAllOrders(page, perPage);

        return (response.success && response.data) ? OrderIterator.ResponseToAllOrderList(response.data) : response
    }

}