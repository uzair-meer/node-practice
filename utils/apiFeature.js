export class ApiFeature {
  // it takes two argument query obj[coming from find method] and query string coming from url
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // query always come in strings
    // but it also converts to automaticall to desired data type inernally

    // advance filtering
    // Advanced filtering for ratings, duration, and price
    //   Convert query object to a JSON string and replace operators (gte, gt, lte, lt) with MongoDB operators ($gte, $gt, $lte, $lt).
    // Parse the modified query string back to an object and pass it to Movie.find().
    let queryString = JSON.stringify(this.queryStr);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    const queryObj = JSON.parse(queryString);
    // sorting
    // sort method in monogoose is query method
    // it only works on query obj not on results array

    // thats why we remove await from Movie find
    //so it dont reuturn result array rather it reutns query object
    this.query = this.query.find(queryObj);
    // coz we need to futher chain the other methds
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
      // ned to sort on relese year and ratings
    } else {
      // if no sorting query sorting provided in url
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    // PAGINATION
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    // if (this.queryStr.page) {
    //   const numMovies = await Movie.countDocuments();
    //   if (skip >= numMovies) throw new Error("This page does not exist");
    // }

    return this;
  }
}
