module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Vote",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      candidate_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      skip_vote: { type: DataTypes.BOOLEAN, defaultValue: false },
      portfolio_id: { type: DataTypes.INTEGER.UNSIGNED },
      vote_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      election_id: { type: DataTypes.INTEGER.UNSIGNED },
      decision: {
        type: DataTypes.ENUM("YES", "NO"),
        allowNull: true,
      },
    },
    { tableName: "votes", timestamps: false }
  );
};
