const express = require('express')
const cors = require('cors');
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lwsgehv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
      const foodMenuCollection = client.db("BistroBoss").collection("foodMenu")
      const reviewCollection = client.db("BistroBoss").collection("review")
    // create api like post,get,patch,update and delete.

    // all food menu collect form database using get api

      app.get('/foodMenu',async(req,res)=>{
           const result = await foodMenuCollection.find().toArray()
           res.send(result)
      })
    //   review collection
      app.get('/review',async(req,res)=>{ 
           const result = await reviewCollection.find().toArray()
           res.send(result)
      })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('server is running for bistro boss')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})