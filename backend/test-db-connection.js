import mongoose from 'mongoose';
import 'dotenv/config';

const testConnection = async () => {
    console.log('🔍 Testing MongoDB Connection...\n');

    // Display environment variable
    console.log('📋 Configuration:');
    console.log(`   MONGODB_URI: ${process.env.MONGODB_URI || 'NOT SET'}`);
    console.log(`   Database Name: prescripto`);
    console.log(`   Full Connection String: ${process.env.MONGODB_URI}/prescripto\n`);

    try {
        console.log('⏳ Attempting to connect...');

        // Set connection timeout
        const connection = await mongoose.connect(
            `${process.env.MONGODB_URI}/prescripto`,
            {
                serverSelectionTimeoutMS: 5000, // 5 second timeout
            }
        );

        console.log('✅ Successfully connected to MongoDB!');
        console.log(`   Host: ${connection.connection.host}`);
        console.log(`   Database: ${connection.connection.name}`);
        console.log(`   Port: ${connection.connection.port}`);
        console.log(`   Connection State: ${connection.connection.readyState === 1 ? 'Connected' : 'Not Connected'}\n`);

        // Test a simple operation
        console.log('🧪 Testing database operations...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`   Found ${collections.length} collections:`);
        collections.forEach(col => console.log(`   - ${col.name}`));

        console.log('\n✅ Database connection test PASSED!\n');

        // Close connection
        await mongoose.connection.close();
        console.log('🔌 Connection closed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ MongoDB Connection FAILED!');
        console.error(`   Error Type: ${error.name}`);
        console.error(`   Error Message: ${error.message}\n`);

        console.log('💡 Troubleshooting Tips:');

        if (error.message.includes('ECONNREFUSED')) {
            console.log('   ❗ MongoDB server is not running');
            console.log('   → Start MongoDB service:');
            console.log('      Windows: net start MongoDB');
            console.log('      Or check Windows Services for MongoDB\n');
        } else if (error.message.includes('authentication failed')) {
            console.log('   ❗ Authentication credentials are incorrect');
            console.log('   → Check username/password in .env file\n');
        } else if (error.message.includes('MONGODB_URI')) {
            console.log('   ❗ MONGODB_URI is not set');
            console.log('   → Add MONGODB_URI to your .env file');
            console.log('      Example: MONGODB_URI=mongodb://localhost:27017\n');
        } else if (error.message.includes('querySrv')) {
            console.log('   ❗ DNS resolution failed (Atlas connection)');
            console.log('   → Check internet connection and Atlas URL\n');
        }

        console.log('   📖 Quick Fixes:');
        console.log('   1. Ensure MongoDB is installed and running');
        console.log('   2. Check .env file has correct MONGODB_URI');
        console.log('   3. Verify network/firewall settings');
        console.log('   4. Check MongoDB logs for errors\n');

        process.exit(1);
    }
};

// Run the test
testConnection();
