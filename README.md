Gullible
========

A naive Bayes text classifier in JavaScript.

### Installation
The easiest way is to use `npm`:
```sh
npm install gullible
```

Alternatively, you can clone the `git` repository:
```sh
git clone https://github.com/erdiaker/gullible.git
```

### Examples
```js
// Load module
var Gullible = require('gullible');

// Create a new classifier instance
var c = new Gullible();

// Prepare a training set 
var trainSet = [
  {
    text: 'My name is Ozymandias, king of kings: Look on my works, ye Mighty, and despair!', 
    label: 'ozymandias'
  },
  { 
    text: 'A horse! A horse! My kingdom for a horse!',
    label: 'edward_iii'
  }
];

// Learn some text-class pairs
c.learn(trainSet[0].text, trainSet[0].label);
c.learn(trainSet[1].text, trainSet[1].label);

// Classify a new text
var testText = 'Hey! Wanna trade your horse for my kingdom?';
var cls = c.classify(testText);
console.log(cls); // edward_iii

// Estimate a score for text-class pair
var scoreEd = c.estimate(testText, 'edward_iii');
var scoreOzy = c.estimate(testText, 'ozymandias');
console.log(scoreEd > scoreOzy); // true

// Unlearn a previously learned sample.
c.unlearn(trainSet[1].text, trainSet[1].label);
var cls2 = c.classify(testText);
console.log(cls2); // ozymandias

// Serialize classifier as a JSON string
var serialized = Gullible.toJSON(c);

// Restore serialized classifier
var restored = Gullible.fromJSON(serialized);
```
