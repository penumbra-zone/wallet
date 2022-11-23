import LocalMessageDuplexStream from 'post-message-stream';
import { extension, PortStream } from './lib';

// if (shouldInject()) {
  injectBundle();
  setupConnection();
// }

function injectBundle() {
  const container = document.head || document.documentElement;
  const script = document.createElement('script');
  script.src = extension.runtime.getURL('inpage.js');
  container.insertBefore(script, container.children[0]);

  script.onload = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    script.parentElement!.removeChild(script);
  };
}

function setupConnection() {
  //stream from contentscript to inpage
  const inpageStream = new LocalMessageDuplexStream({
    name: 'penumbra_content',
    target: 'penumbra_page',
  });

  extension.storage.onChanged.addListener(() => {
    inpageStream.write({ name: 'updatePublicState' });
  });

  const connect = () => {
    //stream from contentscript to background
    const backgroundPort = extension.runtime.connect({ name: 'contentscript' });
    const backgroundStream = new PortStream(backgroundPort);

    //stream from inpage to background
    inpageStream.pipe(backgroundStream).pipe(inpageStream);

    const onDisconnect = (port: chrome.runtime.Port) => {
      port.onDisconnect.removeListener(onDisconnect);
      // delete stream inpage to background
      inpageStream.unpipe(backgroundStream);
      // delete stream background to inpage
      backgroundStream.unpipe(inpageStream);

      backgroundStream.destroy();
      connect();
    };

    backgroundPort.onDisconnect.addListener(onDisconnect);
  };
  connect();
}

function shouldInject() {
  return doctypeCheck() && suffixCheck() && documentElementCheck();
}

function doctypeCheck() {
  const doctype = window.document.doctype;
  if (doctype) {
    return doctype.name === 'html';
  } else {
    return true;
  }
}

function suffixCheck() {
  const prohibitedTypes = ['xml', 'pdf'];
  const currentUrl = window.location.href;
  let currentRegex;
  for (let i = 0; i < prohibitedTypes.length; i++) {
    currentRegex = new RegExp(`\\.${prohibitedTypes[i]}$`);
    if (currentRegex.test(currentUrl)) {
      return false;
    }
  }
  return true;
}

function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}
