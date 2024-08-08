import nunjucks from 'nunjucks';

export function nunjucksConfig(app) {
  nunjucks.configure('views', {
    autoscape: true,
    express: app
  });
}

