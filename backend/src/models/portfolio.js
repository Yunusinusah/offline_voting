module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Portfolio', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    priority: { type: DataTypes.INTEGER, defaultValue: 0 },
    level: { type: DataTypes.STRING(50) },
    election_id: { type: DataTypes.INTEGER.UNSIGNED }
  }, { tableName: 'portfolios', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
};
