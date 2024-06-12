import {
    Encrypter,
    AddAccount,
    AddAccountModel,
    AccountModel,
    AddAccountRepository,
} from './db-add-account-protocols';

export class DbAddAccount implements AddAccount {
    constructor(
        private readonly encrypter: Encrypter,
        private readonly addAccountRepository: AddAccountRepository
    ) {}

    async add(account: AddAccountModel): Promise<AccountModel> {
        const hashedPassword = await this.encrypter.encrypt(account.password);
        account.password = hashedPassword;
        return await this.addAccountRepository.add(account);
    }
}
