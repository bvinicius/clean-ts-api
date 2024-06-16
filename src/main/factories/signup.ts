import { SignUpController } from '../../presentation/controllers/signup/signup';
import { EmailValidatorAdapter } from '../../utils/email-validator-adapter';
import { DbAddAccount } from '../../data/usecases/add-account/db-add-account';
import { BCryptAdapter } from '../../infra/cryptography/bcrypt-adapter';
import { AccountMongoRepository } from '../../infra/db/mongodb/account-repository/account';

export const makeSignUpController = (): SignUpController => {
    const bcryptAdapter = new BCryptAdapter(12);
    const addAccountMongoRepository = new AccountMongoRepository();
    const dbAddAccount = new DbAddAccount(
        bcryptAdapter,
        addAccountMongoRepository
    );
    const emailValidator = new EmailValidatorAdapter();
    const signUpController = new SignUpController(emailValidator, dbAddAccount);
    return signUpController;
};
