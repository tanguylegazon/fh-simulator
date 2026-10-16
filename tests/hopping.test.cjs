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

test('all supported configurations preserve frequency bounds and distinct assignments', () => {
    for (let hsn = 0; hsn <= 63; ++hsn) {
        context.hsnValue = hsn;
        for (let count = 1; count <= 20; ++count) {
            context.numberOfFrequencies = count;
            for (let slot = 1; slot <= 100; ++slot) {
                const frequencies = [];
                for (let phone = 0; phone < 10; ++phone) {
                    const frequency = context.getFrequencyHSN(slot, phone);
                    assert.ok(Number.isInteger(frequency) && frequency >= 1 && frequency <= count);
                    assert.equal(context.getFrequencyHSN(slot, phone), frequency);
                    assert.equal(context.getFrequencyHSN(slot, phone + count), frequency);
                    if (hsn === 0) assert.equal(frequency, (slot + phone) % count + 1);
                    frequencies.push(frequency);
                    assert.equal(new Set(frequencies).size, Math.min(phone + 1, count));
                }
            }
        }
    }
});

test('HSN 5 has neither the former 15-slot cycle nor fixed phone offsets', () => {
    context.hsnValue = 5;
    context.numberOfFrequencies = 10;
    const assignments = Array.from({length: 300}, (_, slot) =>
        Array.from({length: 5}, (_, phone) => context.getFrequencyHSN(slot + 1, phone)));
    assert.notDeepEqual(assignments.slice(0, 285), assignments.slice(15));
    const offsets = assignments.map(frequencies => (frequencies[1] - frequencies[0] + 10) % 10);
    assert.equal(new Set(offsets).size, 9);
    for (let phone = 0; phone < 5; ++phone) {
        assert.equal(new Set(assignments.map(frequencies => frequencies[phone])).size, 10);
    }
    context.hsnValue = 6;
    assert.ok(assignments.some((frequencies, slot) =>
        frequencies[0] !== context.getFrequencyHSN(slot + 1, 0)));
});
