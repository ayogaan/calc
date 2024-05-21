'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Results', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      production_capacity: {
        type: Sequelize.INTEGER
      },
      human_process_settings: {
        type: Sequelize.JSON
      },
      wood_process_settings: {
        type: Sequelize.JSON
      },
      electric_process_settings: {
        type: Sequelize.JSON
      },
      wood_emissions: {
        type: Sequelize.JSON
      },
      electric_emissions: {
        type: Sequelize.JSON
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Results');
  }
};