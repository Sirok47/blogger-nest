import { Query } from 'mongoose';

export class Paginator {
  constructor(
    public searchLoginTerm: string = '',
    public searchEmailTerm: string = '',
    public searchNameTerm: string = '',
    public sortBy: string = 'createdAt',
    public sortDirection: SortDirections = SortDirections.desc,
    public pageNumber: number = 1,
    public pageSize: number = 10,
  ) {}

  Paginate<ViewModelType>(
    totalCount: number,
    mappedData: ViewModelType[],
  ): Paginated<ViewModelType> {
    return {
      pagesCount: Math.ceil(totalCount / this.pageSize),
      page: this.pageNumber,
      pageSize: this.pageSize,
      totalCount: totalCount,
      items: mappedData,
    };
  }

  //TODO: Better name
  LimitQuery<DocT>(query: Query<DocT[], DocT>): Query<DocT[], DocT> {
    return query
      .sort({ [this.sortBy]: this.sortDirection })
      .skip((this.pageNumber - 1) * this.pageSize)
      .limit(this.pageSize);
  }
}

export type Paginated<ViewModelType> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ViewModelType[] | null;
};

export enum SortDirections {
  asc = 'asc',
  desc = 'desc',
}
