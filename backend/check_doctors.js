import mongoose from 'mongoose';
import doctorModel from './models/doctorModel.js';
import 'dotenv/config';

const checkDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");
        const doctors = await doctorModel.find({});
        console.log(`Found ${doctors.length} doctors`);
        console.log(JSON.stringify(doctors, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

checkDoctors();
