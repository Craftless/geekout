import { Model } from "mongoose";

type QueryObj = {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
};

export default class APIFeatures {
  model: typeof Model;
  query: ReturnType<typeof Model.find> | undefined;
  queryString;
  constructor(model: typeof Model, queryString: QueryObj) {
    this.model = model;
    this.queryString = queryString;
    this.query;
  }
  filter() {
    const reqObj = { ...this.queryString };
    ["page", "sort", "limit", "fields"].forEach(
      (element: string) => delete reqObj[element]
    );
    const reqObjString = JSON.stringify(reqObj).replace(
      /\b(lt|lte|gt|gte)\b/g,
      (match) => `$${match}`
    );
    // instantiate query (Model).
    this.query = this.model.find(JSON.parse(reqObjString));

    return this;
  }

  sort() {
    if (this.query !== undefined) {
      if (typeof this.queryString?.sort === "string") {
        this.query = this.query.sort(
          this.queryString.sort.split(",").join(" ")
        );
      } else {
        this.query = this.query.sort("-createdAt"); // newest first.
      }
    }
    return this;
  }

  fields() {
    if (this.query !== undefined) {
      if (typeof this.queryString?.fields === "string") {
        const field = this.queryString.fields.split(",").join(" ");
        console.log(field);
        this.query = this.query.select(field);
      } else {
        this.query = this.query.select("-__v");
      }
    }
    return this;
  }

  pageLimit() {
    if (this.query !== undefined) {
      if (
        typeof this.queryString?.page === "string" ||
        typeof this.queryString?.limit === "string"
      ) {
        const page = +(this.queryString?.page || 1);
        const limit = +(this.queryString?.limit || 100);
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
      }
    }
    return this;
  }
}
