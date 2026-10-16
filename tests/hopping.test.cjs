const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {test} = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
const start = source.indexOf('function getFrequencyHSN(');
const end = source.indexOf('function getColor(');
assert.ok(start >= 0 && end > start);
const context = vm.createContext({hsnValue: 0, numberOfFrequencies: 1});
vm.runInContext(source.slice(start, end), context);

test('HSN 5 keeps five phones on distinct frequencies at slots 8 and 23', () => {
    context.hsnValue = 5;
    context.numberOfFrequencies = 10;
    for (const slot of [8, 23]) {
        const frequencies = Array.from({length: 5}, (_, phone) => context.getFrequencyHSN(slot, phone));
        assert.equal(new Set(frequencies).size, 5);
    }
});

test('all supported configurations preserve frequency bounds and phone offsets', () => {
    for (let hsn = 0; hsn <= 63; ++hsn) {
        context.hsnValue = hsn;
        for (let count = 1; count <= 20; ++count) {
            context.numberOfFrequencies = count;
            const period = hsn === 0 ? count : count + hsn;
            for (let slot = 1; slot <= period * 2; ++slot) {
                const frequencies = [];
                for (let phone = 0; phone < 10; ++phone) {
                    const frequency = context.getFrequencyHSN(slot, phone);
                    assert.ok(Number.isInteger(frequency) && frequency >= 1 && frequency <= count);
                    assert.equal(context.getFrequencyHSN(slot, phone), frequency);
                    assert.equal(context.getFrequencyHSN(slot + period, phone), frequency);
                    if (hsn === 0) assert.equal(frequency, (slot + phone) % count + 1);
                    frequencies.push(frequency);
                    assert.equal(new Set(frequencies).size, Math.min(phone + 1, count));
                }
            }
        }
    }
});
