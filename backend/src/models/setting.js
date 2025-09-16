module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Setting', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    logo_path: { type: DataTypes.STRING(512) },
    theme_color: { type: DataTypes.STRING(64) },
    footer_text: { type: DataTypes.STRING(1024) },
    support_email: { type: DataTypes.STRING(255) },
    election_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    is_default: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
