import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('\n⚠️  Connection troubleshooting:');
        console.log('   1. Check if MongoDB Atlas cluster is running');
        console.log('   2. Verify network access (whitelist your IP: 0.0.0.0/0 for testing)');
        console.log('   3. Check database credentials in .env file');
        console.log('   4. Try local MongoDB: mongodb://localhost:27017/daminimart');
        console.log('\n💡 To use local MongoDB, update MONGODB_URI in .env file\n');
        throw error;
    }
};

export default connectDB;
