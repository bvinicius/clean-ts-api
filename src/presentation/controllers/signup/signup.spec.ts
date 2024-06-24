import {
    InvalidParamError,
    MissingParamError,
    ServerError,
} from '../../errors';
import {
    EmailValidator,
    AccountModel,
    AddAccount,
    HttpRequest,
} from './signup-protocols';
import { SignUpController } from './signup';
import { badRequest, ok, serverError } from '../../helpers/http-helper';

const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
        isValid(): boolean {
            return true;
        }
    }
    return new EmailValidatorStub();
};

const makeAddAccount = (): AddAccount => {
    class AddAccountStub implements AddAccount {
        async add(): Promise<AccountModel> {
            return makeFakeAccount();
        }
    }
    return new AddAccountStub();
};

const makeFakeRequest = (): HttpRequest => ({
    body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'any_password',
        passwordConfirmation: 'any_password',
    },
});

const makeFakeAccount = (): AccountModel => ({
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid_email@mail.com',
    password: 'valid_password',
});

interface SutTypes {
    sut: SignUpController;
    emailValidatorStub: EmailValidator;
    addAccountStub: AddAccount;
}

const makeSut = (): SutTypes => {
    const emailValidatorStub = makeEmailValidator();
    const addAccountStub = makeAddAccount();
    const sut = new SignUpController(emailValidatorStub, addAccountStub);
    return { sut, emailValidatorStub, addAccountStub };
};

describe('SignUp Controller', () => {
    test('Should return 400 if no name is provided', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                email: 'any_email@mail.com',
                password: 'any_password',
                passwordConfirmation: 'any_password',
            },
        };

        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(badRequest(new MissingParamError('name')));
    });

    test('Should return 400 if no email is provided', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                name: 'any_name',
                password: 'any_password',
                passwordConfirmation: 'any_password',
            },
        };

        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(
            badRequest(new MissingParamError('email'))
        );
    });

    test('Should return 400 if no password is provided', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@mail.com',
                passwordConfirmation: 'any_password',
            },
        };

        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(
            badRequest(new MissingParamError('password'))
        );
    });

    test('Should return 400 if no passwordConfirmation is provided', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@mail.com',
                password: 'any_password',
            },
        };

        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(
            badRequest(new MissingParamError('passwordConfirmation'))
        );
    });

    test('Should return 400 if password and passwordConfirmation are not equal', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@mail.com',
                password: 'any_password',
                passwordConfirmation: 'invalid_password',
            },
        };

        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual(
            badRequest(new InvalidParamError('passwordConfirmation'))
        );
    });

    test('Should return 400 if an invalid email is provided', async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);

        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(
            badRequest(new InvalidParamError('email'))
        );
    });

    test('Should call EmailValidator with correct email', async () => {
        const { sut, emailValidatorStub } = makeSut();
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');

        sut.handle(makeFakeRequest());
        expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com');
    });

    test('Should return 500 if EmailValidator throws', async () => {
        const { sut, emailValidatorStub } = makeSut();
        const fakeError = new Error('any_error');
        fakeError.stack = 'any_stack';

        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
            throw fakeError;
        });
        const httpRequest = makeFakeRequest();
        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse.statusCode).toBe(500);
        expect(httpResponse.body).toEqual(new ServerError('any_stack'));
    });

    test('Should return 500 if AddAccount throws', async () => {
        const { sut, addAccountStub } = makeSut();
        const fakeError = new Error();
        fakeError.stack = 'any_stack';

        jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
            throw fakeError;
        });
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(serverError(new ServerError('any_stack')));
    });

    test('Should call AddAccount with correct values', async () => {
        const { sut, addAccountStub } = makeSut();
        const addSpy = jest.spyOn(addAccountStub, 'add');

        sut.handle(makeFakeRequest());
        expect(addSpy).toHaveBeenCalledWith({
            name: 'any_name',
            email: 'any_email@mail.com',
            password: 'any_password',
        });
    });

    test('Should return 200 if valid data is provided', async () => {
        const { sut } = makeSut();

        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(ok(makeFakeAccount()));
    });
});
