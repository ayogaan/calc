const Validator =  require('fastest-validator');
const v= new Validator();

exports.createHumanValidator = (obj) => {
    const createSchema = {
        male_resource: { type: "number"},
        female_resource: { type: "number" },
        process_name: { type: "string", min: 3, max: 255 },
        working_time: { type: "number" },
    };

    const check = v.compile(createSchema);
    
    return check(obj)

};
