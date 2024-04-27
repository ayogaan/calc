const Validator =  require('fastest-validator');
const v= new Validator();

exports.createWoodValidator = (obj) => {
    const createSchema = {
        total_woods: { type: "number", positive: true },
    };

    const check = v.compile(createSchema);
    
    return check(obj)

};
