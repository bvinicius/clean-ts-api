import {
    Controller,
    HttpRequest,
    HttpResponse,
} from '../../presentation/protocols';
import { LogControllerDecorator } from './log';
import { LogErrorRepository } from '../../data/protocols/log-error-repository';
import { ok, serverError } from '../../presentation/helpers/http-helper';
import { AccountModel } from '../../domain/models/account';

interface SutTypes {
    sut: LogControllerDecorator;
    controllerStub: Controller;
    logErrorRepositoryStub: LogErrorRepository;
}

const makeController = (): Controller => {
    class ControllerStub implements Controller {
        async handle(): Promise<HttpResponse> {
            return ok(makeFakeAccount());
        }
    }
    return new ControllerStub();
};

const makeLogErrorRepository = (): LogErrorRepository => {
    class LogErrorRepositoryStub implements LogErrorRepository {
        async logError(stack: string): Promise<void> {
            console.log(stack);
        }
    }
    return new LogErrorRepositoryStub();
};

const makeSut = (): SutTypes => {
    const controllerStub = makeController();
    const logErrorRepositoryStub = makeLogErrorRepository();
    const sut = new LogControllerDecorator(
        controllerStub,
        logErrorRepositoryStub
    );
    return { sut, controllerStub, logErrorRepositoryStub };
};

const makeFakeRequest = (): HttpRequest => ({
    body: {
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password',
        passwordConfirmation: 'valid_password',
    },
});

const makeFakeAccount = (): AccountModel => ({
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid_email@mail.com',
    password: 'valid_password',
});

const makeServerError = (): HttpResponse => {
    const fakeError = new Error();
    fakeError.stack = 'any_stack';
    return serverError(fakeError);
};

describe('LogControllerDecorator', () => {
    test('Should call controller handle', async () => {
        const { sut, controllerStub } = makeSut();
        const handleSpy = jest.spyOn(controllerStub, 'handle');
        await sut.handle(makeFakeRequest());
        expect(handleSpy).toHaveBeenCalledWith(makeFakeRequest());
    });

    test('Should return same result of the controller', async () => {
        const { sut } = makeSut();
        const httpResponse = await sut.handle(makeFakeRequest());
        expect(httpResponse).toEqual(ok(makeFakeAccount()));
    });

    test('Should call LogErrorRepository with correct error if controller returns a server error', async () => {
        const { sut, controllerStub, logErrorRepositoryStub } = makeSut();
        const logSpy = jest.spyOn(logErrorRepositoryStub, 'logError');
        jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(
            Promise.resolve(makeServerError())
        );
        await sut.handle(makeFakeRequest());
        expect(logSpy).toHaveBeenCalledWith('any_stack');
    });
});
