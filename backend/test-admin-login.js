import axios from 'axios';

const loginAdmin = async () => {
    try {
        const url = 'http://localhost:4000/api/admin/login';
        const credentials = {
            email: 'admin@prescripto.com',
            password: 'qwerty123'
        };

        console.log('Sending Admin Login request...');
        const response = await axios.post(url, credentials);

        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);

        if (response.data.success) {
            console.log('✅ Admin Login Successful!');
        } else {
            console.log('❌ Admin Login Failed:', response.data.message);
        }

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    }
};

loginAdmin();
