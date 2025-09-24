import { Injectable } from '@nestjs/common';
import { User, UserDocument, UserViewModel } from '../../users.models';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IUsersQueryRepo } from '../../Service/users.service';

@Injectable()
export class UsersQueryRepoPSQL implements IUsersQueryRepo {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  async findWithSearchAndPagination(
    paginationSettings: Paginator,
  ): Promise<Paginated<UserViewModel>> {
    const {
      searchLoginTerm,
      searchEmailTerm,
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
    } = paginationSettings;

    const users = await this.dataSource.query<User[]>(
      `
    SELECT * FROM "Users"
        WHERE login LIKE $1
          AND email LIKE $2
        ORDER BY $3 ${sortDirection}
        LIMIT $4
        OFFSET $5
    `,
      [
        `%${searchLoginTerm}%`,
        `%${searchEmailTerm}%`,
        sortBy,
        pageSize,
        (pageNumber - 1) * pageSize,
      ],
    );
    const totalCount = (
      await this.dataSource.query<{ count: number }[]>(
        `
        SELECT COUNT(*) FROM "Users"
        WHERE login LIKE $1
          AND email LIKE $2`,
        [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`],
      )
    )[0].count;
    return paginationSettings.Paginate<UserViewModel>(
      totalCount,
      users.map((user: any): UserViewModel => User.mapSQLToViewModel(user)),
    );
  }

  async findOneById(id: string): Promise<UserDocument | null> {
    const result: any[] = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE id=$1`,
      [id],
    );
    if (result.length !== 1) {
      return null;
    }
    return result[0];
  }
}
