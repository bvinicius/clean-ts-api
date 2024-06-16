import { Collection, MongoClient } from 'mongodb';

export const MongoHelper = {
    client: null as MongoClient,

    async connect(url: string) {
        this.client = await MongoClient.connect(url);
    },

    async disconnect() {
        await this.client.close();
    },

    getCollection(name: string): Collection {
        return this.client.db().collection(name);
    },

    map: <T>(collection: any): T => {
        const { _id, ...collectionWithoutId } = collection;
        return Object.assign({}, collectionWithoutId, { id: _id });
    },
};
