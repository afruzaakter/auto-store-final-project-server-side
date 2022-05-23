const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


//mongodb connection

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u5smt.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        // console.log('database connection success');
        const servicesCollection = client.db('auto-store').collection('services');

        app.get('/service', async(req, res) =>{
            const query = {}
            const cursur = servicesCollection.find(query);
            const services = await cursur.toArray();
            res.send(services);

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



