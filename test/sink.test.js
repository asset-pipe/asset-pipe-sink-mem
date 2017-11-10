'use strict';

const stream = require('readable-stream');
const Sink = require('../');
const fs = require('fs');

test('.get() - non value should error', async () => {
    const sink = new Sink();

    expect(sink.get('some-key')).rejects.toEqual(
        new Error('No file with some-key')
    );
});

test('.set() - should set value', async () => {
    const sink = new Sink();

    await sink.set('some-key-1', 'value-1');
    expect(await sink.get('some-key-1')).toBe('value-1');
});

test('.set() - should not set value if missing value', async () => {
    expect.assertions(2);
    const sink = new Sink();

    try {
        await sink.set('some-key-1');
    } catch (e) {
        expect(e).toMatchSnapshot();
    }

    try {
        await sink.get('some-key-1');
    } catch (e) {
        expect(e).toMatchSnapshot();
    }
});

test('.has() - should return false if value not present', async () => {
    const sink = new Sink();

    expect(await sink.has('some-key-1')).toBe(false);
});

test('.has() - should return true if value present', async () => {
    const sink = new Sink();

    await sink.set('some-key-1', 'value-1');
    expect(await sink.has('some-key-1')).toBe(true);
});

test('.writer() - no value for "type" argument - should throw', () => {
    const sink = new Sink();
    expect(() => {
        sink.writer();
    }).toThrowError('"type" is missing');
});

test('.writer() - save to existing path - should emit "file saved" event', done => {
    expect.assertions(0);
    const sink = new Sink();
    const source = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('json');
    dest.on('file saved', () => done());
    source.pipe(dest);
});

test('.writer() - on "file saved" - should have "id" and "file" on emitted event', done => {
    expect.assertions(2);
    const sink = new Sink();
    const source = fs.createReadStream('./test/mock/feed.a.json');
    const dest = sink.writer('json');
    dest.on('file saved', (id, file) => {
        expect(id).toBeDefined();
        expect(file).toBeDefined();
        done();
    });
    source.pipe(dest);
});

test('.reader() - no value for "file" argument - should throw', () => {
    const sink = new Sink();
    expect(() => {
        sink.reader();
    }).toThrowError('"file" is missing');
});

test('.reader() - read non-existing file - should emit "file not found" event', done => {
    expect.assertions(0);
    const sink = new Sink();
    const source = sink.reader('feed.b.json');
    source.on('file not found', () => done());
});

test('.reader() - read non-existing file - should have filename as first argument in event', done => {
    expect.assertions(1);
    const sink = new Sink();
    const source = sink.reader('feed.b.json');
    source.on('file not found', file => {
        expect(file).toBe('feed.b.json');
        done();
    });
});

test('.reader() - read existing file - should emit "file found" event', done => {
    expect.assertions(0);
    const sink = new Sink();
    sink.db['feed.a.json'] = 'foobar';
    const source = sink.reader('feed.a.json');
    source.on('file found', () => done());
});

test('.reader() - read existing file - should have filename as first argument in event', done => {
    expect.assertions(1);
    const sink = new Sink();
    sink.db['feed.a.json'] = 'foobar';
    const source = sink.reader('feed.a.json');
    source.on('file found', file => {
        expect(file).toBe('feed.a.json');
        done();
    });
});

test('.reader() - read existing file - should stream read file', done => {
    expect.assertions(1);
    const dest = new stream.Writable({
        _data: false,
        write(chunk, encoding, next) {
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
        expect(dest._data).toBeDefined();
        done();
    });
});
