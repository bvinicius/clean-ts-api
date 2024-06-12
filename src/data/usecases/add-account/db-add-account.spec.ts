import { AddAccountRepository } from '../../protocols/add-account-repository';
import { DbAddAccount } from './db-add-account';
import {
    Encrypter,
    AddAccountModel,
    AccountModel,
} from './db-add-account-protocols';

interface SutTypes {
    sut: DbAddAccount;
    encrypterStub: Encrypter;
    addAccountRepositoryStub: AddAccountRepository;
}

const makeAddAccountRepository = (): AddAccountRepository => {
    class AddAccountRepositoryStub implements AddAccountRepository {
        async add(accountData: AddAccountModel): Promise<AccountModel> {
            const fakeAccount = {
                ...accountData,
                id: 'valid_id',
                password: 'hashed_password',
            };
            return new Promise((resolve) => resolve(fakeAccount));
        }
    }
    return new AddAccountRepositoryStub();
};

const makeEncrypter = () => {
    class EncrypterStub implements Encrypter {
        async encrypt(value: string): Promise<string> {
            return 'hashed_password';
        }
    }
    return new EncrypterStub();
};

const makeSut = (): SutTypes => {
    const encrypterStub = makeEncrypter();
    const addAccountRepositoryStub = makeAddAccountRepository();
    const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub);
    return {
        sut,
        encrypterStub,
        addAccountRepositoryStub,
    };
};

describe('DbAddAccount Usecase', () => {
    test('Should call Encrypter with correct password', async () => {
        const { sut, encrypterStub } = makeSut();
        const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');

        const accountData = {
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password',
        };

        await sut.add(accountData);
        expect(encryptSpy).toHaveBeenCalledWith('valid_password');
    });

    test('Should throw if Encrypter throws', async () => {
        const { sut, encrypterStub } = makeSut();
        jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
            Promise.reject(new Error())
        );

        const accountData = {
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password',
        };

        const addAccountPromise = sut.add(accountData);
        await expect(addAccountPromise).rejects.toThrow();
    });

    test('Should call AddAccount repository with correct values', async () => {
        const { sut, addAccountRepositoryStub } = makeSut();
        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');

        const accountData = {
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password',
        };

        await sut.add(accountData);
        expect(addSpy).toHaveBeenCalledWith({
            name: 'valid_name',
            email: 'valid_email',
            password: 'hashed_password',
        });
    });
});
