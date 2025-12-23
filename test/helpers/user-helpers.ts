import {toHash} from "../../../Blogger platform/src/services/adapters/hash";
import { UsersRepositoryPSQL } from '../../src/Modules/AuthModule/users/Repository/PostgreSQL/users.repository.psql';
import { UserPSQL } from '../../src/Modules/AuthModule/users/users.entity';

export async function addToDBSomeUser(usersRepo: UsersRepositoryPSQL, login: string = 'testling', password: string = 'testPass'): Promise<{login: string, password: string}> {
    await usersRepo.save(UserPSQL.CreateAdminUser({login: login,
        password: await toHash(password),
        email: 'test542@gmail.com',
    }))
    return {login, password}
}

export async function getSomeExistingUserId(usersRepo: UsersRepositoryPSQL): Promise<string> {
    return (await usersRepo.findRandom())!.id;
}