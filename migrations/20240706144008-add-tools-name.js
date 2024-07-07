'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('electricprocesses', 'tools_name', {
      type: Sequelize.DataTypes.STRING, // Change the data type as per your requirement
      allowNull: true, // Set to false if you want this field to be NOT NULL
      defaultValue: null, // Optional: set a default value if needed
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('electricprocesses', 'tools_name');
  }
};
