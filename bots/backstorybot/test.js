const _ = require('lodash')
const Backstory = require('./backstory.gen.js');

_.times(10, ()=>{
console.log(Backstory.birthplace());

})