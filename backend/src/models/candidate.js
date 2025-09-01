module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Candidate', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    portfolio_id: { type: DataTypes.INTEGER.UNSIGNED },
    full_name: { type: DataTypes.STRING(255), allowNull: false },
    profile_picture: { type: DataTypes.STRING(512) },
    ballot_num: { type: DataTypes.INTEGER },
    election_id: { type: DataTypes.INTEGER.UNSIGNED }
  }, { tableName: 'candidates', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });
};
