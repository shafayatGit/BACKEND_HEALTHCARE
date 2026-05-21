//T=>Model type
import {
  IQueryConfig,
  IQueryParams,
  PrismaCountArgs,
  PrismaFindManyArgs,
  PrismaModelDelegate,
  PrismaStringFilter,
  PrismaWhereCondition,
  PrismaNumberFilter,
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

  filter(): this {
    const { filterableFields } = this.config;

    const excludedFields = [
      "searchTerm",
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "fields",
      "includes",
    ];

    const filterParams: Record<string, unknown> = {};

    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedFields.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });

    const queryWhere = this.query.where as Record<string, unknown>;
    const countQueryWhere = this.countQuery.where as Record<string, unknown>;

    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];
      if (value == undefined || value == "" || value == null) {
        return;
      }
      const isAllowedField =
        !filterableFields ||
        filterableFields.length === 0 ||
        filterableFields.includes(key);
      if (!isAllowedField) {
        return;
      }

      if (key.includes(".")) {
        const parts = key.split(".");

        if (filterableFields && !filterableFields.includes(parts[0])) {
          return;
        }

        if (parts.length === 2) {
          const [relation, nestedField] = parts;
          queryWhere[relation] = {
            [nestedField]: this.parseFilterValue(value),
          };

          if (!countQueryWhere[relation]) {
            countQueryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }

          countQueryWhere[relation] = {
            [nestedField]: this.parseFilterValue(value),
          };
          return;
        } else if (parts.length === 3) {
          const [relation, nestedRelation, nestedField] = parts;
          queryWhere[relation] = {
            [nestedRelation]: {
              [nestedField]: this.parseFilterValue(value),
            },
          };
          countQueryWhere[relation] = {
            [nestedRelation]: {
              [nestedField]: this.parseFilterValue(value),
            },
          };
          return;
        }
      } else {
        queryWhere[key] = this.parseFilterValue(value);
        countQueryWhere[key] = this.parseFilterValue(value);
        return;
      }

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        queryWhere[key] = this.parseFilterValue(value);
        countQueryWhere[key] = this.parseFilterValue(value);
        return;
      }
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });

    return this;
  }

  paginate(): this {
    const page = Number(this.queryParams.page || 1);
    const limit = Number(this.queryParams.limit || 2);

    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;

    this.query.skip = this.skip;
    this.query.take = limit;
    return this;
  }

  sort(): this {
    const sortBy = this.queryParams.sortBy || "createdAt";
    const sortOrder = this.queryParams.sortOrder === "asc" ? "asc" : "desc";

    this.sortBy = sortBy;
    this.sortOrder = sortOrder;

    const parts = sortBy.split(".");
    if (parts.length === 2) {
      const [relation, nestedField] = parts;
      this.query.orderBy = {
        [relation]: {
          [nestedField]: sortOrder,
        },
      };
    } else if (parts.length === 3) {
      const [relation, nestedRelation, nestedField] = parts;
      this.query.orderBy = {
        [relation]: {
          [nestedRelation]: {
            [nestedField]: sortOrder,
          },
        },
      };
    } else {
      this.query.orderBy = {
        [sortBy]: sortOrder,
      };
    }

    return this;
  }

  fields(): this {
    const fieldsParam = this.queryParams.fields;
    // /doctors?fields=id,name,user => select: { id: true, name: true, user: { select: { name: true } } }

    //no nested field selection for now, only direct fields
    if (fieldsParam && typeof fieldsParam === "string") {
      const fieldsArray = fieldsParam?.split(",").map((field) => field.trim());
      this.selectFields = {};

      fieldsArray?.forEach((field) => {
        if (this.selectFields) {
          this.selectFields[field] = true;
        }
      });

      this.query.select = this.selectFields as Record<
        string,
        boolean | Record<string, unknown>
      >;

      delete this.query.include;
    }
    return this;
  }

  private parseFilterValue(value: unknown): unknown {
    if (value === "true") return true;
    if (value === "false") return false;
    if (typeof value === "string" && !isNaN(Number(value)) && value !== "") {
      return Number(value);
    }
    if (Array.isArray(value)) {
      return { in: value.map((item) => this.parseFilterValue(item)) };
    }
    return value;
  }

  private parseRangeFilter(
    value: Record<string, string | number>,
  ): PrismaNumberFilter | PrismaStringFilter | Record<string, unknown> {
    const rangeQuery: Record<string, string | number | (string | number)[]> =
      {};

    Object.keys(value).forEach((operator) => {
      const operatorValue = value[operator];

      const parsedValue: string | number =
        typeof operatorValue === "string" && !isNaN(Number(operatorValue))
          ? Number(operatorValue)
          : operatorValue;

      switch (operator) {
        case "lt":
        case "lte":
        case "gt":
        case "gte":
        case "equals":
        case "not":
        case "contains":
        case "startsWith":
        case "endsWith":
          rangeQuery[operator] = parsedValue;
          break;

        case "in":
        case "notIn":
          if (Array.isArray(operatorValue)) {
            rangeQuery[operator] = operatorValue;
          } else {
            rangeQuery[operator] = [parsedValue];
          }
          break;
        default:
          break;
      }
    });

    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
}
