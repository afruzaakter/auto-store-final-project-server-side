const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


//mongodb connection


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u5smt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        // console.log('database connection success');
        const servicesCollection = client.db('auto-store').collection('services');
        const purchaseCollection = client.db('auto-store').collection('purchase');

        app.post('/purchase',async(req, res) =>{
            const purchase = req.body;
            // console.log(purchase)
            const result = await purchaseCollection.insertOne(purchase);
            res.send(result);
            // console.log(result);
        });

        app.get('/purchase', async(req, res) =>{
            const user = req.query.userEmail;
            console.log("user",user);
            const query = {user: user};
            const purchases = await purchaseCollection.find(query).toArray();
            res.send(purchases);
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
            console.log('params',id);
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service);
        })
        
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



