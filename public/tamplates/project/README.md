# Project README Templates

Add project templates here.

Recommended structure:

```text
public/tamplates/project/<category>/<template-id>.md
public/tamplates/project/<category>/<template-id>.json
```

Example:

```text
public/tamplates/project/saas/modern.md
public/tamplates/project/saas/modern.json
```

The JSON file should include:

```json
{
  "id": "modern",
  "type": "project",
  "category": "saas",
  "name": "Modern SaaS Project",
  "description": "README for a SaaS product repository.",
  "template": "modern.md",
  "fields": ["project_name", "repo_url", "live_url"]
}
```
