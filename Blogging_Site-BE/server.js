const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const Post = require('./models/Post');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Test Server
app.get('/', (req, res) => {
    res.json('Hey Client I am Alive!');
});

// Fetch Blog Posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Error retrieving posts', details: err.message });
    }
});

// Create a new Blog Post
app.post('/create', async (req, res) => {
    console.log(req.body);
    try {
        const { title, author, content } = req.body;
        const newPost = new Post({ title, author, content });
        await newPost.save();
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Error creating post', details: err.message });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
