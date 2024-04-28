const Validator =  require('fastest-validator');
const v= new Validator();

exports.createElectricValidator = (obj) => {
    const createSchema = {
        total_tools: { type: "number"},
        watt_number: { type: "number"},
        working_time: { type: "number"},

    };

    const check = v.compile(createSchema);
    
    return check(obj)

};
