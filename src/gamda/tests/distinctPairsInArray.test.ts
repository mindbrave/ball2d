
import { assert } from "chai";

import { everyDistinctPairInArray } from "../distinctPairsFromArray";

describe("Can generate disstinct pairs from array of distinct elements", () => {
    test("two elements array", () => {
        const array = [1, 2];

        const pairs = everyDistinctPairInArray(array);
    
        assert.equal(pairs.length, 1);
        assert.deepEqual(pairs[0], [1, 2]);
    });

    test("three elements array", () => {
        const array = [1, 2, 3];

        const pairs = everyDistinctPairInArray(array);
    
        assert.equal(pairs.length, 3);
        assert.deepEqual(pairs, [[1, 2], [1, 3], [2, 3]]);
    });

    test("empty array", () => {
        const array: number[] = [];

        const pairs = everyDistinctPairInArray(array);
    
        assert.equal(pairs.length, 0);
    });
});