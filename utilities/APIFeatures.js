
class APIFeatures {

constructor(query,queryObj){
    this.query = query;
    this.queryObj = queryObj;
}    
filter(){
    let newQueryObj = { ...this.queryObj };
    const excludedfields = ["sort", "fields", "limit", "page"];
    excludedfields.forEach((el) => delete newQueryObj[el]);
    console.log(newQueryObj);
    newQueryObj = JSON.stringify(newQueryObj).replace(/lt|lte|gt|gte/g, function (value) {
            return `$${value}`;
          });
      newQueryObj = JSON.parse(newQueryObj);
      this.query = this.query.find(newQueryObj);
      return this;
    }
limit(){
    if (this.queryObj.fields) {
        const fields = this.queryObj.fields.split(",").join(" ");
        this.query = this.query.select(fields);
      }
      this.query = this.query.select("-__v");
      return this;
}
sort(){
    if (this.queryObj.sort) {
        const sortFields = this.queryObj.sort.split(",").join(" ");
        this.query = this.query.sort(sortFields);
      } else {
        //   query = query.sort('-createdAt');
      }
      return this;
 }

paginate(){
    const page = this.queryObj.page || 1;
    const limit = this.queryObj.limit || 10;
    const skippedDocuments = (page - 1) * limit;
    this.query = this.query.skip(skippedDocuments).limit(limit);
    return this.query;
}

}

module.exports = APIFeatures;