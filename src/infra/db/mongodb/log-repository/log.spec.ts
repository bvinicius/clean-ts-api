import { MongoHelper } from '../helpers/mongo-helper';
import env from '../../../../main/config/env';
import { Collection } from 'mongodb';
import { LogMongoRepository } from './log';

const makeSut = () => {
    return new LogMongoRepository();
};

describe('Log Mongo Repository', () => {
    let errorCollection: Collection;

    beforeAll(async () => {
        await MongoHelper.connect(env.mongoUrl);
    });

    beforeEach(async () => {
        errorCollection = await MongoHelper.getCollection('errors');
        await errorCollection.deleteMany({});
    });

    afterAll(async () => {
        await MongoHelper.disconnect();
    });

    test('Should create an error log on success', async () => {
        const sut = makeSut();
        await sut.logError('any_error');
        const count = await errorCollection.countDocuments();
        expect(count).toBe(1);
    });
});
