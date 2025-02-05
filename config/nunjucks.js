import nunjucks from "nunjucks";

export const nunjucksConfig = function(app) {
  nunjucks.configure('views', {
    autoscape: true,
    express: app
  });
}

