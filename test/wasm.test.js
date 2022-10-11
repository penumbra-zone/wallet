import { generateSpendKey } from 'penumbra-web-assembly';

var assert = require('assert');
// import { generateSpendKey } from 'penumbra-web-assembly';
const { getSeedPhrase } = require('../src/utils/getSeedPhrase');

describe('Spend key', function() {
  describe('generate spending key', function() {
    it('should succesful generated spending key from seed', function() {
      let seed = getSeedPhrase();
      let spendKey = generateSpendKey(getSeedPhrase());
    });
  });
});
