const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
var ObjectId = require('mongodb').ObjectID;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vys9a.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('weddings'));
app.use(fileUpload());


const port = 7000;

app.get('/', (req, res) => {
    res.send("It's Working!")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const photographerBookCollection = client.db("weddingPhotography").collection("photographerBook");
    const adminCollection = client.db("weddingPhotography").collection("admin");
    const recentWeddingCollection = client.db("weddingPhotography").collection('recentWedding');
    const bookingCollection = client.db("weddingPhotography").collection('booking');
    const serviceCollection = client.db("weddingPhotography").collection('services');
    const reviewCollection = client.db("weddingPhotography").collection('reviews');


    app.post('/addPhotographerBook', (req, res) => {
        const book = req.body;
        console.log(book);
        photographerBookCollection.insertOne(book)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    });

    app.get('/addPhotographerBook', (req, res) => {
        photographerBookCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/booksByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
    
        photographerBookCollection.find({ date: date.date })
            .toArray((err, documents) => {
                res.send(documents)
            })


    });

    app.post('/recentWedding', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const venue = req.body.venue;
        const description = req.body.description;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };

        recentWeddingCollection.insertOne({ name, venue, description, image })
            .then(result => {
                console.log(result);
                res.send(result.insertedCount > 0)
            })
    });


    app.get('/recentWeddingInfo', (req, res) => {
        recentWeddingCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addBookConfirmation', (req, res) => {
        const booking = req.body;
        bookingCollection.insertOne(booking)
            .then(result => {
                console.log(result);
                res.send(result.insertedCount > 0)
                res.redirect('/book')
            })

    });

    app.get('/getBook', (req, res) => {
        bookingCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const timePerDay = req.body.timePerDay;
        const price = req.body.price;

        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ title, timePerDay, price, image })
            .then(result => {
                console.log(result);
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/service', (req, res) => {
        serviceCollection.find({})
            .toArray((error, documents) => {
                res.send(documents);
            })
    });



    app.get('/book/:id', (req, res) => {
        console.log(req.params.id)
        serviceCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                console.log(documents[0])
                res.send(documents[0])
            })
    })


    app.post('/addReview', (req, res) => {

        const name = req.body.name;
        const companyName = req.body.companyName;
        const description = req.body.description;

        reviewCollection.insertOne({ name, companyName, description })
            .then(result => {
                console.log(result);
                res.send(result.insertedCount > 0)
            })
    });


    app.get('/review', (req, res) => {
        reviewCollection.find({})
            .toArray((error, documents) => {
                res.send(documents);
            })
    });

    app.post('/addAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.insertOne({ email })
            .then((result) => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        console.log(email);
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                res.send(admin.length > 0);
            })
    });

});

app.listen(process.env.PORT || port)