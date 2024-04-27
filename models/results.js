'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Results extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Results.init({
    date: DataTypes.DATE,
    production_capacity: DataTypes.INTEGER,
    human_process_settings: DataTypes.JSON,
    wood_process_settings: DataTypes.JSON,
    electric_process_settings: DataTypes.JSON,
    wood_emissions: DataTypes.JSON,
    electric_emissions: DataTypes.JSON,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Results',
  });
  return Results;
};