const NightlifeUser = require('../models/nightlife_user');
const visitVenue = require('../models/visit_venue');
const jwt = require('jwt-simple');
const config = require('../config');

function tokenForUser(user){
  const timestamp = new Date().getTime();

  return jwt.encode({sub:user.id,iat:timestamp},config.secret);//user.id is a proxy for user._id which is generated by mongo
  //secret is combined with sub & iat to create token
}

module.exports = function(req,res,next){
  const userID = req.body.userID;//userID provided by auth0
  const name = req.body.name;
  const provider = req.body.provider;
  const query = provider +'.id';

NightlifeUser.findOne({[query]:userID},function(err,existingUser){

  if(err){
    return next(err);
  }
  if(existingUser){
     return res.send({token:tokenForUser(existingUser),id:existingUser._id});
     //if exists, give token back and id
  }
NightlifeUser.findOne({userName:name},function(err,existingUser){
  if(err){
    return next(err)
  }

  if(existingUser){
      existingUser[provider].id = userID;
      existingUser.save();
       return res.send({token:tokenForUser(existingUser),id:existingUser._id});
  }
  const nightlifeUser = new NightlifeUser({
    userName : name,
    [query]:userID
  })

  nightlifeUser.save(function(err){
    if(err){
      return next(err);
    }
    return res.send({token:tokenForUser(nightlifeUser),id:nightlifeUser._id})
  })
})
})
}
