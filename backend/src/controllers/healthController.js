exports.health = async (req, res) => {
  res.json({ ok: true, time: new Date() });
};
