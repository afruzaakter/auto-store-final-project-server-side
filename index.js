const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const jwt = require('jsonwebtoken');

app.use(cors())
app.use(express.json())


//mongodb connection


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u5smt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//JWT token function
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader) {
      return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: 'Forbidden access' })
      }
      req.decoded = decoded;
      next();
    });
  }

async function run(){
    try{
        await client.connect();
        // console.log('database connection success');
        const servicesCollection = client.db('auto-store').collection('services');
        const purchaseCollection = client.db('auto-store').collection('purchase');
        const userCollection = client.db('auto-store').collection('users');

        app.post('/purchase',async(req, res) =>{
            const purchase = req.body;
            // console.log(purchase)
            const result = await purchaseCollection.insertOne(purchase);
            res.send(result);
            // console.log(result);
        });
       
       
        
        // delete
        app.delete('/purchase/:id',async( req, res)=>{
            const id = req.params.id;
            // console.log('id',id);
            const query = {_id: ObjectId(id)}
            const result = await purchaseCollection.deleteOne(query);
            res.send(result);
            console.log(result);
        })

        // purchase table data show// JWT acc
        // app.get('/purchase', verifyJWT, async(req, res) =>{
        //     const order = req.query.userEmail;
        //     const decodedEmail = req.decoded.email;
        //     if(userEmail === decodedEmail){
        //         console.log('auth ', authorization);
        //         const query = {order: userEmail};
        //         const purchase = await purchaseCollection.find(query).toArray();
        //         return res.send(purchase); 
        //     }
        //     else{
        //         return res.status(403).send({message: 'forbidden access'})
        //     }
        // })


        //purchase table data show//
        app.get('/purchase', async(req, res) =>{
            const order = req.query.userEmail;
                const query = {order: order};
                const purchase = await purchaseCollection.find(query).toArray();
                res.send(purchase); 
        })
        
        //get user make admin
        app.get('/user',verifyJWT, async(req, res) =>{
            const users = await userCollection.find().toArray();
            res.send(users);
        })
        //user collection
        app.put('/user/:email', async(req, res )=>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = {upsert: true};
            const updateDoc ={
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h' });
            console.log(token)

            res.send({result, token});
        })
        //user collection
        app.put('/user/:email', async(req, res )=>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = {upsert: true};
            const updateDoc ={
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h' });
            console.log(token)

            res.send({result, token});
        })
        //user  admin collection
        app.put('/user/admin/:email',verifyJWT, async(req, res )=>{
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({email: requester})
            if(requesterAccount.role === 'admin'){
                const filter = {email: email};
                const updateDoc ={
                    $set: {role: 'admin'},
                };
                const result = await userCollection.updateOne(filter, updateDoc, );      
                res.send(result);
            }
            else{
                res.status(403).send({message: 'forbidden'});
            }
           
        })

        //all services
        app.get('/service', async(req, res) =>{
            const query = {}
            const cursur = servicesCollection.find(query);
            const services = await cursur.toArray();
            res.send(services);

        });
        //only one product details
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('params',id);
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        })
        //delete
      
        
        //update
        app.put('/service/:id', async(req, res) =>{
            const id = req.params.id;
            const product = req.body;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updateProduct = {
                $set: {
                    name: product.name,
                    price: product.price,
                    img: product.img,
                    description: product.description,
                    minimumOrderQuantity: product.minimumOrderQuantity,
                    availableQuantity: product.availableQuantity,
                }
            };
            const result = await servicesCollection.updateOne(filter, updateProduct, options);
            res.send(result);
        })

    }
    finally{

    }
}
 run().catch(console.dir);


app.get('/',(req, res) =>{
    res.send('Server is Running');
});
app.listen(port,() =>{
    console.log('Listening to port',port);
});



