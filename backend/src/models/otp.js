module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Otp', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    voter_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    code: { type: DataTypes.STRING(16), allowNull: false },
    used: { type: DataTypes.BOOLEAN, defaultValue: false },
    expires_at: { type: DataTypes.DATE, allowNull: false }
  }, { tableName: 'otps', timestamps: true, createdAt: 'created_at', updatedAt: false });
};
