import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../users.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IUsersRepository } from '../../Service/users.service';

@Injectable()
export class UsersRepositoryPSQL implements IUsersRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async save(user: UserDocument): Promise<UserDocument> {
    return UsersRepositoryPSQL.mapSQLToUser(
      (
        await this.dataSource.query<
          (UserDocument & {
            confirmationCode: string;
            confirmationCodeExpDate: string;
            isConfirmed: boolean;
          })[]
        >(
          `INSERT INTO "Users"
            (login, password, email, "createdAt", "confirmationCode", "confirmationCodeExpDate", "id")
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *`,
          [
            user.login,
            user.password,
            user.email,
            new Date().toISOString(),
            user.confirmationData.confirmationCode,
            user.confirmationData.confirmationCodeExpDate,
            user.id,
          ],
        )
      )[0],
    );
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
    const result = await this.dataSource.query<
      (UserDocument & {
        confirmationCode: string;
        confirmationCodeExpDate: string;
        isConfirmed: boolean;
      })[]
    >(
      `SELECT * FROM "Users"
          WHERE login = $1
          OR email = $1`,
      [loginOrEmail],
    );
    if (result.length < 1) {
      return null;
    }
    return UsersRepositoryPSQL.mapSQLToUser(result[0]);
  }

  async findById(id: string): Promise<UserDocument | null> {
    const result = await this.dataSource.query<
      (UserDocument & {
        confirmationCode: string;
        confirmationCodeExpDate: string;
        isConfirmed: boolean;
      })[]
    >(
      `SELECT * FROM "Users"
          WHERE "id" = $1`,
      [id],
    );
    if (result.length < 1) {
      return null;
    }
    return UsersRepositoryPSQL.mapSQLToUser(result[0]);
  }

  async findWithCode(code: string): Promise<UserDocument | null> {
    const result = await this.dataSource.query<
      (UserDocument & {
        confirmationCode: string;
        confirmationCodeExpDate: string;
        isConfirmed: boolean;
      })[]
    >(
      `SELECT * FROM "Users"
          WHERE "confirmationCode" = $1`,
      [code],
    );
    if (result.length < 1) {
      return null;
    }
    return UsersRepositoryPSQL.mapSQLToUser(result[0]);
  }

  async changePassword(userId: string, newPass: string): Promise<boolean> {
    const result: UserDocument | null = await this.dataSource.query(
      `UPDATE "Users" SET password=$2 WHERE id=$1`,
      [userId, newPass],
    );
    return !!result![0];
  }

  async updateConfirmationCode(
    userId: string,
    code: string,
    expDate: Date,
  ): Promise<boolean> {
    const result: UserDocument | null = (
      await this.dataSource.query<UserDocument[]>(
        `UPDATE public."Users"
            SET "confirmationCode"=$2, "confirmationCodeExpDate"=$3
            WHERE id=$1;`,
        [userId, code, expDate],
      )
    )[0];
    return !!result;
  }

  async setToConfirmed(code: string): Promise<boolean> {
    const result: UserDocument | null = (
      await this.dataSource.query<UserDocument[]>(
        `UPDATE public."Users"
            SET "isConfirmed"=TRUE
            WHERE "confirmationCode"=$1;`,
        [code],
      )
    )[0];
    return !!result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM "Users" WHERE id=$1`,
      [id],
    );
    return !!result[1];
  }

  async retrievePassword(id: string): Promise<string | undefined> {
    const result: User[] = await this.dataSource.query<User[]>(
      `SELECT password FROM "Users" WHERE id=$1`,
      [id],
    );
    if (result.length !== 1) {
      return undefined;
    }
    return result[0].password;
  }

  async deleteAll(): Promise<void> {
    await this.dataSource.query(`DELETE FROM "Users"`);
  }

  private static mapSQLToUser(
    user: UserDocument & {
      confirmationCode: string;
      confirmationCodeExpDate: string;
      isConfirmed: boolean;
    },
  ): any {
    return {
      id: user.id,
      login: user.login,
      password: user.password,
      email: user.email,
      createdAt: user.createdAt,
      confirmationData: {
        confirmationCode: user.confirmationCode,
        confirmationCodeExpDate: user.confirmationCodeExpDate,
        isConfirmed: user.isConfirmed,
      },
    };
  }
}
