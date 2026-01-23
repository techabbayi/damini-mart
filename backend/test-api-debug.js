import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const testAPI = async () => {
    try {
        console.log('Testing categories endpoint...');
        const catResponse = await axios.get(`${API_URL}/categories`);
        console.log('Categories response:', JSON.stringify(catResponse.data, null, 2));

        console.log('\nTesting products endpoint...');
        const prodResponse = await axios.get(`${API_URL}/products?limit=5`);
        console.log('Products response structure:', {
            success: prodResponse.data.success,
            dataType: typeof prodResponse.data.data,
            isArray: Array.isArray(prodResponse.data.data),
            length: prodResponse.data.data?.length,
            firstItem: prodResponse.data.data?.[0]?.name
        });
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
};

testAPI();
