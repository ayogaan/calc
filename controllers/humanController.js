const {HumanProcess} = require('../models');
const {createHumanValidator}= require('../requests/humanValidator')


exports.store = async (req, res) =>{
    try{
        const user_id  = req.user.id;
        console.log(req.body)
        const {process_name, male_resource, female_resource, working_time} = req.body;
        console.log(req.body)
        const v = createHumanValidator({process_name, male_resource, female_resource, working_time})
        if( v !== true){
            console.log(v);
            return res.status(422).json({ success: true, message: 'create human process settings', error: v });
        };

        const newHumanProcess = await HumanProcess.create(
            {process_name, male_resource, female_resource, working_time, user_id : user_id}
        );
        return res.status(200).json({ success: true, message: 'create human process settings', data: newHumanProcess });

    }catch(err){
        console.log(err)
        return res.status(500).json({ success: false, message: 'Failed to fetch users', data: err });

    }
}

exports.update = async (req, res) =>{
    try {
        const id = req.params.id;
        const {process_name, male_resource, female_resource, working_time} = req.body;
        
        const humanProcess = await HumanProcess.findByPk(id);
        const v = createHumanValidator({process_name, male_resource, female_resource, working_time})
        if( v !== true){
            return res.status(422).json({ success: true, message: 'create human process settings', error: v });
        };
        if (!humanProcess) {
        return res.status(404).json({ success: false, message: 'Post not found' });
        }

        await humanProcess.update(
            {process_name, male_resource, female_resource, working_time}
        );

        return res.status(200).json({ success: true, message: 'Human Process updated successfully', data: humanProcess });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating Human Process', error: error.message });
    }
}

exports.show = async (req, res) =>{
    try {
        const id = req.params.id;
        const humanProcess = await HumanProcess.findByPk(id);

        if (!humanProcess) {
        return res.status(404).json({ success: false, message: 'Post not found' });
        }
        return res.status(200).json({ success: true, message: 'Human Process updated successfully', data: humanProcess });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating Human Process', error: error.message });
    }
}

exports.index = async (req, res)=> {
    try {
        const { page = 1, pageSize = 5 } = req.query;
        const offset = (page - 1) * pageSize;

        const posts = await HumanProcess.findAndCountAll({
        where: {user_id: req.user.id},
        limit: +pageSize,
        offset,
        });

        return res.status(200).json({
        success: true,
        message: 'Posts retrieved successfully',
        data: posts.rows,
        
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error retrieving posts', error: error.message });
    }   
}

exports.destroy = async (req, res)=> {
    try{
        const id  = req.params.id;
        const humanProcess = await HumanProcess.findByPk(id)
        if(!humanProcess){
        return res.status(404).json({ success: false, message: 'human process not found'});
        }
        await humanProcess.destroy();
        return res.status(200).json({
            success: true,
            message: 'delete human process',
            });
    }catch(error){
        return res.status(500).json({ success: false, message: 'Error retrieving posts', error: error.message });

    }
}