import request from 'supertest';
import app from '../config/app';

describe('Content Type Middleware', () => {
    test('Should default content type as application/json', async () => {
        app.get('/test_content_type', (req, res) => {
            res.send();
        });

        await request(app)
            .get('/test_content_type')
            .expect('content-type', /json/);
    });

    test('Should return xml when forced', async () => {
        app.get('/test_content_type_xml', (req, res) => {
            res.type('xml');
            res.send('');
        });

        await request(app)
            .get('/test_content_type_xml')
            .expect('content-type', /xml/);
    });
});
