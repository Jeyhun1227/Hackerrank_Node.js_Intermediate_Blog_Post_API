const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const should = chai.should();
const BlueBird = require('bluebird');
const Posts = require('../models/posts');
const {expect} = require('chai')

chai.use(chaiHttp);

const setup = (...posts) => {
    return BlueBird.mapSeries(posts, post => {
        return chai.request(server)
            .post('/posts')
            .send(post)
            .then(response => {
                return response.body;
            })
    })
}

const cleanUp = (posts) => {
    return posts.map(post => {
        delete post.publishedDate;
        return post;
    })
}

describe('blog_posts_api_medium', () => {
    const user1_published = {
        "isPublished": true,
        "title": "Overcoming Bias in Recruiting to Create a Culture of Diversity & Inclusion",
        "author": 1,
        "timestamp": 1531522701000
    }

    const user2_unpublished = {
        "isPublished": false,
        "title": "Introducing HackerRank’s First Virtual Career Fair",
        "author": 2,
        "timestamp": 1521522701000
    }

    const user1_unpublished = {
        "isPublished": false,
        "title": "3 Ways to Crush Your Technical Online Interview",
        "author": 1,
        "timestamp": 1521522701000
    }

    const user3_published = {
        "isPublished": true,
        "title": "New Technical Skills Certifications for Job Seekers",
        "author": 3,
        "timestamp": 1521522701000
    }


    beforeEach(async () => {
        await Posts.sync();
    })

    afterEach(async () => {
        await Posts.drop();
    })

    it('should create a published post', async () => {
        const response = await chai.request(server).post('/posts').send(user1_published)
        response.should.have.status(201);
        delete response.body.id;
        const publishedDate = response.body.publishedDate;
        delete response.body.publishedDate;
        response.body.should.eql(user1_published)
        publishedDate.should.be.greaterThan(new Date().getTime() - 5000);
    });

    it('should create an unpublished post', async () => {
        const response = await chai.request(server).post('/posts').send(user2_unpublished)
        response.should.have.status(201);
        delete response.body.id;
        response.body.should.eql(user2_unpublished)
        expect(response.body.publishedDate).to.not.be.ok;
    });

    it('should fetch all the posts', async () => {
        const results = await setup(user3_published, user1_unpublished, user2_unpublished, user1_published);
        const response = await chai.request(server).get('/posts')
        response.should.have.status(200);
        const publishedDates = response.body.map(post => post.publishedDate);
        cleanUp(response.body).should.eql(cleanUp(results));
        publishedDates.forEach((date, index) => {
            if([0, 3].includes(index)) {
                date.should.be.greaterThan(new Date().getTime() - 5000);
            } else {
                expect(date).to.not.be.ok;
            }
        })
    })

    it('should fetch all the posts if the isPublished filter value does not exist', async () => {
        const posts = await setup(user3_published, user1_unpublished, user2_unpublished, user1_published);
        const response = await chai.request(server).get('/posts?isPublished=test')
        response.should.have.status(200);
        cleanUp(response.body).should.eql(cleanUp(posts));
    })

    it('should fetch all posts for an author', async () => {
        const posts = await setup(user3_published, user1_unpublished, user2_unpublished, user1_published);
        const response = await chai.request(server).get('/posts?author=1')
        response.should.have.status(200);
        cleanUp(response.body).should.eql(cleanUp([posts[1], posts[3]]));
    })

    it('should fetch no posts if author filter value does not exist', async () => {
        await setup(user3_published, user1_unpublished, user2_unpublished, user1_published);
        const response = await chai.request(server).get('/posts?author=3233')
        response.should.have.status(200);
        response.body.should.eql([]);
    })

    it('should fetch all published posts for an author', async () => {
        const posts = await setup(user3_published, user1_unpublished, user2_unpublished, user1_published);
        const response = await chai.request(server).get('/posts?author=1&isPublished=true')
        response.should.have.status(200);
        cleanUp(response.body).should.eql(cleanUp([posts[3]]));
    })

    it('should fetch all unpublished posts for an author', async () => {
        const posts = await setup(user3_published, user1_unpublished, user2_unpublished, user1_published);
        const response = await chai.request(server).get('/posts?author=1&isPublished=false')
        response.should.have.status(200);
        cleanUp(response.body).should.eql(cleanUp([posts[1]]));
    })

    it('should fetch a single post', async () => {
        const [post] = await setup(user2_unpublished);
        const response = await chai.request(server).get(`/posts/${post.id}`)
        response.should.have.status(200);
        cleanUp([response.body]).should.eql(cleanUp([post]));
    })

    it('should get 404 if the post ID does not exist', async () => {
        const response = await chai.request(server).get(`/posts/32323`)
        response.should.have.status(404);
        response.text.should.eql('ID not found');
    })

    it('should get 405 for a put request to /posts/:id', async () => {
        const [post] = await setup(user1_published);
        const response = await chai.request(server).put(`/posts/${post.id}`).send(user1_published)
        response.should.have.status(405);
    })

    it('should get 405 for a patch request to /posts/:id', async () => {
        const [post] = await setup(user1_published);
        const response = await chai.request(server).patch(`/posts/${post.id}`).send(user1_published)
        response.should.have.status(405);
    })

    it('should get 405 for a delete request to /posts/:id', async () => {
        const [post] = await setup(user1_published);
        const response = await chai.request(server).delete(`/posts/${post.id}`)
        response.should.have.status(405);
    })
});
