export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { name, email, organization, expiry } = req.body;

  const computedExpiry = expiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]; // Format: YYYY-MM-DD
    
  const githubToken = process.env.GITHUB_TOKEN;
  const repo = 'LetPeopleWork/Lighthouse'; 
  const workflowFile = 'generate-license.yml'; 
  const ref = 'main';

  const response = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${workflowFile}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: 'application/vnd.github+json'
    },
    body: JSON.stringify({
      ref,
      inputs: {
        name: name || '',
        email: email || '',
        organization: organization || '',
        expiry: computedExpiry
      }
    })
  });

  if (response.ok) return res.status(200).json({ status: 'success' });

  const error = await response.text();
  return res.status(500).json({ status: 'error', error });
}