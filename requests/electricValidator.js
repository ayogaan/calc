const Validator =  require('fastest-validator');
const v= new Validator();

exports.createElectricValidator = (obj) => {
    const createSchema = {
        total_tools: { type: "number", positive: true, integer: true },
        watt_number: { type: "number", positive: true },
        working_time: { type: "number", positive: true },

    };

    const check = v.compile(createSchema);
    
    return check(obj)

};
