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
    const page = ref(1);
    const totalPages = ref()
    const totalRecords = ref()
    const perPage = ref(50)
    const placingOrder = ref(false)

    const orderList = ref([])
    const orderModel = ref({
        orderId: '',
        quantity: 10
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
        placingOrder.value = true
        // const loader = $loading.show();
        try {
            if (!validateCreateForm()) {
                toast.info('Revisa los campos para continuar')
                return; // Si hay errores, no procedemos
            }
            
            const resp = await Order.createOrder(orderModel.value)
            
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
            placingOrder.value = false
            // loader.hide()
        }
    }

    const getAllOrders = async (loading = true) => {
        const loader = loading ? $loading.show() : null;
        try {
            
            const resp = await Order.getAllOrders(page.value, perPage.value);
            if (resp.success == false) throw resp;

            orderList.value = resp.values
            totalPages.value = resp.totalPages
            totalRecords.value = resp.totalRecords

            return resp

        } catch (error) {
            toast.error('Ha ocurrido un error al listar las órdenes. Inténtalo de nuevo más tarde')
            throw new Error('Error al obtener listado de órdenes: ' + error);
        } finally {
            loading ? loader.hide() : null
        }
    }

    return {
        orderList,
        orderModel,
        errors,
        totalPages,
        totalRecords,
        page,
        perPage,
        placingOrder,

        createOrder,
        getAllOrders
    }
}

export default useOrder;