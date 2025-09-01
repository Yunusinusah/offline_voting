module.exports = (sequelize, DataTypes) => {
  const bcrypt = require('bcryptjs');

  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    role: { type: DataTypes.ENUM('superadmin','admin','polling_agent'), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255) },
    election_id: { type: DataTypes.INTEGER.UNSIGNED }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        // only hash when password has changed
        if (user.changed && user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  // Instance helper to validate a plain-text password against the stored hash
  User.prototype.validatePassword = async function (plain) {
    if (!this.password) return false;
    return bcrypt.compare(plain, this.password);
  };

  return User;
};
