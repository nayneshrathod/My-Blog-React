import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb'
import path from 'path';
const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());


const withDB = async (operations, res) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
        const db = client.db('my-blog');
        await operations(db);
        client.close();
    } catch (error) {
        res.status(500).json({ massege: 'not vonnrct has now   DB  ', error });
    }
}

app.get('/api/articles/:name', async (req, res) => {
    const articleName = req.params.name;
    withDB(async (db) => {
        const articlesInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(articlesInfo);
    }, res);
});

app.post('/api/articles/:name/upvotes', async (req, res) => {

    const articleName = req.params.name;
    withDB(async (db) => {
        const articlesInfo = await db.collection('articles').findOne({ name: articleName });
        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': {
                upvotes: articlesInfo.upvotes + 1,
            },
        });
        const UpdatearticlesInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(UpdatearticlesInfo);
    }, res);
});

app.post('/api/articles/:name/add-comment', async (req, res) => {

    const { username, text } = req.body;
    const articleName = req.params.name;
    withDB(async (db) => {
        const articlesInfo = await db.collection('articles').findOne({ name: articleName });
        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': {
                comments: articlesInfo.comments.concat({ username, text }),
            },
        });
        const UpdatearticlesInfo = await db.collection('articles').findOne({ name: articleName });
        res.status(200).json(UpdatearticlesInfo);
    }, res);
});

// app.get('/hello', (req, res) => res.send("Hello"));
// app.get('/hello/:name', (req, res) => res.send(`Hello ${req.params.name}!`));
// app.post('/hello', (req, res) => res.send(`Hello ${req.body.name}!`));

app.get('*', (req, res) => res.send(path.join(__dirname + '/build/index.html')));
app.listen(8000, () => console.log("Listing on http://localhost:8000/ "));


// const articlesInfo = {
//     'learn-react': {
//         upvotes: 0,
//         comments: []
//     },
//     'learn-node': {
//         upvotes: 0,
//         comments: []
//     },
//     'my-thoughts-on-resumes': {
//         upvotes: 0,
//         comments: []
//     },
// }

// db.articles.insert([{ name:'learn-react', 
//     upvotes: 0,
//         comments: []
// },{ 
// name:'learn-node',
//     upvotes: 0,
//         comments: []
// }, { 
// name:'my-thoughts-on-resumes', 
// upvotes: 0,
//         comments: []
// }])

// db.articles.find({}) 

// db.articles.find({}).pretty()

// db.articles.find({name:'learn-node'}).pretty()

// db.articles.findOne({name:'learn-node'}) 

