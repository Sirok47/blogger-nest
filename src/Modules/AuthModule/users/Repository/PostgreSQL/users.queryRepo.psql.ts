import { Injectable } from '@nestjs/common';
import { MeViewModel, UserPSQL, UserViewModel } from '../../users.entity';
import { Paginated, Paginator } from '../../../../../Models/paginator.models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { IUsersQueryRepo } from '../../Service/users.service';

@Injectable()
export class UsersQueryRepoPSQL implements IUsersQueryRepo {
  constructor(
    @InjectRepository(UserPSQL)
    private readonly repo: Repository<UserPSQL>,
  ) {}

  async findWithSearchAndPagination(
    paginationSettings: Paginator,
  ): Promise<Paginated<UserViewModel>> {
    const {
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      pageSize,
      pageNumber,
      sortDirection,
    } = paginationSettings;

    let baseQuery: SelectQueryBuilder<UserPSQL> =
      this.repo.createQueryBuilder('u');
    if (searchLoginTerm) {
      baseQuery = baseQuery.orWhere('u.login ILIKE :login', {
        login: `%${searchLoginTerm}%`,
      });
    }
    if (searchEmailTerm) {
      baseQuery = baseQuery.orWhere('u.email ILIKE :email', {
        email: `%${searchEmailTerm}%`,
      });
    }

    const users: Omit<UserPSQL, 'confirmationData'>[] = await baseQuery
      .orderBy(`u.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .limit(pageSize)
      .offset((pageNumber - 1) * pageSize)
      .getMany();

    const totalCount: number = await baseQuery.getCount();

    return paginationSettings.Paginate<UserViewModel>(
      +totalCount,
      users.map(
        (user: Omit<UserPSQL, 'confirmationData'>): UserViewModel =>
          user.mapToViewModel(),
      ),
    );
  }

  async findOneById(id: string): Promise<UserViewModel | null> {
    const user: UserPSQL | null = await this.repo
      .createQueryBuilder('u')
      .where('u.id = :id', { id: id })
      .getOne();

    return user ? user.mapToViewModel() : null;
  }

  async meView(id: string): Promise<MeViewModel | null> {
    const user: UserPSQL | null = await this.repo
      .createQueryBuilder('u')
      .where('u.id = :id', { id: id })
      .getOne();

    return user ? user.mapToMeViewModel() : null;
  }
}
