const Validator = require("fastest-validator");
const v =  new Validator();

exports.validate = (obj, schema) =>{
    const check = v.compile(schema);
    return check(obj)
}