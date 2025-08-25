import { Query } from 'mongoose';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum SortDirections {
  asc = 'asc',
  desc = 'desc',
}

export class Paginator {
  @IsOptional()
  @IsString()
  public searchLoginTerm = '';

  @IsOptional()
  @IsString()
  public searchEmailTerm = '';

  @IsOptional()
  @IsString()
  public searchNameTerm = '';

  @IsOptional()
  @IsString()
  public sortBy = 'createdAt';

  @IsOptional()
  @IsEnum(SortDirections)
  public sortDirection: SortDirections = SortDirections.desc;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public pageNumber = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  public pageSize = 10;

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
