
var assert = require('assert');
const {generateSpendKey} = require("penumbra-web-assembly");
const {getSeedPhrase} = require("../src/utils/getSeedPhrase");

describe('Spend key', function () {
    describe('generate spending key', function () {
        it('should succesful generated spending key from seed', function () {
            let spendKey = generateSpendKey(getSeedPhrase());
        });
    });
});