import axios from '@/libs/apiAxios'

export default {

    async createOrder(orderModel) {
        try {
            const response = await axios.post(`/orders`, orderModel);

            // Verifica si la respuesta es exitosa
            if (response.status === 202) {
                return {
                    code: 202,
                    success: true,
                    data: response.data.data
                };
            }

            // Si la respuesta no es exitosa, retorna un objeto de error
            return {
                success: false,
                code: 500,
                error: `Unexpected status code: ${response.status}`
            };

        } catch (error) {
            return {
                code: error.status ?? 500,
                success: false,
                error: error?.response?.data?.error?.details ? error?.response?.data?.error?.details : error.message
            };
        }
    },

    async getAllOrders(page, perPage) {
        try {

            const response = await axios.get('/orders', {
                params: {
                    page: page,       // Número de página
                    perPage: perPage, // Elementos por página
                }
            });

            // Verifica si la respuesta es exitosa
            if (response.status === 200) {
                return {
                    code: 200,
                    success: true,
                    data: response.data
                };
            }

            // Si la respuesta no es exitosa, retorna un objeto de error
            return {
                success: false,
                code: 500,
                error: `Unexpected status code: ${response.status}`
            };
            
        } catch (error) {
            // Retorna un objeto de error
            return {
                code: error.status ?? 500,
                success: false,
                error: error.response ? error.response.data : error.message
            };
        }
    }

}