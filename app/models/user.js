var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
});




module.exports = User;

// findOrCreate = function(gitObj, callback){
//   console.log(gitObj.githubID);


//   new User({'username': gitObj.githubID }).fetch().then(function (model) {
//     if(model === null){
//       console.log('no users');
//     }else{
//       if(model.attributes.password === password){
//         req.session.regenerate(function(){
//           req.session.user = username;
//           res.redirect('index');
//         });
//       }else{
//         res.redirect('login');
//       }
//     }
//   });
// };