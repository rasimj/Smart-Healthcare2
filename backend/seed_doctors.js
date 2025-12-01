import mongoose from 'mongoose';
import doctorModel from './models/doctorModel.js';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const doctors = [
    {
        name: "Dr. Richard James",
        email: "richard@example.com",
        password: "password123",
        speciality: "General physician",
        degree: "MBBS",
        experience: "4 Years",
        about: "Dr. Richard has a strong commitment to delivering comprehensive medical care.",
        fees: 50,
        address: {
            line1: "17th Cross, Richmond",
            line2: "Circle, Ring Road, London"
        },
        image: "https://doc-cure.dreamguystech.com/react/template/assets/img/doctors/doctor-01.jpg",
        available: true,
        date: Date.now()
    },
    {
        name: "Dr. Emily Larson",
        email: "emily@example.com",
        password: "password123",
        speciality: "Gynecologist",
        degree: "MBBS",
        experience: "3 Years",
        about: "Dr. Emily is dedicated to women's health and wellness.",
        fees: 60,
        address: {
            line1: "27th Cross, Richmond",
            line2: "Circle, Ring Road, London"
        },
        image: "https://doc-cure.dreamguystech.com/react/template/assets/img/doctors/doctor-02.jpg",
        available: true,
        date: Date.now()
    },
    {
        name: "Dr. Sarah Patel",
        email: "sarah@example.com",
        password: "password123",
        speciality: "Dermatologist",
        degree: "MBBS",
        experience: "1 Year",
        about: "Dr. Sarah specializes in skin care and treatments.",
        fees: 40,
        address: {
            line1: "37th Cross, Richmond",
            line2: "Circle, Ring Road, London"
        },
        image: "https://doc-cure.dreamguystech.com/react/template/assets/img/doctors/doctor-03.jpg",
        available: true,
        date: Date.now()
    }
];

const seedDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // Hash passwords
        for (let doc of doctors) {
            const salt = await bcrypt.genSalt(10);
            doc.password = await bcrypt.hash(doc.password, salt);
        }

        await doctorModel.deleteMany({}); // Clear existing doctors
        await doctorModel.insertMany(doctors);
        console.log("Doctors seeded successfully");

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

seedDoctors();
