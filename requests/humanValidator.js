const Validator =  require('fastest-validator');
const v= new Validator();

exports.createHumanValidator = (obj) => {
    const createSchema = {
        male_resource: { type: "number", positive: true, integer: true },
        female_resource: { type: "number", positive: true, integer: true },
        process_name: { type: "string", min: 3, max: 255 },
        working_time: { type: "number", positive: true },
    };

    const check = v.compile(createSchema);
    
    return check(obj)

};
