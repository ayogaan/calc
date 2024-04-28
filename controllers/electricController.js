const {ElectricProcess} = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailer = require('../helper/mailer');
const electricprocess = require('../models/electricprocess');
const { createElectricValidator } = require('../requests/electricValidator');

exports.store = async (req, res) =>{
    try{
        // total_tools: DataTypes.INTEGER,
        // watt_number: DataTypes.INTEGER,
        // working_time: DataTypes.INTEGER,
        // is_active: DataTypes.BOOLEAN,
        // user_id: DataTypes.INTEGER
        const user_id = req.user.id
        const {total_tools, watt_number, working_time, is_active} = req.body;
        const v = createElectricValidator({total_tools, watt_number, working_time, is_active})
        if( v !== true){
            return res.status(422).json({ success: true, message: 'failed input electric process', error: v });
        };
        console.log({total_tools, watt_number, working_time, is_active, user_id});
        const newElectricProcess = await ElectricProcess.create(
            {total_tools, watt_number, working_time, is_active, user_id}
        );
        return res.status(200).json({ success: true, message: 'create electric process settings', data: newElectricProcess });

    }catch(err){
        return res.status(500).json({ success: false, message: 'Failed to fetch users', data: err });

    }
}

exports.update = async (req, res) =>{
    try {
        const id = req.params.id;
        const {total_tools, watt_number, working_time, is_active} = req.body;
        const electricProcess = await ElectricProcess.findByPk(id);

        if (!electricProcess) {
        return res.status(404).json({ success: false, message: 'Electric Process not found' });
        }

        const v = createElectricValidator({total_tools, watt_number, working_time, is_active})
        if( v !== true){
            return res.status(422).json({ success: true, message: 'failed input electric process', error: v });
        };

        await electricProcess.update(
            {total_tools, watt_number, working_time, is_active}
        );

        return res.status(200).json({ success: true, message: 'Human Process updated successfully', data: electricProcess });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating Human Process', error: error.message });
    }
}

exports.show = async (req, res) =>{
    try {
        const id = req.params.id;
        const electricProcess = await ElectricProcess.findByPk(id);

        if (!electricProcess) {
        return res.status(404).json({ success: false, message: 'Post not found' });
        }
        return res.status(200).json({ success: true, message: 'Electric Process updated successfully', data: electricProcess });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating Electric Process', error: error.message });
    }
}

exports.index = async (req, res)=> {
    try {
        const { page = 1, pageSize = 5 } = req.query;
        const offset = (page - 1) * pageSize;

        const electricProcess = await ElectricProcess.findAndCountAll({
        limit: +pageSize,
        offset
        
        });

        return res.status(200).json({
        success: true,
        message: 'Posts retrieved successfully',
        data: electricProcess.rows,
        totalItems: electricProcess.count,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error retrieving posts', error: error.message });
    }   
}

exports.destroy = async (req, res)=> {
    try{
        const id  = req.params.id;
        const electricProcess = await ElectricProcess.findByPk(id)
        if(!electricProcess){
        return res.status(404).json({ success: false, message: 'electric process not found'});
        }
        await electricProcess.destroy();
        return res.status(200).json({
            success: true,
            message: 'delete electric process',
            });
    }catch(error){
        return res.status(500).json({ success: false, message: 'Error retrieving electric process', error: error.message });

    }
}

exports.setAsActive = async (req, res) => {

    try{
        const electricProcess = await ElectricProcess.findByPk(req.params.id)
        if(!electricProcess){
            return res.status(404).json({success: false, message: "electric process configuration not found"})
        }
        await ElectricProcess.update({ is_active: false }, { where: {} });

        console.log(!electricProcess.is_active);

        await electricProcess.update({is_active: true})
        return res.status(200).json({ success: true, message: 'Human Process updated successfully', data: electricProcess });
    }catch(error){
        return res.status(500).json({ success: false, message: 'Error updating electric process', error: error.message });
    }
}

exports.getActive = async (req, res) => {
    try{
        const electricProcess= await ElectricProcess.findOne({where: {user_id: req.user.id, is_active: true}})
        if(!electricProcess){
            return res.status(404).json({success: false, message: "active electric process not found"});
        }
        return res.status(200).json({
            success: true,
            message: "get active electric process",
            data: electricProcess
        });
    }catch(error){
        return res.status(500).json({success:false, message: "error retriving electric process"});
    }
}