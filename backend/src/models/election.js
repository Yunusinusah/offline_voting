module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Election', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    start_time: { type: DataTypes.DATE },
    end_time: { type: DataTypes.DATE },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: false },
    max_votes_per_voter: { type: DataTypes.INTEGER, defaultValue: 1 },
    allow_under_voting: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'elections', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
};
