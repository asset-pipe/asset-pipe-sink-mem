"use strict";

const stream = require('stream');
const sink = require('../');
const tap = require('tap');


const sourceStream = (arr) => {
    return new stream.Readable({
        objectMode : false,
        read: function (n) {
            arr.forEach((chunk) => {
                this.push(chunk);
            });
            this.push(null);
        }
    });
}

const sourceArray = [a,b,c];


tap.test('foo', (t) => {
    sourceStream(sourceArray).pipe(compare([], 'uuid', compareFunction)).pipe(concat((result) => {
        t.similar(result[0], {appended : sourceArray[0]});
        t.similar(result[1], {appended : sourceArray[1]});
        t.similar(result[2], {appended : sourceArray[2]});
        t.end();
    }));
});