import { ref } from "vue";
import { useLoading } from 'vue-loading-overlay'
import { useRouter } from 'vue-router';
import { useToast } from "vue-toastification";

import Dashboard from "@/domain/useCases/Dashboard"

const useDashboard = () => {

    const $loading = useLoading({
        color: '#007BFF'
    });
    const toast = useToast({
        timeout: 3000
    });

    const statsModel = ref({
        orderStats: {
            ordersInProgress: 0,
            ordersCompleted: 0,
            dishesCompleted: 0
        },
        recentOrders: [{
            id: '',
            quantity: '',
            status: '',
            requestedAt: ''
        }],
        inventory: [{
            ingredientName: '',
            quantity: '',
            updatedAt: ''
        }]
    })


    const getDashboardStats = async (loading = true) => {
        const loader = loading ? $loading.show() : null;
        try {

            const resp = await Dashboard.getDashboardStats()

            if (resp.success == false) throw resp
            statsModel.value = resp
            
            return
            
        } catch (error) {
            if (error.code == 422) {
                return;
            }
            throw new Error('Error al registrar la órden: ' + error);
        } finally {
            loading ? loader.hide() : null
        }
    }

    return {
        statsModel,
        getDashboardStats
    }
}

export default useDashboard