import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`);
        console.log(`Database Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to DB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
}

export default connectDB;