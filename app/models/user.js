var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',

  findOrCreate: function(gitObj, callback){
    // console.log(obj.githubID);


    // new User({'username': obj.githubID }).fetch().then(function (model) {
    //   if(model === null){
    //     console.log('no users');
    //   }else{
    //     if(model.attributes.password === password){
    //       req.session.regenerate(function(){
    //         req.session.user = username;
    //         res.redirect('index');
    //       });
    //     }else{
    //       res.redirect('login');
    //     }
    //   }
    // });
  }
})




module.exports = User;

