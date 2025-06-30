import axios from 'axios';
import { purchaseIngredient } from '../marketplace.worker';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('purchaseIngredient', () => {

    beforeEach(() => {
        // Limpiamos los mocks antes de cada prueba para asegurar que una prueba no afecte a la otra
        mockedAxios.get.mockClear();
    });

    it('should return the purchased quantity when the API call is successful and quantitySold > 0', async () => {
        const apiResponse = { data: { quantitySold: 5 } };
        mockedAxios.get.mockResolvedValue(apiResponse);
        const result = await purchaseIngredient({ name: 'Tomato', quantity: 10 });
        expect(result).toEqual({ name: 'Tomato', quantityBought: 5 });
    });

    // Aquí simulamos cuando el mercadito Alegra no nos vende nada :C
    it('should return null when the API returns quantitySold of 0', async () => {
        const apiResponse = { data: { quantitySold: 0 } };
        mockedAxios.get.mockResolvedValue(apiResponse);
        const result = await purchaseIngredient({ name: 'Onion', quantity: 5 });
        expect(result).toBeNull();
    });

    describe('when the API call throws an error', () => {
        let errorSpy: jest.SpyInstance;

        // Silenciamos la consola real de errores de red
        beforeEach(() => {
            errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        });

        // Restauramos la función original de console.error.
        afterEach(() => {
            errorSpy.mockRestore();
        });

        it('should return null', async () => {
            // Simulamos el mock para que falle en red.
            mockedAxios.get.mockRejectedValue(new Error('Network Error'));

            const result = await purchaseIngredient({ name: 'Cheese', quantity: 2 });
            // Verificamos que devuelve null.
            expect(result).toBeNull();
        });
    });
});