import config from './guard.config.mjs';
config.test.projects.push({extends:true,test:{name:'unexpected-extra',include:['parallel.test.mjs']}});
export default config;
