// Netlify Function for Cross-Device Synchronization
const masterVault = {
  accounts: {},
  codes: {}
};

export async function handler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const method = event.httpMethod;

  try {
    if (method === 'POST' || method === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      const { email, user, agency, syncCode, code, vaultData } = body;

      const activeCode = (syncCode || code || '').trim().toUpperCase();
      const activeEmail = (email || '').trim().toLowerCase();

      const vault = vaultData || { email: activeEmail, user, agency, syncCode: activeCode, updatedAt: new Date().toISOString() };

      if (activeCode) {
        masterVault.codes[activeCode] = vault;
      }
      if (activeEmail) {
        masterVault.accounts[activeEmail] = vault;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, syncCode: activeCode, email: activeEmail, vault })
      };
    }

    if (method === 'GET') {
      const params = event.queryStringParameters || {};
      const code = (params.code || '').trim().toUpperCase();
      const email = (params.email || '').trim().toLowerCase();

      if (code && masterVault.codes[code]) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, vault: masterVault.codes[code] })
        };
      }

      if (email && masterVault.accounts[email]) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, vault: masterVault.accounts[email] })
        };
      }

      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Vault not found for provided code or email' })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
}
