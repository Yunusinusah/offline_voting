module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Portfolio",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: { type: DataTypes.STRING(255), allowNull: false },
      priority: { type: DataTypes.INTEGER, defaultValue: 0 },
      level: { type: DataTypes.STRING(50) },
      election_id: { type: DataTypes.INTEGER.UNSIGNED },
      restriction_type: {
        type: DataTypes.ENUM(
          "NONE",
          "GENDER_MALE_ONLY",
          "GENDER_FEMALE_ONLY",
          "LEVEL_1",
          "LEVEL_2",
          "LEVEL_3",
          "LEVEL_4",
          "LEVEL_5",
          "LEVEL_6"
        ),
        allowNull: false,
        defaultValue: "NONE",
      },
    },
    {
      tableName: "portfolios",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
};
