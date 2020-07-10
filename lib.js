const fs = require("fs");
const path = require("path");
const { Observable } = require("rxjs");
const { toArray, map, groupBy, reduce, mergeMap } = require('rxjs/operators')
const _ = require('lodash');


const createPipebleOperator = (coreFn) => {
  return (source) =>
    Observable.create((subscriber) => {
      const sub = coreFn(subscriber);
      source.subscribe({
        next: sub.next,
        error: sub.error || ((e) => subscriber.error(e)),
        complete: sub.complete || ((e) => subscriber.complete(e)),
      });
    });
};

const readDir = (dir) =>
  Observable.create((subscriber) => {
    try {
      const fullPath = path.join(__dirname, dir);
      fs.readdirSync(fullPath).forEach((f) => {
        subscriber.next(path.join(fullPath, f));
      });
      subscriber.complete();
    } catch (e) {}
  });

const filterByExtension = (...exts) => {
  return createPipebleOperator((subscriber) => ({
    next(value) {
      for (const ext of exts) {
        if (value.endsWith(ext)) {
          subscriber.next(value);
          break;
        }
      }
    },
  }));
};

const readFile = createPipebleOperator((subscriber) => ({
    next(path) {
      try {
        const content = fs.readFileSync(path, { encoding: "utf-8" });
        subscriber.next(content.toString());
      } catch (e) {
        subscriber.error(e);
      }
    },
}));

const splitTextBy = (key) => createPipebleOperator((subscriber) => ({
    next(value) {
        value.split(key).forEach(res => {
            subscriber.next(res);
        })
    },
}));

const removeEmptyElements = createPipebleOperator((subscriber) => ({
    next(value) {
        if(value.trim()) {
            subscriber.next(value);
        }
    },
}));


const removeSymbols = (symbols) => createPipebleOperator((subscriber) => ({
    next(value) {
        const cleaned = symbols.reduce((acc, el) => {
            return acc.split(el).join('').trim();
        }, value)
        subscriber.next(cleaned);
    },
}));

const removeNumbers = createPipebleOperator((subscriber) => ({
    next(value) {
        const v = parseInt(value);
        if(v !== v) {
            subscriber.next(value)
        }
    },
}));

const splitByWord = createPipebleOperator((subscriber) => ({
    next(value) {
        value.split(' ').forEach(w => subscriber.next(w.toLowerCase()))
    },
}));
// @deprecated
const groupEqualWordsAndCount = createPipebleOperator((subscriber) => ({
    next(words) {
        const grouped = Object.values(words.reduce((acc, w) => {
            const el = w.toLowerCase();
            const each = acc[el] ? acc[el].each + 1 : 1;
            acc[el] = {
                el,
                each
            }
            return acc;
        }, {}))
        subscriber.next(grouped)
    },
}));

const groupWords = groupBy(el => el);
const mergeGroup = mergeMap(group => group.pipe(toArray()))

const transformArray = toArray();
const sortElements = map(arr => _.sortBy(arr, el => -el.each))

const countWords = map(el => ({el: el[0], each: el.length}))

module.exports = {
  readDir,
  filterByExtension,
  readFile,
  splitTextBy,
  removeEmptyElements,
  removeSymbols,
  removeNumbers,
  splitByWord,
  groupEqualWordsAndCount,
  transformArray,
  sortElements,
  groupWords,
  mergeGroup,
  countWords,
};
