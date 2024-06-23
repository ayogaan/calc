const {User} = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailer = require('../helper/mailer')

exports.getMe = async (req,res)=>{
  res.send(req.user);
}

exports.getUserById = async (req, res) => {
  
  try{
    var userData = await User.findOne({where: {id: req.params.id}})
    return res.status(200).json({ success: true, message: 'get user', data: userData });
    
  }catch(err){
    return res.status(500).json({ success: false, message: 'Failed to fetch users', data: err });

  }  
}

exports.getUsers = async(req,res)=>{
  try {
    User.findAll({ where: {} })
      .then((users) => {
        console.log(users); // This will show the array of users or an empty array if no users match the condition
        return res.status(200).json({ success: true, message: 'Users list', data: users });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Failed to fetch users', data: err });
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users', data: err });
  }
}

exports.updateUser = async (req, res)=> {
  const { email, name, roleId } = req.body;
  console.log({ email, name, roleId });
  try{
    const updateUser = {
      name:name, email: email, role_id:roleId
    }

    const updatedUser = await User.update(updateUser, {where:{id: req.params.id}})
    return res.status(200).json({ success: true, message: 'Users list', data: updatedUser });
  }catch(err){
    return res.status(500).json({ success: false, message: 'Failed to fetch users', data: err });
  }
}

exports.register = async (req, res) => {
    try {
        console.log(req.body.name)
        var { username, password, email } = req.body;
        
        const hashedPassword = await hashPassword(password)
        const newuser = await User.create({
                    username,
                    email,
                    password: hashedPassword,
                  });
        
        const token = jwt.sign({ id: newuser.id, name: newuser.username }, 'yourSecretKey', {
          expiresIn: '1h', 
        });
        mailer.sendVerificationEmail(newuser, token)
        return res.status(201).json({success: true,  message: 'User registered successfully', data: newuser});
      } catch (error) {
        return res.status(500).json({success:true, message: 'Error registering user', error: error.message });
      }
}

exports.login = async (req,res) =>{
    try {
        var { email, password } = req.body;
        console.log('email',email);
        const userLoggedin = await User.findOne({ where: { email } });

        if (!userLoggedin) {
          return res.status(401).json({ message: 'Authentication failed, user is not registered' });
        }
    
        const isPasswordValid = await bcrypt.compare(password, userLoggedin.password);
    
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Authentication failed, wrong passwordo ' });
        }
    
        const token = jwt.sign({ id: userLoggedin.id, name: userLoggedin.name }, 'yourSecretKey', {
          expiresIn: '1h', 
        });
    
        return res.status(200).json({ message: 'Authentication successful', token: token });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error authenticating user', error: error.message });
      }
}

exports.verify = async(req,res) =>{
  //validate token
  const token = req.query.token;
  console.log(req.query)
  const secretKey = 'yourSecretKey';

  try {
    const decoded = jwt.verify(token, secretKey);
    console.log(decoded)
    const userId = decoded.id;
    const userLoggedin = await User.update( {is_validate : true},{ where: { id: userId } });
    console.log(userLoggedin);
    if(!userLoggedin){
      res.send('Email verified failed.');
    }
    res.send('Email verified successfully.');

  } catch (err) {
    // Handle token verification failure
    res.send(err);
  }
}

exports.forgotPasswordSend = async(req,res)=>{

  var {email} = req.body;
  try{
    
    const data = await User.findOne({ where: { email } });
    if (!data) {
      return res.status(404).json({ message: 'User not found' });
    }
    const token = jwt.sign({ id: data.id, name: data.name }, 'yourSecretKey', {
      expiresIn: '1h', 
    });
    mailer.sendForgotPasswordEmail(data, token)
    return res.status(200).json({ success:true, message: 'reset password email sent' });

  } catch(err){
    return res.status(500).json({ success:false, message: 'internal server error', err:err });

  }
  
}

exports.changePassword = async (req,res)=>{
  try{
  var {token} = req.query;
  var {newPassword} = req.body;
  console.log(newPassword);
  //validate jwt
  var decoded = jwt.verify(token, 'yourSecretKey');
  const userId = decoded.id
  const hashedPassword = await hashPassword(newPassword)
  console.log(hashedPassword)
  var userdata = await User.update({password : hashedPassword}, {where: {id: userId}})
  if(!userdata){
    res.send({success:false, message:"user not found"})
  }
  res.send({success:true, message:"password updated"})

  //update password
  }catch(err){
    res.send({success:false, message:"something went wrong", error: err.message})
  }
  
}

const hashPassword = async (password, saltRounds = 10) => {
    try {
      // Generate a salt
      const salt = await bcrypt.genSalt(saltRounds)
  
      // Hash password
      return await bcrypt.hash(password, salt)
    } catch (error) {
      console.log(error)
    }
  
    // Return null if error
    return null
  }
