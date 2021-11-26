const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const stripe = require('stripe')(process.env.STRIPE_SECRET)

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zwa5x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { 
     useNewUrlParser: true, 
     useUnifiedTopology: true 
}); 


async function run() {
     try{
          await client.connect();
          const database = client.db('car_sell_website');
          const userCollection = database.collection('car_sell_data');
          const userCollectionTwo = database.collection('car_sell_data_two');
          const userCollectionThree = database.collection('car_sell_data_three');
          const userCollectionRatting = database.collection('car_sell_data_Ratting');

          //Ratting post hare
          app.post('/ratting', async(req, res) => {
               const ratting = req.body;
               const result = await userCollectionRatting.insertOne(ratting);
               res.json(result);
          });

          app.get('/ratting', async(req, res) => {
               const cursor = userCollectionRatting.find({});
               const ratting = await cursor.toArray();
               res.json(ratting);
          });

          app.post('/homeproducts', async(req, res) => {
               const service = req.body;
               const result = await userCollection.insertOne(service);
               res.json(result);
          });

          app.get('/homeproducts', async(req, res) => {
               const cursor = userCollection.find({});
               const homeProduct = await cursor.toArray();
               res.send(homeProduct);
          });

          app.get('/homeproducts/:id', async(req, res) => {
               const id = req.params.id;
               const query = { _id: ObjectId(id) };
               const service = await userCollection.findOne(query);
               res.json(service);
          });

          //Car order data store to DB
          app.post('/order', async(req, res) => {
               const order = req.body;
               const result = await userCollectionTwo.insertOne(order);
               res.json(result);
          });

          //Car order data get to client side
          app.get('/order', async(req, res) => {
               const email = req.query.email;
               const query = { email: email };
               const cursor = userCollectionTwo.find(query);
               const order = await cursor.toArray();
               res.json(order);
          });

          //Payment Id hare
          app.get('/order/:id', async(req, res) => {
               const id = req.params.id;
               const query = { _id: ObjectId(id) };
               const result = await userCollectionTwo.findOne(query);
               res.json(result);
          })

          //Order delete Method
          app.delete('/order/:id', async(req, res) => {
               const id = req.params.id;
               const query = {_id: ObjectId(id)};
               const result = await userCollectionTwo.deleteOne(query);
               res.json(result)
          });

          //users GET speacial one
          app.get('/users/:email', async(req, res) => {
               const email = req.params.email;
               const query = { email: email };
               const user = await userCollectionThree.findOne(query);
               let isAdmin = false;
               if(user?.role === 'admin') {
                    isAdmin = true;
               }
               res.json({ admin: isAdmin });
          });

          //User Save to database
          app.post('/users', async(req, res) => {
               const user = req.body;
               const result = await userCollectionThree.insertOne(user);
               res.json(result);
          });

          //users PUT Method
          app.put('/users', async(req, res) => {
               const user = req.body;
               const filter = { email: user.email };
               const options = { upsert: true };
               const updateDoc = {$set: user};
               const result = await userCollectionThree.updateOne(filter, updateDoc, options);
               res.json(result);
          });

          //users/PUT Method
          app.put('/users/admin', async(req, res) => {
               const user = req.body;
               const filter = { email: user.email };
               const updateDoc = {$set: {role: 'admin'}};
               const result = await userCollectionThree.updateOne(filter, updateDoc);
               res.json(result);
          });

          app.post('/create-payment-intent', async(req, res) => {
               const paymentInfo = req.body;
               const amount = paymentInfo.price * 100;
               const paymentIntent = await stripe.paymentIntents.create({
                    currency: 'usd',
                    amount: amount,
                    payment_method_types: ['card']
               })
               res.json({clientSecret: paymentIntent.client_secret});
          });

     }
     finally{
          // await client.close();
     }
}
run().catch(console.dir);


app.get('/', (req, res) => {
     res.send('Hello Car Sell Website');
});

app.listen(port, () => {
     console.log('Server is Running', port);
});