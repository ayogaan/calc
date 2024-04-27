'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HumanProcess extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  HumanProcess.init({
    process_name: DataTypes.STRING,
    male_resource: DataTypes.INTEGER,
    female_resource: DataTypes.INTEGER,
    working_time: DataTypes.FLOAT,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'HumanProcess',
  });
  return HumanProcess;
};