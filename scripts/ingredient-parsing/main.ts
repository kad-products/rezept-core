import currentRawData from './current-raw-data';
import explicitRules from './explicit-rules';
import parseIngredient from './parse-ingredient';
import sharpRecipeParser from './sharp-recipe-parser';

const explicitRulesResults = await explicitRules(currentRawData);
const sharpResults = await sharpRecipeParser(currentRawData);
const parseResults = await parseIngredient(currentRawData);
// console.log(explicitRulesResults);
// console.log(sharpResults);
// console.log(parseResults);
// console.log(currentRawData.length, explicitRulesResults.length, sharpResults.length, parseResults.length);

console.log(`| Raw | Explicit Rules | Sharp Parser | Parse Ingredients |`);
console.log(`| --- | --- | --- | --- |`);
currentRawData.forEach((raw, idx) => {
	console.log(`| ${[raw, explicitRulesResults[idx], sharpResults[idx], parseResults[idx]].join(' | ')} |`);
});
