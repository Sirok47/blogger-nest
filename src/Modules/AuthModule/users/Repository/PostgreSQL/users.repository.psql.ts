import { Injectable } from '@nestjs/common';
import { User, UserInputModel, UserPSQL } from '../../users.models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUsersRepository } from '../../Service/users.service';
import { ConfirmationDataPSQL } from '../../confData.models';

@Injectable()
export class UsersRepositoryPSQL implements IUsersRepository {
  constructor(
    @InjectRepository(UserPSQL)
    private readonly repo: Repository<UserPSQL>,
    @InjectRepository(ConfirmationDataPSQL)
    private readonly confDataRepo: Repository<ConfirmationDataPSQL>,
  ) {}

  createAdmin(user: UserInputModel): User {
    return UserPSQL.CreateAdminUser(user);
  }

  createUser(user: UserInputModel): User {
    return UserPSQL.CreateRegularUser(user);
  }

  async save(user: UserPSQL): Promise<UserPSQL> {
    return this.repo.save(user);
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserPSQL | null> {
    return this.repo.findOneBy([
      { login: loginOrEmail },
      { email: loginOrEmail },
    ]);
  }

  async findById(id: string): Promise<UserPSQL | null> {
    return this.repo.findOneBy({ id: id });
  }

  async findWithCode(code: string): Promise<UserPSQL | null> {
    return this.repo.findOneBy({
      confirmationData: { confirmationCode: code },
    });
  }

  async changePassword(userId: string, newPass: string): Promise<boolean> {
    const result = await this.repo.update(
      { id: userId },
      { password: newPass },
    );
    return !!result.affected;
  }

  async updateConfirmationCode(
    userId: string,
    code: string,
    expDate: Date,
  ): Promise<boolean> {
    const result = await this.confDataRepo.update(
      { userId: userId },
      {
        confirmationCode: code,
        confirmationCodeExpDate: expDate,
      },
    );

    return !!result.affected;
  }

  async setToConfirmed(code: string): Promise<boolean> {
    const result = await this.confDataRepo.update(
      { confirmationCode: code },
      { isConfirmed: true },
    );

    return !!result.affected;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return !!result.affected;
  }

  async retrievePassword(id: string): Promise<string | undefined> {
    const result: { password: string } | null = await this.repo.findOne({
      where: { id: id },
      select: { id: true, password: true },
    });
    if (!result?.password) {
      return undefined;
    }
    return result.password;
  }

  async deleteAll(): Promise<void> {
    await this.repo.deleteAll();
  }
}
