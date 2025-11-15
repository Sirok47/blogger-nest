import { Injectable } from '@nestjs/common';
import { MeViewModel, UserPSQL, UserViewModel } from '../../users.models';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { IUsersQueryRepo } from '../../Service/users.service';

@Injectable()
export class UsersQueryRepoRawPSQL implements IUsersQueryRepo {
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

    const users = await this.dataSource.query<UserPSQL[]>(
      `
    SELECT * FROM "Users"
        WHERE login ILIKE $1
          OR email ILIKE $2
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $3
        OFFSET $4
    `,
      [
        `%${searchLoginTerm}%`,
        `%${searchEmailTerm}%`,
        pageSize,
        (pageNumber - 1) * pageSize,
      ],
    );
    const totalCount = (
      await this.dataSource.query<{ count: string }[]>(
        `
        SELECT COUNT(*) FROM "Users"
        WHERE login ILIKE $1
           OR email ILIKE $2`,
        [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`],
      )
    )[0].count;
    return paginationSettings.Paginate<UserViewModel>(
      +totalCount,
      users.map((user): UserViewModel => UserPSQL.mapSQLToViewModel(user)),
    );
  }

  async findOneById(id: string): Promise<UserViewModel | null> {
    const result: UserPSQL[] = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE id=$1`,
      [id],
    );
    if (result.length !== 1) {
      return null;
    }
    return UserPSQL.mapSQLToViewModel(result[0]);
  }

  async meView(id: string): Promise<MeViewModel | null> {
    const result: UserPSQL[] = await this.dataSource.query(
      `SELECT * FROM "Users" WHERE id=$1`,
      [id],
    );
    if (result.length !== 1) {
      return null;
    }
    return UserPSQL.mapSQLToMeViewModel(result[0]);
  }
}
