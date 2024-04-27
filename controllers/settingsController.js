const {HumanProcess, ElectricProcess, WoodProcess} = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailer = require('../helper/mailer')

exports.updateSetting = async (req, res) => {
    try{
        var userData = await User.findOne({where: {id: req.params.id}})
        return res.status(200).json({ success: true, message: 'get user', data: userData });
    }catch(err){
        return res.status(500).json({ success: false, message: 'Failed to fetch users', data: err });
    }  
}

exports.showSetting = async (req, res) =>{

}

exports.editSetting = async (req, res) =>{
    
}