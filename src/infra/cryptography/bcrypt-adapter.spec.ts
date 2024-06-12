import bcrypt from 'bcrypt';
import { BCryptAdapter } from './bcrypt-adapter.';

describe('BCrypt Adapter', () => {
    test('Should call bcrypt with correct value', async () => {
        const SALT = 12;
        const sut = new BCryptAdapter(SALT);
        const hashSpy = jest.spyOn(bcrypt, 'hash');
        await sut.encrypt('any_value');
        expect(hashSpy).toHaveBeenCalledWith('any_value', SALT);
    });
});
