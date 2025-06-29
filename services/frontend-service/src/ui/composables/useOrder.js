import { ref } from "vue";
import { useLoading } from 'vue-loading-overlay'
import { useToast } from "vue-toastification";

import Order from "@/domain/useCases/Order";

const useOrder = () => {
    const $loading = useLoading({
        color: '#007BFF'
    });
    const toast = useToast({
        timeout: 3000
    });

    const orderModel = ref({
        orderId: '',
        quantity: 1
    })
    const errors = ref({})

    const createOrder = async () => {
        const loader = $loading.show();
        try {
            
            const resp = await Order.createOrder(orderModel.value)
            console.log(resp);
            
            if (resp.success == false) throw resp;
            orderModel.value = resp

            toast.success('Pedido realizado con éxito');
            return;

        } catch (error) {
            if (error.code == 422) {
                return;
            }
            throw new Error('Error al registrar la órden: ' + error);
        } finally {
            loader.hide()
        }
    }

    return {
        orderModel,
        errors,

        createOrder
    }
}

export default useOrder;