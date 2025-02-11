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
        async add(): Promise<AccountModel> {
            return new Promise((resolve) => resolve(makeFakeAccount()));
        }
    }
    return new AddAccountRepositoryStub();
};

const makeFakeAccount = (): AccountModel => ({
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid_email',
    password: 'hashed_password',
});

const makeFakeAccountData = (): AddAccountModel => ({
    name: 'valid_name',
    email: 'valid_email',
    password: 'valid_password',
});

const makeEncrypter = () => {
    class EncrypterStub implements Encrypter {
        async encrypt(): Promise<string> {
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
        await sut.add(makeFakeAccountData());
        expect(encryptSpy).toHaveBeenCalledWith('valid_password');
    });

    test('Should throw if Encrypter throws', async () => {
        const { sut, encrypterStub } = makeSut();
        jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
            Promise.reject(new Error())
        );
        const addAccountPromise = sut.add(makeFakeAccountData());
        await expect(addAccountPromise).rejects.toThrow();
    });

    test('Should throw if AddAccountRepository throws', async () => {
        const { sut, addAccountRepositoryStub } = makeSut();
        jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(
            Promise.reject(new Error())
        );
        const addAccountPromise = sut.add(makeFakeAccountData());
        await expect(addAccountPromise).rejects.toThrow();
    });

    test('Should call AddAccount repository with correct values', async () => {
        const { sut, addAccountRepositoryStub } = makeSut();
        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');
        await sut.add(makeFakeAccountData());
        expect(addSpy).toHaveBeenCalledWith({
            name: 'valid_name',
            email: 'valid_email',
            password: 'hashed_password',
        });
    });

    test('Should return an Account on success', async () => {
        const { sut } = makeSut();
        const account = await sut.add(makeFakeAccountData());
        expect(account).toEqual(makeFakeAccount());
    });
});
