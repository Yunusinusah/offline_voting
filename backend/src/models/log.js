module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Log', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER },
    voter_id: { type: DataTypes.INTEGER },
    action: { type: DataTypes.ENUM('cast_vote','login','generate_token','update','delete','create') },
    ip_address: { type: DataTypes.STRING(64) },
    details: { type: DataTypes.TEXT }
  }, { tableName: 'logs', timestamps: true, createdAt: 'created_at', updatedAt: false });
};
