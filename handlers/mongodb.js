const mongoose = require("mongoose");
require("dotenv").config();

const mongopassword = process.env.MONGODB_PASSWORD;
const mongousername = process.env.MONGODB_USERNAME;
const uri = `mongodb+srv://${mongousername}:${mongopassword}@kanou.ixlik.mongodb.net/Kanou?retryWrites=true&w=majority&appName=Kanou`;

async function connectDB() {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 15000, 
        });

        console.log("✅ Successfully connected to the database server");
    } catch (err) {
        console.error("❌ Database server connection error:", err);
        process.exit(1); 
    }
}

module.exports = { connectDB };
