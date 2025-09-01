const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  const Voter = sequelize.define('Voter', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    student_id: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: true },
    level: { type: DataTypes.STRING(50) },
    gender: { type: DataTypes.ENUM('male','female','other') },
    election_id: { type: DataTypes.INTEGER.UNSIGNED }
  }, {
    tableName: 'voters',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (voter) => {
        if (voter.password) voter.password = await bcrypt.hash(voter.password, 10);
      },
      beforeUpdate: async (voter) => {
        if (voter.changed && voter.changed('password') && voter.password) voter.password = await bcrypt.hash(voter.password, 10);
      }
    }
  });

  Voter.prototype.validatePassword = async function (plain) {
    if (!this.password) return false;
    return bcrypt.compare(plain, this.password);
  };

  return Voter;
};

