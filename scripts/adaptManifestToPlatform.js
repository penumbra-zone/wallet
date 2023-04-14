const action = {
  default_title: 'Penumbra Wallet',
  default_popup: 'popup.html',
  default_icon: {
    16: 'icons/icon_16.png',
    32: 'icons/icon_32.png',
    192: 'icons/icon_192.png',
    512: 'icons/icon_512.png',
  },
};

const contentSecurityPolicy =
  "object-src 'self'; script-src 'self' 'wasm-unsafe-eval'";


const manifestV3 = {
  manifest_version: 3,
  action,
  background: {
    service_worker: 'background.js',
  },
  content_security_policy: {
    extension_pages: contentSecurityPolicy,
  },
  web_accessible_resources: [
    { resources: ['inpage.js'], matches: ['<all_urls>'] },
  ],
};

const platformValues = {
  chrome: manifestV3,
};

module.exports = (buffer, platformName) => ({
  ...JSON.parse(buffer.toString('utf-8')),
  version: process.env.PENUMBRA_VERSION,
  ...platformValues[platformName],
});
