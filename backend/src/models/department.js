module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Department', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    logo_path: { type: DataTypes.STRING(512) },
    theme_color: { type: DataTypes.STRING(32) }
  }, { tableName: 'departments', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
};
