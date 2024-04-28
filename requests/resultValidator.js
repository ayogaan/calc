const Validator =  require('fastest-validator');
const v= new Validator();

exports.createResultValidator = (obj) => {
    const createSchema = {
        production_capacity: { type: "number"},
    };

    const check = v.compile(createSchema);
    
    return check(obj)

};
