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
    const foodMenuCollection = client.db("BistroBoss").collection("menu")
    const reviewCollection = client.db("BistroBoss").collection("review")
    const foodCartCollection = client.db("BistroBoss").collection("foodCart")
    const userCollection = client.db("BistroBoss").collection("user")
    // create api like post,get,patch,update and delete.

      //  middleware 
      
      const verifyToken = (req,res,next) => { 
        // console.log('inside verify token',req.headers.authorization);
         if (!req.headers.authorization) { 
              return res.status(401).send({message:"unauthorized access"})
         }
         const token = req.headers.authorization.split(' ')[1]
         jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,decoded) => {
            if (err) {
                return res.status(401).send({message:"unauthorized access"})
            }
            req.decoded = decoded 
            next()
         })
    }

    // verified admin 
    // user verify admin after verifyToken
    const verifyAdmin = async(req,res,next)=>{
       const email = req.decoded.email
       const query = {email: email}
       const user = await userCollection.findOne(query)
       const isAdmin = user?.role === 'admin'
       if (!isAdmin) {
           return res.status(403).send({message:'forbidden access'})
       }
       next()
    }

    // all food menu collect form database using GET API
    app.get('/foodMenu', async (req, res) => {
        const result = await foodMenuCollection.find().toArray()
        res.send(result)
    }) 
    // specific foodMenu collect.
    app.get('/foodMenu/:id',async(req,res)=>{ 
        const id = req.params.id
        const filter = {_id : new ObjectId(id)}
        const result = await foodMenuCollection.findOne(filter)
        res.send(result)
    }) 
 
    // post food menu 
    app.post('/foodMenu',verifyToken,verifyAdmin, async(req,res)=>{
        const menu = req.body
        const result = await foodMenuCollection.insertOne(menu)
        res.send(result)
    })
    // deleted foodMenu Item
    app.delete('/foodMenu/:id', async(req,res)=>{
         const id = req.params.id
         const query = {_id : new ObjectId(id)}
         const result = await foodMenuCollection.deleteOne(query)
         res.send(result)
    })

    // update food menu
      app.patch('/foodMenu/:id',async(req,res)=>{
        const id = req.params.id
        const menu = req.body
        console.log(menu);
        const filter = {_id : new ObjectId(id)}
        const updateDoc = {
         $set: {
           name :       menu.name,
           category :   menu.category,
           price :      menu.price,
           image :      menu.image,
           recipe :     menu.recipe,
         },
       };
       const updatedFoodMenu = await foodMenuCollection.updateOne(filter,updateDoc)
       res.send(updatedFoodMenu)
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
    app.get('/user',verifyToken, verifyAdmin, async (req, res) => {
        const result = await userCollection.find().toArray()
        res.send(result)
    })

    app.get('/user/admin/:email',verifyToken,async(req,res)=>{
       const email  = req.params.email
       if (email !== req.decoded.email) {
          return res.status(403).send({message:"forbidden access"})
       }
       const query = {email : email};
       const user = await userCollection.findOne(query)
       let admin = false
       if (user) {
           admin = user?.role === 'admin'
       }
       res.send({admin})
    }) 

    // delete user by DELETE API
    app.delete('/user/:id', verifyToken , verifyAdmin, async(req,res)=>{
        const userId = req.params.id
        const query = {_id : new ObjectId(userId)}
        const result = await userCollection.deleteOne(query)
        res.send(result)
    })

    // admin created by PATCH API
    app.patch('/user/admin/:id',verifyToken,verifyAdmin, async(req,res)=>{
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

    // jwt related api 
    app.post('/jwt',async(req,res)=>{
        const user = req.body  
        const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'2h'})
        res.send({token})
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