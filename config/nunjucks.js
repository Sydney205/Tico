const nunjucks = require("nunjucks");

module.exports.nunjucksConfig = function(app) {
  nunjucks.configure('views', {
    autoscape: true,
    express: app
  });
}

