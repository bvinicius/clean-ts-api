import { Controller, HttpResponse } from '../../presentation/protocols';
import { LogControllerDecorator } from './log';

interface SutTypes {
    sut: LogControllerDecorator;
    controllerStub: Controller;
}
const makeController = (): Controller => {
    class ControllerStub implements Controller {
        async handle(): Promise<HttpResponse> {
            return {
                statusCode: 200,
                body: {
                    id: 'valid_id',
                    name: 'valid_name',
                    email: 'valid_email@mail.com',
                    password: 'valid_password',
                },
            };
        }
    }
    return new ControllerStub();
};
const makeSut = (): SutTypes => {
    const controllerStub = makeController();
    const sut = new LogControllerDecorator(controllerStub);
    return { sut, controllerStub };
};

describe('LogControllerDecorator', () => {
    test('Should call controller handle', async () => {
        const { sut, controllerStub } = makeSut();
        const handleSpy = jest.spyOn(controllerStub, 'handle');
        const httpRequest = {
            body: {
                name: 'any_name',
            },
        };
        await sut.handle(httpRequest);
        expect(handleSpy).toHaveBeenCalledWith(httpRequest);
    });

    test('Should return same result of the controller', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                name: 'valid_name',
                email: 'valid_email@mail.com',
                password: 'valid_password',
                passwordConfirmation: 'valid_password',
            },
        };
        const httpResponse = await sut.handle(httpRequest);
        expect(httpResponse).toEqual({
            statusCode: 200,
            body: {
                id: 'valid_id',
                name: 'valid_name',
                email: 'valid_email@mail.com',
                password: 'valid_password',
            },
        });
    });
});
