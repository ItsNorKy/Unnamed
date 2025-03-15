const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config()
const mongopassword = process.env.MONGODB_PASSWORD;
const mongousername = process.env.MONGODB_USERNAME
const uri = `mongodb+srv://${mongousername}:${mongopassword}@kanou.ixlik.mongodb.net/?retryWrites=true&w=majority&appName=Kanou`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function mongodb() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to the database");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

module.exports = { mongodb };
