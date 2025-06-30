import PurchaseIterator from "@/domain/iterators/PurchaseIterator"
import PurchaseRepository from "@/data/PurchaseRepository"

export default {

    getAllPurchases: async (page, perPage) => {        
        const response = await PurchaseRepository.getAllPurchases(page, perPage)
        
        return (response.success && response.data) ? PurchaseIterator.ResponseToAllPurchaseList(response.data) : response
    }

}