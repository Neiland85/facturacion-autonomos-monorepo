const vault = require('node-vault')({ endpoint: 'http://127.0.0.1:8200' });

export async function getSecret(path: string) {
  try {
    const secret = await vault.read(path);
    return secret.data.data;
  } catch (error) {
    console.error('Error fetching secret:', error);
    throw error;
  }
}

export async function setSecret(path: string, data: Record<string, any>) {
  try {
    await vault.write(path, data);
    console.log('Secret stored successfully');
  } catch (error) {
    console.error('Error storing secret:', error);
    throw error;
  }
}
