'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ElectricProcess extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ElectricProcess.init({
    total_tools: DataTypes.INTEGER,
    watt_number: DataTypes.INTEGER,
    working_time: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ElectricProcess',
  });
  return ElectricProcess;
};