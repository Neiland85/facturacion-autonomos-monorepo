import { SignedXml } from 'xml-crypto';
import * as fs from 'fs';

export const signXML = (xml: string, privateKeyPath: string, certificatePath: string) => {
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  const certificate = fs.readFileSync(certificatePath, 'utf8');

  const sig = new SignedXml({
    privateKey,
    getKeyInfoContent: () => `<X509Data><X509Certificate>${certificate}</X509Certificate></X509Data>`
  });

  sig.addReference({
    xpath: "/*",
    transforms: ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'],
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1'
  });

  sig.computeSignature(xml);
  return sig.getSignedXml();
};
