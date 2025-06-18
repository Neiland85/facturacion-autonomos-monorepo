import fs from 'fs';

const consentFilePath = 'data/consent.json';

export const saveConsent = (userId: string, consentGiven: boolean): void => {
  const consentData = JSON.parse(fs.readFileSync(consentFilePath, 'utf8') || '{}');
  consentData[userId] = { consentGiven, timestamp: new Date().toISOString() };
  fs.writeFileSync(consentFilePath, JSON.stringify(consentData, null, 2));
};

export const getConsent = (userId: string): boolean | null => {
  const consentData = JSON.parse(fs.readFileSync(consentFilePath, 'utf8') || '{}');
  return consentData[userId]?.consentGiven || null;
};
