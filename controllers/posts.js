const Posts = require('../models/posts');

const createPost = async ({title, author, timestamp, isPublished}) => {
    let result;
    if (isPublished)
        result = await Posts.create({
            isPublished: true,
            title: title,
            author: author,
            timestamp: timestamp,
            publishedDate: Date.now(),
        });
    else 
        result = await Posts.create({
            isPublished: false,
            title: title,
            author: author,
            timestamp: timestamp,
        });
    return result.dataValues;
}

const getAllPosts = async () => {
    const result = await Posts.findAll();
    return result;
}

const getPost = async (id) => {
    const result =  await Posts.findOne({where: {id: id}});
    if (result === null) {
       return 'ID not found';
      }
    return result;        
}

module.exports = {
    createPost,
    getAllPosts,
    getPost,
}