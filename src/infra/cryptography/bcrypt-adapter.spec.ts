import bcrypt from 'bcrypt';
import { BCryptAdapter } from './bcrypt-adapter.';

const HASH_SALT = 12;

jest.mock('bcrypt', () => ({
    async hash(): Promise<string> {
        return 'hashed_value';
    },
}));

describe('BCrypt Adapter', () => {
    test('Should call bcrypt with correct value', async () => {
        const sut = new BCryptAdapter(HASH_SALT);
        const hashSpy = jest.spyOn(bcrypt, 'hash');
        await sut.encrypt('any_value');
        expect(hashSpy).toHaveBeenCalledWith('any_value', HASH_SALT);
    });

    test('Should return a hash on success', async () => {
        const sut = new BCryptAdapter(HASH_SALT);
        const hash = await sut.encrypt('any_value');
        expect(hash).toBe('hashed_value');
    });
});
