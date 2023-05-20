const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const corsConfig = {
    origin: '',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))

app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.se8uzie.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
    useNewUrlParser : true,
    useUnifiedTopology : true,
    maxPoolSize:10,   
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const toyCollection = client.db('toy-cars').collection('toys');

    // Add new toys
    app.post('/add-toys',async(req,res)=>{
      const newToy = req.body;
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    })

// Find specific user toys
    app.get('/toys/:email_id', async(req, res) => {
      const email_id = req.params.email_id;
      const query = { email: email_id }
      const cursor = toyCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
  })

    // get toys by category

     app.get('/category/:cat_id', async(req, res) => {
      const category = req.params.cat_id;
      const query = { category: category }
      const cursor = toyCollection.find(query);
      const result = await cursor.toArray()
      res.send(result)
     })
    
  // Get All Toys
  app.get('/toys', async(req, res) => {
    const cursor = toyCollection.find();
    const result = await cursor.toArray()
    res.send(result)
})

// Delete item

app.delete('/delete/:id', async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await toyCollection.deleteOne(query)
  res.send(result)
})

    // Single product
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query)
  
      res.send(result);
    })

    // Update product
    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)};
      const updatedToy = req.body;
      const updateToy = { $set: { price: updatedToy.price, qty:updatedToy.qty, description: updatedToy.description } }
      const options = { upsert: false };

      const result = await toyCollection.updateOne(filter, updateToy, options)
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Server is running..')
})

app.listen(port, () => {
  console.log('Server is running at port: ', port)
})