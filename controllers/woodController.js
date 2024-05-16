const {WoodProcess} = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailer = require('../helper/mailer');
const woodprocess = require('../models/woodprocess');
const { createWoodValidator } = require('../requests/woodValidator');

exports.store = async (req, res) =>{
    try{
        // total_woods: DataTypes.INTEGER,
        // is_active: DataTypes.BOOLEAN,
        // user_id: DataTypes.INTEGER
        const user_id = req.user.id
        const {total_woods, is_active} = req.body;
        const v = createWoodValidator({total_woods})
        if( v !== true){
            return res.status(422).json({ success: true, message: 'failed input electric process', error: v });
        };
        const newWoodProcess = await WoodProcess.create(
            {total_woods, is_active, user_id}
        );
        return res.status(200).json({ success: true, message: 'create wood process settings', data: newWoodProcess });

    }catch(err){
        return res.status(500).json({ success: false, message: 'Failed to fetch wood process', data: err });

    }
}

exports.update = async (req, res) =>{
    try {
        const id = req.params.id;
        const {total_woods, is_active} = req.body;

        const woodProcess = await WoodProcess.findByPk(id);

        if (!woodProcess) {
        return res.status(404).json({ success: false, message: 'Wood Process not found' });
        }

        await woodProcess.update(
            {total_woods, is_active, user_id}
        );

        return res.status(200).json({ success: true, message: 'Wood Process updated successfully', data: woodProcess });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating Wood Process', error: error.message });
    }
}

exports.show = async (req, res) =>{
    try {
        const id = req.params.id;
        const woodProcess = await WoodProcess.findByPk(id);

        if (!woodProcess) {
        return res.status(404).json({ success: false, message: 'Wood Process not found' });
        }
        return res.status(200).json({ success: true, message: 'Wood Process updated successfully', data: woodProcess });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error updating Wood Process', error: error.message });
    }
}

exports.index = async (req, res)=> {
    try {
        const { page = 1, pageSize = 5 } = req.query;
        const offset = (page - 1) * pageSize;

        const woodProcess = await WoodProcess.findAndCountAll({
        where: {user_id: req.user.id},
        limit: +pageSize,
        offset,
        where: {user_id: req.user.id}
        });

        return res.status(200).json({
        success: true,
        message: 'Posts retrieved successfully',
        data: woodProcess.rows,
        totalItems: woodProcess.count,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error retrieving wood process', error: error.message });
    }   
}

exports.destroy = async (req, res)=> {
    try{
        const id  = req.params.id;
        const woodProcess = await WoodProcess.findByPk(id)
        if(!woodProcess){
        return res.status(404).json({ success: false, message: 'wood process not found'});
        }
        await woodProcess.destroy();
        return res.status(200).json({
            success: true,
            message: 'delete wood process',
            });
    }catch(error){
        return res.status(500).json({ success: false, message: 'Error retrieving wood process', error: error.message });

    }
}

exports.set = async (req, res)=> {
    try {
        // Set isActive to false for all WoodProcess instances
        await WoodProcess.update({ is_active: false }, { where: {} });
    
        // Find the specific WoodProcess instance by primary key
        const woodProcess = await WoodProcess.findByPk(req.params.id);
    
        // Check if the woodProcess exists
        if (!woodProcess) {
            return res.status(404).json({ success: false, message: "Wood process not found" });
        }
    
        // Update the isActive property of the woodProcess instance
        await woodProcess.update({ is_active: true });
    
        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Wood process updated',
            data: woodProcess
        });
    } catch (error) {
        // Return error response if any error occurs
        return res.status(500).json({ success: false, message: "Error updating wood process", error: error.message });
    }
    
}

exports.getActive = async (req, res) => {
    try{
        const woodProcess = await WoodProcess.findOne({where: {user_id: req.user.id, is_active: true}});
        if(!woodProcess){
            return res.status(404).json({
                success : true,
                message: 'active wood not found'
            });
        }
        return res.status(200).json({
            success: true,
            message : "get active wood process",
            data: woodProcess
        });

    }catch(error){
        return res.status(500).json({success: false, message: "error getting wood process", error: error.message})
    }
}