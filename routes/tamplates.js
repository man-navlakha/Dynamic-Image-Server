const express = require('express');
const path = require('path');
const { getTemplate, listTemplates, renderTemplate } = require('../lib/tamplates/engine');

const router = express.Router();
const builderDir = path.join(__dirname, '..', 'public', 'tamplate-builder');

router.use('/tamplates/assets', express.static(builderDir));
router.use('/templates/assets', express.static(builderDir));

router.get(['/tamplates', '/templates'], (req, res) => {
  res.sendFile(path.join(builderDir, 'index.html'));
});

router.get(['/api/tamplates', '/api/templates'], async (req, res) => {
  try {
    res.json({ templates: await listTemplates() });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Unable to list templates.' });
  }
});

router.get(['/api/tamplates/:type', '/api/templates/:type'], async (req, res) => {
  try {
    res.json({ templates: await listTemplates(req.params.type) });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Unable to list templates.' });
  }
});

router.get(['/api/tamplates/:type/:category/:id', '/api/templates/:type/:category/:id'], async (req, res) => {
  try {
    res.json(await getTemplate(req.params.type, req.params.category, req.params.id));
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Unable to load template.' });
  }
});

router.post(['/api/tamplates/:type/:category/:id/render', '/api/templates/:type/:category/:id/render'], async (req, res) => {
  try {
    const markdown = await renderTemplate(req.params.type, req.params.category, req.params.id, req.body || {});

    if (req.query.download === 'true') {
      res.set('Content-Type', 'text/markdown; charset=utf-8');
      res.set('Content-Disposition', 'attachment; filename="README.md"');
      return res.status(200).send(markdown);
    }

    return res.json({ markdown });
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || 'Unable to render template.',
      errors: error.details || undefined
    });
  }
});

module.exports = router;
