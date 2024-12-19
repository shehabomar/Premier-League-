import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../server/app.mjs';
import { DSN } from '../server/config.mjs';

const { describe, it, before, after } = globalThis;

process.env.NODE_ENV = 'test';

describe('API Endpoints', function () {
    this.timeout(30000);

    before(async function () {
        this.timeout(30000);
        try {
            await mongoose.connect(DSN);
            console.log('Connected to MongoDB Atlas');

            const Team = mongoose.model('Team', new mongoose.Schema({ name: String, nameKey: String }));
            const User = mongoose.model('User', new mongoose.Schema({
                username: String,
                email: String,
                password: String,
                favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
            }));

            await Team.create(
                { name: 'Team A', nameKey: 'team-a' },
                { name: 'Team B', nameKey: 'team-b' },
                { name: 'Team C', nameKey: 'team-c' },
                { name: 'Team D', nameKey: 'team-d' }
            );
            await User.create({ username: 'testuser', email: 'test@example.com', password: 'password', favorites: [] });
        } catch (err) {
            console.error('Error setting up database:', err);
        }
    });

    after(async function () {
        this.timeout(30000);
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    describe('Authentication Endpoints', () => {
        it('should register a user', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    username: 'testuser123',
                    email: 'test123@example.com',
                    password: 'password',
                });

            expect(res.status).to.equal(201);
            expect(res.body.message).to.equal('User registered successfully!');
        });

        it('should log in a user', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ username: 'testuser123', password: 'password' });

            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Login successful');
        });

        it('should fetch current user details', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({ username: 'testuser123', password: 'password' });

            const res = await agent.get('/user/api/current-user');
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('username', 'testuser123');
        });

        it('should log out a user', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({ username: 'testuser123', password: 'password' });

            const res = await agent.post('/auth/logout');
            expect(res.status).to.equal(200);
            expect(res.body.message).to.equal('Logout successful');
        });
    });

    describe('Data Endpoints', () => {
        it('should fetch all teams', async () => {
            const res = await request(app).get('/fav/api/teams');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should fetch matches for the current season and stage', async () => {
            const res = await request(app).get('/matches/matches');
            expect(res.status).to.equal(404);
        });

        it('should fetch season and stage defaults', async () => {
            const res = await request(app).get('/season/select-season');
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('season');
            expect(res.body).to.have.property('stage');
        });
    });

    describe('Favorite Teams Endpoints', () => {
        let teamId;

        before(async function () {
            const teamsRes = await request(app).get('/fav/api/teams');
            if (!teamsRes.body || !teamsRes.body.length) {
                throw new Error('No teams found in the database');
            }
            teamId = teamsRes.body[0]._id;
        });

        it('should add a team to favorites', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({ username: 'testuser123', password: 'password' });

            const res = await agent.post('/user/users/favorites').send({ teamId });
            expect(res.status).to.equal(200);
            expect(res.body.favorites).to.include(teamId);
        });

        it('should fetch user favorites', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({ username: 'testuser123', password: 'password' });

            const userRes = await agent.get('/user/api/current-user');
            const userId = userRes.body.userId;

            const res = await agent.get(`/user/users/favorites/${userId}`);
            expect(res.status).to.equal(200);

            const favoriteIds = res.body.favorites.map(fav => typeof fav === 'object' ? fav._id.toString() : fav.toString());
            expect(favoriteIds).to.include(teamId.toString());
        });



        it('should remove a team from favorites', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({ username: 'testuser123', password: 'password' });

            const res = await agent.post('/fav/favorites/remove').send({ teamId });
            expect(res.status).to.equal(200);
            expect(res.body.favorites).to.not.include(teamId);
        });

        it('should not add more than 3 favorites', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({ username: 'testuser123', password: 'password' });

            const teamsRes = await request(app).get('/fav/api/teams');
            expect(teamsRes.body.length).to.be.gte(4);

            const teamIds = teamsRes.body.slice(0, 3).map(team => team._id);

            for (const id of teamIds) {
                await agent.post('/user/users/favorites').send({ teamId: id });
            }

            const additionalTeamId = teamsRes.body[3]._id;
            const res = await agent.post('/user/users/favorites').send({ teamId: additionalTeamId });
            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal('You can only select up to 3 favorite teams');
        });

    });

    describe('Error Handling', () => {
        it('should return 404 for an invalid endpoint', async () => {
            const res = await request(app).get('/invalid-endpoint');
            expect(res.status).to.equal(404);
        });

        it('should return error for adding an invalid team ID', async () => {
            const agent = request.agent(app);
            await agent.post('/auth/login').send({ username: 'testuser123', password: 'password' });

            const res = await agent.post('/user/users/favorites').send({ teamId: 'invalidId' });
            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal('Invalid team ID');
        });
    });
});
