'use strict';

const stream = require('readable-stream');
const Sink = require('../');
const tap = require('tap');
const fs = require('fs');


tap.test('constructor() - has value for "options.path" argument - should be of Sink Class type', (t) => {
    t.type(new Sink(), Sink);
    t.end();
});


tap.test('.writer() - no value for "type" argument - should throw', (t) => {
    const sink = new Sink();
    t.throws(() => {
        const dest = sink.writer(); // eslint-disable-line
    }, new Error('"type" is missing'));
    t.end();
});

tap.test('.writer() - save to existing path - should emit "file saved" event', (t) => {
    const sink = new Sink();
    const source = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('json');
    dest.on('file saved', () => {
        t.assert(true);
        t.end();
    });
    source.pipe(dest);
});

tap.test('.writer() - on "file saved" - should have "id" and "file" on emitted event', (t) => {
    const sink = new Sink();
    const source = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('json');
    dest.on('file saved', (id, file) => {
        t.assert(id);
        t.assert(file);
        t.end();
    });
    source.pipe(dest);
});


tap.test('.reader() - no value for "file" argument - should throw', (t) => {
    const sink = new Sink();
    t.throws(() => {
        const source = sink.reader(); // eslint-disable-line
    }, new Error('"file" is missing'));
    t.end();
});


tap.test('.reader() - read non-existing file - should emit "file not found" event', (t) => {
    const sink = new Sink();
    const source = sink.reader('feed.b.json');
    source.on('file not found', () => {
        t.assert(true);
        t.end();
    });
});


tap.test('.reader() - read non-existing file - should have filename as first argument in event', (t) => {
    const sink = new Sink();
    const source = sink.reader('feed.b.json');
    source.on('file not found', (file) => {
        t.equal(file, 'feed.b.json');
        t.end();
    });
});


tap.test('.reader() - read existing file - should emit "file found" event', (t) => {
    const sink = new Sink();
    sink.db['feed.a.json'] = 'foobar';
    const source = sink.reader('feed.a.json');
    source.on('file found', () => {
        t.assert(true);
        t.end();
    });
});


tap.test('.reader() - read existing file - should have filename as first argument in event', (t) => {
    const sink = new Sink();
    sink.db['feed.a.json'] = 'foobar';
    const source = sink.reader('feed.a.json');
    source.on('file found', (file) => {
        t.equal(file, 'feed.a.json');
        t.end();
    });
});


tap.test('.reader() - read existing file - should stream read file', (t) => {
    const dest = new stream.Writable({
        _data: false,
        write (chunk, encoding, next) {
            this._data += chunk;
            next();
        },
    });

    const sink = new Sink();
    sink.db['feed.a.json'] = 'foobar';

    const source = sink.reader('feed.a.json');

    source.on('file found', () => {
        source.pipe(dest);
    });

    dest.on('finish', () => {
        t.assert(dest._data);
        t.end();
    });
});
