const path = require('path');
const db = require('../config/db');
const { orm, sequelize } = db;
const models = orm ? orm.models : null;

// Helper to build public path
function publicPathFor(file) {
  if (!file) return null;
  return `/public/uploads/${path.basename(file)}`;
}

exports.list = async (req, res) => {
  try {
    if (!models) throw new Error('ORM not initialized');
    const { election_id } = req.query;
    const where = {};
    if (election_id) where.election_id = election_id;
    const rows = await models.Setting.findAll({ where, order: [['id','DESC']] });
    res.json({ results: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    if (!models) throw new Error('ORM not initialized');
    const s = await models.Setting.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'not found' });
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    if (!models) throw new Error('ORM not initialized');
  const { name, theme_color, election_id, footer_text, support_email, is_default } = req.body;
    const logo_path = req.file ? publicPathFor(req.file.filename) : null;

    // if marking as default, unset other defaults for the same election
    if (is_default && election_id) {
      await models.Setting.update({ is_default: false }, { where: { election_id }, transaction: t });
    }

  const s = await models.Setting.create({ name, theme_color, logo_path, election_id: election_id || null, footer_text: footer_text || null, support_email: support_email || null, is_default: !!is_default }, { transaction: t });
    await t.commit();
    try { await models.Log.create({ user_id: req.full_user && req.full_user.id ? req.full_user.id : null, action: 'create', details: `setting ${s.id} created` }); } catch (e) { /* best effort */ }
    res.status(201).json(s);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    if (!models) throw new Error('ORM not initialized');
    const s = await models.Setting.findByPk(req.params.id);
    if (!s) { await t.rollback(); return res.status(404).json({ error: 'not found' }); }
  const { name, theme_color, election_id, footer_text, support_email, is_default } = req.body;
    if (name !== undefined) s.name = name;
    if (theme_color !== undefined) s.theme_color = theme_color;
    if (footer_text !== undefined) s.footer_text = footer_text || null;
    if (support_email !== undefined) s.support_email = support_email || null;
    if (election_id !== undefined) s.election_id = election_id || null;
    if (req.file) s.logo_path = publicPathFor(req.file.filename);

    // if marking as default, unset others for the same election first
    if (is_default && s.election_id) {
      await models.Setting.update({ is_default: false }, { where: { election_id: s.election_id }, transaction: t });
      s.is_default = true;
    } else if (is_default === 'false' || is_default === false) {
      s.is_default = false;
    }

    await s.save({ transaction: t });
    await t.commit();
  try { await models.Log.create({ user_id: req.full_user && req.full_user.id ? req.full_user.id : null, action: 'update', details: `setting ${s.id} updated` }); } catch (e) { /* best effort */ }
    res.json(s);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    if (!models) throw new Error('ORM not initialized');
    const s = await models.Setting.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'not found' });
    await s.destroy();
  try { await models.Log.create({ user_id: req.full_user && req.full_user.id ? req.full_user.id : null, action: 'delete', details: `setting ${s.id} deleted` }); } catch (e) { /* best effort */ }
    res.json({ message: 'deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
