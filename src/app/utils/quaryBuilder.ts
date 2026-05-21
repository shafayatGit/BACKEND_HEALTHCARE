//T=>Model type

import {
  IQueryConfig,
  IQueryParams,
  PrismaCountArgs,
  PrismaFindManyArgs,
  PrismaModelDelegate,
  PrismaStringFilter,
  PrismaWhereCondition,
} from "../interfaces/query.interface";

export class quaryBuilder<
  T,
  TwhereInput = Record<string, unknown>,
  TInclude = Record<string, unknown>,
> {
  private query: PrismaFindManyArgs;
  private countQuery: PrismaCountArgs;
  private page: number = 1;
  private limit: number = 10;
  private skip: number = 0;
  private sortBy: string = "createdAt";
  private sortOrder: "asc" | "desc" = "desc";
  private selectFields: Record<string, boolean | undefined>;

  constructor(
    private model: PrismaModelDelegate,
    private queryParams: IQueryParams,
    private config: IQueryConfig,
  ) {
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10,
    };
    this.countQuery = {
      where: {},
    };
  }
  search(): this {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;
    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions: Record<string, unknown>[] = searchableFields.map(
        (field: string) => {
          const parts = field.split(".");
          if (parts.length === 2) {
            const [relation, nestedField] = parts;
            const stringFilter: PrismaStringFilter = {
              contains: searchTerm as string,
              mode: "insensitive" as const,
            };
            return {
              [relation]: {
                [nestedField]: stringFilter,
              },
            };
          } else if (parts.length === 3) {
            const [relation, nestedRelation, nestedField] = parts;
            const stringFilter: PrismaStringFilter = {
              contains: searchTerm as string,
              mode: "insensitive" as const,
            };
            return {
              [relation]: {
                [nestedRelation]: {
                  [nestedField]: stringFilter,
                },
              },
            };
          }
          const stringFilter: PrismaStringFilter = {
            contains: searchTerm as string,
            mode: "insensitive" as const,
          };
          return {
            [field]: stringFilter,
          };
        },
      );
      const whereCondition = this.query.where as PrismaWhereCondition;

      whereCondition.OR = searchConditions;

      const countWhereConditions = this.countQuery
        .where as PrismaWhereCondition;
      countWhereConditions.OR = searchConditions;
    }
    return this;
  }
}
