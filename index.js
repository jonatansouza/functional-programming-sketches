/**
 * O objetivo deste exercicio e ler um diretorio que contenham arquivos de legendas (.srt) 
 * e contar quantas vezes cada palavra foi dita
 */
const fileHandlerLib = require("./lib");
const { readFile, removeEmptyElements, removeSymbols, removeNumbers, splitByWord, groupEqualWordsAndCount, transformArray, sortElements, groupWords, mergeGroup, countWords } = require("./lib");

const avoidSymbols = [
    '-->', '♪', '"', '?', ':', '.', ',', '[', ']', '\r', '(', ')', '!', '_', '- ', '<i>', '</i>',
]

const elimianteSimbols = removeSymbols(avoidSymbols);
const legendasDir = fileHandlerLib.readDir('legendas')
const extensions = fileHandlerLib.filterByExtension([
    '.srt'
])
const getLines = fileHandlerLib.splitTextBy('\n')

legendasDir.pipe(
    extensions,
    readFile,
    getLines,
    removeNumbers,
    elimianteSimbols,
    removeEmptyElements,
    splitByWord,
    groupWords,
    mergeGroup,
    countWords,
    transformArray,
    sortElements
).subscribe(console.log)