const fs = require('fs/promises');
const path = require('path');

const templatesRoot = path.join(__dirname, '..', '..', 'public', 'tamplates');
const defaultBaseUrl = 'https://img-server-theta.vercel.app';
const validTypes = new Set(['profile', 'project', 'company']);

const commonQuestions = {
  full_name: {
    key: 'full_name',
    label: 'Full name',
    type: 'text',
    required: true,
    placeholder: 'Man Navlakha'
  },
  headline: {
    key: 'headline',
    label: 'Headline',
    type: 'text',
    required: false,
    placeholder: 'Full-stack developer building useful web tools.'
  },
  github_username: {
    key: 'github_username',
    label: 'GitHub username',
    type: 'text',
    required: true,
    placeholder: 'man-navlakha'
  },
  roles: {
    key: 'roles',
    label: 'Typewriter roles',
    type: 'textarea',
    required: true,
    placeholder: 'Web Developer, UI/UX Designer, Graphic Designer'
  },
  currently_working_on: {
    key: 'currently_working_on',
    label: 'Currently working on',
    type: 'text',
    required: true,
    placeholder: 'Building README tools.'
  },
  portfolio_url: {
    key: 'portfolio_url',
    label: 'Portfolio URL',
    type: 'url',
    required: true,
    placeholder: 'https://example.com'
  },
  ask_me_about: {
    key: 'ask_me_about',
    label: 'Ask me about',
    type: 'text',
    required: true,
    placeholder: 'JavaScript, APIs, UI design'
  },
  email: {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'name@example.com'
  },
  resume_url: {
    key: 'resume_url',
    label: 'Resume URL',
    type: 'url',
    required: false,
    placeholder: 'https://example.com/resume.pdf'
  },
  skills: {
    key: 'skills',
    label: 'Skill icons',
    type: 'textarea',
    required: true,
    placeholder: 'html, css, js, react, nextjs, nodejs'
  },
  featured_image_url: {
    key: 'featured_image_url',
    label: 'Featured image URL',
    type: 'url',
    required: false,
    placeholder: 'https://github.com/user-attachments/assets/...'
  },
  repo_1: {
    key: 'repo_1',
    label: 'Pinned repo 1',
    type: 'text',
    required: true,
    placeholder: 'portfolio'
  },
  repo_2: {
    key: 'repo_2',
    label: 'Pinned repo 2',
    type: 'text',
    required: true,
    placeholder: 'api-server'
  },
  repo_3: {
    key: 'repo_3',
    label: 'Pinned repo 3',
    type: 'text',
    required: false,
    placeholder: 'profile'
  },
  repo_4: {
    key: 'repo_4',
    label: 'Pinned repo 4',
    type: 'text',
    required: false,
    placeholder: 'dashboard'
  },
  linkedin_url: {
    key: 'linkedin_url',
    label: 'LinkedIn URL',
    type: 'url',
    required: false,
    placeholder: 'https://linkedin.com/in/username'
  },
  linkedin_label: {
    key: 'linkedin_label',
    label: 'LinkedIn badge label',
    type: 'text',
    required: false,
    placeholder: 'username'
  },
  bio: {
    key: 'bio',
    label: 'Short bio',
    type: 'textarea',
    required: false,
    placeholder: 'I build polished web apps, APIs, and developer tools.'
  },
  logo_url: {
    key: 'logo_url',
    label: 'Logo URL',
    type: 'url',
    required: true,
    placeholder: 'https://example.com/logo.png'
  },
  product_name: {
    key: 'product_name',
    label: 'Product Name',
    type: 'text',
    required: true,
    placeholder: 'Pixel Class'
  },
  repo_owner: {
    key: 'repo_owner',
    label: 'Repo Owner',
    type: 'text',
    required: true,
    placeholder: 'man-navlakha'
  },
  repo_name: {
    key: 'repo_name',
    label: 'Repo Name',
    type: 'text',
    required: true,
    placeholder: 'pxc'
  },
  short_bio: {
    key: 'short_bio',
    label: 'Short Bio',
    type: 'text',
    required: false,
    placeholder: 'Your ultimate study companion.'
  },
  demo_url: {
    key: 'demo_url',
    label: 'Demo URL',
    type: 'url',
    required: true,
    placeholder: 'https://pixelclass.netlify.app'
  },
  report_bug_url: {
    key: 'report_bug_url',
    label: 'Report Bug URL',
    type: 'url',
    required: false
  },
  request_feature_url: {
    key: 'request_feature_url',
    label: 'Request Feature URL',
    type: 'url',
    required: false
  },
  faq_url: {
    key: 'faq_url',
    label: 'FAQ URL',
    type: 'url',
    required: false
  },
  ask_question_url: {
    key: 'ask_question_url',
    label: 'Ask Question URL',
    type: 'url',
    required: false
  },
  donate_url: {
    key: 'donate_url',
    label: 'Donate URL',
    type: 'url',
    required: false
  },
  long_description: {
    key: 'long_description',
    label: 'Long Description',
    type: 'textarea',
    required: true
  },
  live_button_text: {
    key: 'live_button_text',
    label: 'Live Button Text',
    type: 'text',
    required: false
  },
  live_button_url: {
    key: 'live_button_url',
    label: 'Live Button URL',
    type: 'url',
    required: false
  },
  features: {
    key: 'features',
    label: 'Features',
    type: 'textarea',
    required: true,
    placeholder: 'Title:Description,Title2:Description2'
  },
  tech_stack: {
    key: 'tech_stack',
    label: 'Tech Stack',
    type: 'textarea',
    required: true,
    placeholder: 'react,vite,tailwindcss'
  },
  prerequisites: {
    key: 'prerequisites',
    label: 'Prerequisites',
    type: 'textarea',
    required: false,
    placeholder: 'git,nodejs,npm'
  },
  clone_url: {
    key: 'clone_url',
    label: 'Clone URL',
    type: 'url',
    required: true
  },
  project_dir: {
    key: 'project_dir',
    label: 'Project Directory',
    type: 'text',
    required: true,
    placeholder: 'pxc'
  },
  install_command: {
    key: 'install_command',
    label: 'Install Command',
    type: 'text',
    required: true,
    placeholder: 'npm install'
  },
  dev_command: {
    key: 'dev_command',
    label: 'Dev Command',
    type: 'text',
    required: true,
    placeholder: 'npm run dev'
  },
  dev_url: {
    key: 'dev_url',
    label: 'Dev URL',
    type: 'url',
    required: true,
    placeholder: 'http://localhost:5173'
  },
  authors: {
    key: 'authors',
    label: 'Authors',
    type: 'textarea',
    required: true,
    placeholder: 'Man Navlakha,https://github.com/man-navlakha,https://man-navlakha.netlify.app/'
  },
  feedback_email: {
    key: 'feedback_email',
    label: 'Feedback Email',
    type: 'email',
    required: false
  },
  copyright_year: {
    key: 'copyright_year',
    label: 'Copyright Year',
    type: 'text',
    required: true,
    placeholder: '2025'
  },
  copyright_name: {
    key: 'copyright_name',
    label: 'Copyright Name',
    type: 'text',
    required: true,
    placeholder: 'Dhruv & Man'
  },
  copyright_url: {
    key: 'copyright_url',
    label: 'Copyright URL',
    type: 'url',
    required: false
  }
};

function splitList(value) {
  return String(value || '')
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildTypewriterLines(value) {
  return splitList(value)
    .map((role) => `I'm a ${role}`)
    .map((line) => encodeURIComponent(line).replace(/%20/g, '+'))
    .join(';');
}

function cleanCommaList(value) {
  return splitList(value).join(',');
}

function createHttpError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
}

function assertSafeSegment(value, label) {
  if (!/^[a-zA-Z0-9_-]+$/.test(value || '')) {
    throw createHttpError(400, `Invalid ${label}.`);
  }
}

function resolveQuestion(question) {
  if (typeof question === 'string') {
    return commonQuestions[question] || {
      key: question,
      label: question.replace(/_/g, ' '),
      type: 'text',
      required: false
    };
  }

  const base = commonQuestions[question.key] || {};
  return { ...base, ...question };
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function walkJsonFiles(dir) {
  let entries = [];

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walkJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

function summarizeTemplate(meta) {
  return {
    id: meta.id,
    type: meta.type,
    category: meta.category,
    name: meta.name,
    description: meta.description || '',
    template: meta.template,
    endpoint: `/api/tamplates/${meta.type}/${meta.category}/${meta.id}`
  };
}

async function listTemplates(type) {
  if (type) {
    assertSafeSegment(type, 'template type');
    if (!validTypes.has(type)) return [];
  }

  const root = type ? path.join(templatesRoot, type) : templatesRoot;
  const files = await walkJsonFiles(root);
  const templates = [];

  for (const file of files) {
    const meta = await readJson(file);
    templates.push(summarizeTemplate(meta));
  }

  return templates.sort((a, b) => {
    return `${a.type}/${a.category}/${a.name}`.localeCompare(`${b.type}/${b.category}/${b.name}`);
  });
}

async function getTemplate(type, category, id) {
  assertSafeSegment(type, 'template type');
  assertSafeSegment(category, 'template category');
  assertSafeSegment(id, 'template id');

  const metaPath = path.join(templatesRoot, type, category, `${id}.json`);
  const meta = await readJson(metaPath).catch((error) => {
    if (error.code === 'ENOENT') {
      throw createHttpError(404, 'Template not found.');
    }
    throw error;
  });

  const questions = (meta.questions || meta.fields || []).map(resolveQuestion);

  return {
    ...summarizeTemplate(meta),
    defaults: meta.defaults || {},
    questions
  };
}

function normalizeValues(input, questions, defaults = {}) {
  const values = {
    base_url: defaultBaseUrl,
    ...defaults
  };

  for (const question of questions) {
    values[question.key] = String(input[question.key] || '').trim();
  }

  if (values.github_username) {
    values.github_username = values.github_username.replace(/^@/, '');
  }

  if (Object.prototype.hasOwnProperty.call(values, 'roles')) {
    values.typewriter_lines = buildTypewriterLines(values.roles);
  }

  if (Object.prototype.hasOwnProperty.call(values, 'skills')) {
    values.skills = cleanCommaList(values.skills);
  }

  return values;
}

function validateAnswers(values, questions) {
  const errors = [];

  for (const question of questions) {
    if (question.required && !values[question.key]) {
      errors.push(`${question.label} is required.`);
    }
  }

  if (questions.some((question) => question.key === 'roles' && question.required) && !values.typewriter_lines) {
    errors.push('At least one typewriter role is required.');
  }

  return errors;
}

function fillTemplate(template, values) {
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match;
  });
}

async function renderTemplate(type, category, id, input = {}) {
  const meta = await getTemplate(type, category, id);
  const values = normalizeValues(input, meta.questions, meta.defaults);
  const errors = validateAnswers(values, meta.questions);

  if (errors.length) {
    throw createHttpError(400, errors[0], errors);
  }

  const markdownPath = path.join(templatesRoot, type, category, meta.template);
  const markdown = await fs.readFile(markdownPath, 'utf8');

  return fillTemplate(markdown, values);
}

module.exports = {
  getTemplate,
  listTemplates,
  renderTemplate
};
