import request from 'supertest';
import app from '../config/app';
import env from '../config/env';
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper';

describe('SignUp Routes', () => {
    beforeAll(async () => {
        await MongoHelper.connect(env.mongoUrl);
    });

    beforeEach(async () => {
        const accountCollection = MongoHelper.getCollection('accounts');
        await accountCollection.deleteMany({});
    });

    afterAll(async () => {
        await MongoHelper.disconnect();
    });

    test('Should return an account on success', async () => {
        await request(app)
            .post('/api/signup')
            .send({
                name: 'any_name',
                email: 'any_email@mail.com',
                password: 'any_password',
                passwordConfirmation: 'any_password',
            })
            .expect(200);
    });
});
