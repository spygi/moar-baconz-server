var Member = require('../models/member');
var geo = require('../utils/geo');


var memberController = {
	createMember: function(req, res){
		var member = new Member({
			email: req.body.email
		});
		member.password = member.generateHash(req.body.password)

		member.save(function(err) {
			if (err) {
				res.json({success: false, message: err.errmsg});
			} else {
				var result = {
					success: true,
					id: member.id,
					email: member.email,
					token: Member.generateToken(member)
				};
				
				res.json({ success: true, message: 'Member created', result: result });
			}
		});
	},
	getMember: function(req, res){
		Member.findById(req.params.id, function(err, member){
			if (err){
      			res.send(err);
      		}
      		if(!member){
      			res.json({success:false, message: "not found"});
      			return;
      		}

      		// lots of repeated code
      		member.populate("groups", function(err){
      			if (err){
      				res.send(err);
      			}
				var result = {
					success: true,
					id: member.id,
					email: member.email,
					token: Member.generateToken(member),
					nearbyStores: member.nearbyStores,
					groups: member.groups
				};
      			res.json(result);
      		});
			
		});
	},
	updateMember: function(req, res){
		Member.findById(req.params.id, function(err, member){
			if (err){
      			res.send(err);
      		}
      		if(!member){
      			res.json({success:false, message: "not found"});
      			return;
      		}
      		if(req.body.name){
      			member.name = req.body.name;
      		}
      		if(req.body.email){
      			member.email = req.body.email;
      		}
      		if(req.body.password){
      			member.password = req.body.password;
      		}
      		if(req.body.location && req.body.location.latitude && req.body.location.longitude){
      			member.location = req.body.location;
      			geo.getNearbyStores(member.location, function (places) {
					member.nearbyStores = places;

					return member.save(function(err){
      					if(err){
      						res.send(err);
      					}
      					// lots of repeated code
      					member.populate("groups", function(err){
      						if (err){	
      							res.send(err);
      						}
							var result = {
								success: true,
								id: member.id,
								email: member.email,
								token: Member.generateToken(member),
								nearbyStores: member.nearbyStores,
								groups: member.groups
							};
      						res.json(result);
      					});
      				});
				});
      		} else {
      			return member.save(function(err){
      				if(err){
      					res.send(err);
      				}
      				// lots of repeated code
      				member.populate("groups", function(err){
      					if (err){	
      						res.send(err);
      					}
						var result = {
							success: true,
							id: member.id,
							email: member.email,
							token: Member.generateToken(member),
							nearbyStores: member.nearbyStores,
							groups: member.groups
						};
      					res.json(result);
      				});
      			});
      		}
      		
		});
	}
}
module.exports = memberController;