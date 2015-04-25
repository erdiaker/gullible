
describe('Gullible', function() {

  var assert;
  var Gullible;
  before(function() {
    assert = require('chai').assert;
    Gullible = require('../gullible.js');
  });

  var c;
  beforeEach(function() {
    c = new Gullible();
  });

  describe('learn', function() {
    it('should learn given text-label pair', function() {
      c.learn('text', 'label');
      assert.equal(c.getSampleCount(), 1);
      assert.equal(c.getClasses().length, 1);
      assert.equal(c.getWords().length, 1);
    });
  });

  describe('tokenize', function() {
    it('should tokenize text by removing whitespace and punctuation', function() {
      c.learn('  a b \t c \n\n d. !! 1  ? ', 'label');
      assert.equal(c.getWords().length, 5);
    });
  });

  describe('classify', function() {
    it('should classify a previously unknown text', function() {
      c.learn('a b c', 'label1');
      c.learn('d e f', 'label2');
      assert.equal(c.classify('b c a'), 'label1');
    });
  });

  describe('estimate', function() {
    it('should estimate a score for a text class pair', function() {
      c.learn('text', 'label');
      assert.isAbove(
        c.estimate('text', 'label'),
        c.estimate('text2', 'label'));
    });
  });

  describe('unlearn', function() {
    it('should unlearn a previously learned sample', function() {
      c.learn('text', 'label');
      c.learn('text2', 'label2');
      var labelBefore = c.classify('text');
      c.unlearn('text', 'label');
      var labelAfter = c.classify('text');
      assert.notEqual(labelBefore, labelAfter);
    });
  });

  describe('toJSON', function() {
    it('should serialize given classifier in JSON format', function() {
      c.learn('text', 'label');
      var serialized = Gullible.toJSON(c);
      assert.isString(serialized);
    });
  });

  describe('fromJSON', function() {
    it('should restore a serialized classifier', function() {
      c.learn('text', 'label');
      var serialized = Gullible.toJSON(c);
      var cAfter = Gullible.fromJSON(serialized);
      assert.equal(JSON.stringify(c), JSON.stringify(cAfter));
    });
  });
 
});
