import DashboardIterator from "@/domain/iterators/DashboardIterator"
import DashboardRepository from "@/data/DashboardRepository"

export default {

    getDashboardStats: async () => {
        const response = await DashboardRepository.getDashboardStats();
        
        return (response.success && response.data) ? DashboardIterator.ResponseToDashboardStats(response.data) : response
    }

}