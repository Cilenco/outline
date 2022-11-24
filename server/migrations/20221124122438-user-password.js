module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("users", "passwordHash", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("users", "passwordSalt", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
  down: async (queryInterface, _Sequelize) => {
    await queryInterface.removeColumn("users", "passwordHash");
    await queryInterface.removeColumn("users", "passwordSalt");
  },
};
