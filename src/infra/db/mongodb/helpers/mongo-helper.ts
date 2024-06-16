import { Collection, MongoClient } from 'mongodb';

export const MongoHelper = {
    client: null as MongoClient,
    url: null as string,

    async connect(url: string) {
        this.client = await MongoClient.connect(url);
        this.url = url;
    },

    async disconnect() {
        await this.client.close();
        this.client = null;
    },

    async getCollection(name: string): Promise<Collection> {
        if (!this.client) {
            await this.connect(this.url);
        }
        return this.client.db().collection(name);
    },

    map: <T>(collection: any): T => {
        const { _id, ...collectionWithoutId } = collection;
        return Object.assign({}, collectionWithoutId, { id: _id });
    },
};
