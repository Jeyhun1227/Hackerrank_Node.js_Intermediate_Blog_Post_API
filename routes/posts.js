const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts');

// POST /posts
router.post('/', async (req, res) => {
  try {
    let result;
    if (req.body.isPublished)
      result = await postsController.createPost({
        title: req.body.title,
        author: req.body.author,
        timestamp: req.body.timestamp,
        isPublished: req.body.isPublished
      })
    else
      result = await postsController.createPost({
        title: req.body.title,
        author: req.body.author,
        timestamp: req.body.timestamp,
      })
    console.log("posts: ", result);
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /posts
router.get('/', async (req, res) => {
  try {
    const result = await postsController.getAllPosts();
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async(req, res) => {
  try {
    const result = await postsController.getPost(req.params.id);
    if (result === 'ID not found')
      return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
})

router.delete('/:id', async(req, res) => {
  return res.status(405).send();
})
router.put('/:id', async(req, res) => {
  return res.status(405).send();
})
router.patch('/:id', async(req, res) => {
  return res.status(405).send();
})

module.exports = router;
