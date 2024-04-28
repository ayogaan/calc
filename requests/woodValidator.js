const Validator =  require('fastest-validator');
const v= new Validator();

exports.createWoodValidator = (obj) => {
    const createSchema = {
        total_woods: { type: "number"},
    };

    const check = v.compile(createSchema);
    
    return check(obj)

};
