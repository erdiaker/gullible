
/**
 * Constructs a naive Bayes classifier.
 */
function Gullible(opts) {
  var options = opts || {};

  this.wcWordCls = {};      // word count by word and class
  this.wcCls = {};          // word count by class
  this.dwcCls = {};         // distinct word count by class
  this.scCls = {};          // sample count by class
  this.sc = 0;              // sample count

  this.tokenize = options.tokenizer || Gullible.defaultTokenize;
}

/**
 * Learns a text-class pair.
 */
Gullible.prototype.learn = function(text, cls) {
  var tokens = this.tokenize(text);
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    this.wcWordCls[token] = this.wcWordCls[token] || {};
    this.wcWordCls[token][cls] = this.wcWordCls[token][cls] || 0;
    this.wcWordCls[token][cls] += 1;

    this.wcCls[cls] = this.wcCls[cls] || 0;
    this.wcCls[cls] += 1;

    if (this.wcWordCls[token][cls] === 1) {
      this.dwcCls[cls] = this.dwcCls[cls] || 0; 
      this.dwcCls[cls] += 1;
    }
  }

  this.scCls[cls] = this.scCls[cls] || 0;
  this.scCls[cls] += 1;
  this.sc += 1;
};

/**
 * Unlearns a previously learned sample.
 * WARNING: This method assumes that the sample was previously learned.
 * Unlearning a non-existent sample will cause problems. Use at your own risk.
 */
Gullible.prototype.unlearn = function(text, cls) {
  var tokens = this.tokenize(text);
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    this.wcWordCls[token][cls] -= 1;
    if (this.wcWordCls[token][cls] === 0) {
      this.dwcCls[cls] -= 1;
    }
    this.wcCls[cls] -= 1;
  }
  this.scCls[cls] -= 1;
  if (this.scCls[cls] === 0) {
    delete this.scCls[cls];
  }
  this.sc -= 1;
};

/**
 * Estimates a score hinting the relation 
 * between a list of words and a class.
 */
Gullible.prototype.estimateWithTokens = function(tokens, cls) {
  // p(text | cls) ~ p(cls) * [ p(word1 | cls) * ... * p(wordn | cls) ]
  // p(word | cls) ~ #{word in cls} / #{all words in cls}

  // work with log probabilities to prevent any underflow
  var score = Math.log(this.scCls[cls] / this.sc);

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    // apply Laplace smoothing
    var smoothedWordCount = 
      this.wcWordCls[token] && this.wcWordCls[token][cls] 
      ? this.wcWordCls[token][cls] + 1 : 1;
    var smoothedAllCount = this.wcCls[cls] + this.dwcCls[cls];
    score += Math.log(smoothedWordCount / smoothedAllCount);
  }

  return score;
};

/**
 * Estimates a score hinting the relation 
 * between a text and class. 
 */ 
Gullible.prototype.estimate = function(text, cls) {
  var tokens = this.tokenize(text);
  return this.estimateWithTokens(tokens, cls) / tokens.length;
};

/**
 * Classifies given text.
 */
Gullible.prototype.classify = function(text) {
  var maxCls;
  var maxScore = Number.NEGATIVE_INFINITY;
  var tokens = this.tokenize(text);

  var classes = Object.keys(this.scCls);
  for (var i = 0; i < classes.length; i++) {
    var score = this.estimateWithTokens(tokens, classes[i]); 
    if (score > maxScore) {
      maxCls = classes[i];
      maxScore = score;
    }
  }
  
  return maxCls;
};

/**
 * Default tokenization method. 
 * Removes any non-word characters. Converts to lowercase.  
 * Splits at white-space.
 */
Gullible.defaultTokenize = function(text) {
  text = text.replace(/\W+/g, ' ');
  text = text.toLowerCase();
  return text.split(/\s+/g).filter(function(s) {return s !== '';});
};

/**
 * Serializes given classifier as a JSON string.
 */
Gullible.toJSON = function(classifier) {
  return JSON.stringify(classifier);
};

/**
 * Restores the classifier from JSON string.
 */
Gullible.fromJSON = function(str, opts) {
  var classifier = new Gullible(opts);
  var data = JSON.parse(str);
  for (var key in data) {
    if (data.hasOwnProperty(key)) {
      classifier[key] = data[key];
    }
  }
  return classifier;
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = Gullible;
}
