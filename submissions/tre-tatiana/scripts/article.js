// DONE: Wrap the entire contents of this file in an IIFE.
// Pass in to the IIFE a module, upon which objects can be attached for later access.function
(function(module){
  function Article (opts) {
    for (key in opts) {
      this[key] = opts[key];
    }
  }

  Article.all = [];

  Article.prototype.toHtml = function(scriptTemplateId) {
    var template = Handlebars.compile(scriptTemplateId.html());

    this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
    this.publishStatus = this.publishedOn ? 'published ' + this.daysAgo + ' days ago' : '(draft)';
    this.body = marked(this.body);

    return template(this);
  };

  Article.loadAll = function(dataWePassIn) {
    dataWePassIn.sort(function(a,b) {
      return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
    });

    /* DONE: the original forEach code below has been refactored
       using `.map()` -  since what we are trying to accomplish is the
       transformation of one colleciton into another.

       dataWePassIn.forEach(function(ele) {
        Article.all.push(new Article(ele));
       }) */
    Article.all = dataWePassIn.map(function(ele) {
      return new Article(ele);
    });
  };

  // This function will retrieve the data from either a local or remote source,
  // and process it, then hand off control to the View.

  /* DONE: Refactoring the Article.fetchAll method, it now accepts a parameter
      called 'next' ('next' is just a placeholder, but when referenced at
      the time fetchAll is called it will be a 'view' function) that will
      execute once the loading of articles is done. We do this because
      we might want to call other view functions, and not just initIndexPage();
      Now instead of calling articleView.initIndexPage(), we can call
      whatever we pass in! */
  Article.fetchAll = function(next) {
    if (localStorage.hackerIpsum) {
      $.ajax({
        type: 'HEAD',
        url: 'data/hackerIpsum.json',
        success: function(data, message, xhr) {
          var eTag = xhr.getResponseHeader('eTag');
          if (!localStorage.eTag || eTag !== localStorage.eTag) {
            localStorage.eTag = eTag;
            Article.getAll(next); //DONE: pass 'next' into getAll();
          } else {
            Article.loadAll(JSON.parse(localStorage.hackerIpsum));
            // DONE: Replace the following line with 'next' and call next instead.
            next();
          }
        }
      });
    } else {
      Article.getAll(next); // DONE: pass 'next' into getAll();
    }
  };

  Article.getAll = function(next) {
    $.getJSON('data/hackerIpsum.json', function(responseData) {
      Article.loadAll(responseData);
      localStorage.hackerIpsum = JSON.stringify(responseData);
      // DONE: call next!
      next();
    });
  };

  /* DONE: Chain together a `map` and a `reduce` call to get a rough count of
      all words in all articles. */
  Article.numWordsAll = function() {
    return Article.all.map(function(article) {
        //DONE: Grab the word count from each article body.
      return article.body.match(/\b\w+/g).length;
    })
    .reduce(function(a, b) {
      // return (DONE: Sum up all the values!)
      return a + b;
    });
  };

  /* DONE: Chain together a `map` and a `reduce` call to
            produce an array of *unique* author names. */

  Article.allAuthors = function() {
    //return       DONE: map our collection
    return Article.all.map(function(article){
      return article.author;
    }).reduce(function(authorNames, name) {
      if(authorNames.indexOf(name) === -1) {
        authorNames.push(name);
      };
      return authorNames;
    }, []);
      //return    DONE: return just the author names
    /* DONE: For our `reduce` that we'll chain here -- since we are trying to
        return an array, we'll need to specify an accumulator type...
        What data type should this accumulator be and where is it placed? */
  };

  Article.numWordsByAuthor = function() {
    /* DONE: Transform each author element into an object with 2 properties:
        One for the author's name, and one for the total number of words across
        the matching articles written by the specified author. */

    return Article.allAuthors().map(function(a) { // 'a' is a reference to an individual author.
      return {
        name: a,
        numWords: Article.all.filter(function(curArticle) {
          return curArticle.author === a;
         //what do we return here to check for matching authors?
        })
        .map(function(article) {
          return article.body.match(/\b\w+/g).length;
        })
        // use .map to return the author's word count for each article's body (hint: regexp!).
        // .reduce(...) // squash this array of numbers into one big number!
        .reduce(function(a, b) {
          return a + b;
        })
      };
    });
  };
  module.Article = Article;
})(window);
