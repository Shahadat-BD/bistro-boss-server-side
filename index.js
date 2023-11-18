const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const foodCartCollection = client.db("BistroBoss").collection("foodCart")
    const userCollection = client.db("BistroBoss").collection("user")
    // create api like post,get,patch,update and delete.

    // all food menu collect form database using GET API
    app.get('/foodMenu', async (req, res) => {
        const result = await foodMenuCollection.find().toArray()
        res.send(result)
    })
    // all review collection frin database using GET API.
    app.get('/review', async (req, res) => {
        const result = await reviewCollection.find().toArray()
        res.send(result)
    })
    // food cart add to database using POST API.
    app.post('/carts', async (req, res) => {
        const cart = req.body
        const result = await foodCartCollection.insertOne(cart)
        res.send(result)
    })

    // food cart collect by specific email form database using GET API.
    app.get('/carts', async (req, res) => {
        const email = req.query.email
        const query = { email: email }
        const result = await foodCartCollection.find(query).toArray()
        res.send(result)
    })

    // deleted food item from database using DELETE API.
    app.delete('/carts/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await foodCartCollection.deleteOne(query)
        res.send(result)
    })
          
    // user name and email added in database by POST API
    app.post('/user',async(req,res)=>{
        const user = req.body;
        // insert email if user doesn't exits.
        // simple checking  
        const query  = {email : user.email}
        const exitingUser = await userCollection.findOne(query)
        if (exitingUser) {
            return res.send({message : 'user already exits',insertedId : null})
        }
        const result = await userCollection.insertOne(user)
        res.send(result)
    })   

    // collect all users by GET API
    app.get('/user', async (req, res) => {
        const result = await userCollection.find().toArray()
        res.send(result)
    })

    // delete user by DELETE API
    app.delete('/user/:id',async(req,res)=>{
        const userId = req.params.id
        const query = {_id : new ObjectId(userId)}
        const result = await userCollection.deleteOne(query)
        res.send(result)
    })

    // admin created by PATCH API
    app.patch('/user/admin/:id',async(req,res)=>{
        const userId = req.params.id
        const filter = {_id : new ObjectId(userId)}
        const updateDoc = {
            $set : {
                role : 'admin'
            }
        }
        const result = await userCollection.updateOne(filter,updateDoc)
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