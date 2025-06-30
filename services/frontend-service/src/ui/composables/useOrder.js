import { ref } from "vue";
import { useLoading } from 'vue-loading-overlay'
import { useToast } from "vue-toastification";

import Order from "@/domain/useCases/Order";

const useOrder = () => {
    const $loading = useLoading({
        color: '#007BFF'
    });
    const toast = useToast({
        position: "bottom-right",
        timeout: 3000
    });

    const orderModel = ref({
        orderId: '',
        quantity: 1
    })
    const errors = ref({})

    const validateCreateForm = () => {
        const newErrors = {}
        if (!orderModel.value.quantity) {
            newErrors.quantity = "Ingrese la cantidad de platillos"
        } else if (
            isNaN(orderModel.value.quantity) ||
            orderModel.value.quantity < 1 ||
            orderModel.value.quantity > 999
        ) {
            newErrors.quantity = "La cantidad debe ser entre 1 y 999"
        }

        errors.value = newErrors; // Actualizar los errores

        // Si no hay errores, retornar true para proceder con el registro
        return Object.keys(newErrors).length === 0;
    }

    const createOrder = async () => {
        const loader = $loading.show();
        try {
            if (!validateCreateForm()) {
                toast.info('Revisa los campos para continuar')
                return; // Si hay errores, no procedemos
            }
            
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