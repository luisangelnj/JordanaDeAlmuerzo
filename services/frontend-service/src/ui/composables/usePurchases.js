import { ref } from "vue";
import { useLoading } from 'vue-loading-overlay'
import { useToast } from "vue-toastification";

import Purchase from "@/domain/useCases/Purchase";

const usePurchase = () => {
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
    const perPage = ref(30)

    const purchaseList = ref([])
    const purchaseModel = ref({
        orderId: '',
        quantity: 1
    })
    const errors = ref({})


    const getAllPurchases = async (loading = true) => {
        const loader = loading ? $loading.show() : null;
        try {
            
            const resp = await Purchase.getAllPurchases(page.value, perPage.value);
            if (resp.success == false) throw resp;

            purchaseList.value = resp.values
            totalPages.value = resp.totalPages
            totalRecords.value = resp.totalRecords

            return resp

        } catch (error) {
            toast.error('Ha ocurrido un error al listar de compras. Inténtalo de nuevo más tarde')
            throw new Error('Error al obtener listado de compras: ' + error);
        } finally {
            loading ? loader.hide() : null
        }
    }


    return {
        purchaseList,
        purchaseModel,
        errors,
        totalPages,
        totalRecords,
        page,

        getAllPurchases
    }

}

export default usePurchase