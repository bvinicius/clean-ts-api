import bcrypt from 'bcrypt';
import { BCryptAdapter } from './bcrypt-adapter';

jest.mock('bcrypt', () => ({
    async hash(): Promise<string> {
        return 'hashed_value';
    },
}));

const HASH_SALT = 12;

const makeSut = () => {
    return new BCryptAdapter(HASH_SALT);
};

describe('BCrypt Adapter', () => {
    test('Should call bcrypt with correct value', async () => {
        const sut = makeSut();
        const hashSpy = jest.spyOn(bcrypt, 'hash');
        await sut.encrypt('any_value');
        expect(hashSpy).toHaveBeenCalledWith('any_value', HASH_SALT);
    });

    test('Should return a hash on success', async () => {
        const sut = makeSut();
        const hash = await sut.encrypt('any_value');
        expect(hash).toBe('hashed_value');
    });

    test('Should throw if bcrypt throws', async () => {
        const sut = makeSut();
        jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => {
            throw Error('test_error');
        });
        const promise = sut.encrypt('any_value');
        await expect(promise).rejects.toThrow();
    });
});
