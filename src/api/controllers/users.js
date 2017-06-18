/**
 * Created by Deebobo.dev on 10/06/2017.
 * copyright 2017 Deebobo.dev
 * See the COPYRIGHT file at the top-level directory of this distribution
 */
//const auth = require.main.require('../api/libs/auth');
const winston = require('winston');

/* GET users listing. */
module.exports.list = async function(req, res)
{
    try{
        let db = await req.app.get('plugins');
        db = db.db;
        let grps = await db.users.list(req.params.site);
        res.status(200).res.json(grps);
		winston.log("warning", "add check to see if user has admin rights");
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};


/* GET single page, if the requestor is allowed to see it. */
module.exports.getUser = async function(req, res) {
    let grp = null;
    try{
        let db = await req.app.get('plugins');
        db = db.db;
        grp = await db.users.find(req.params.user);
		res.status(200).json(grp);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};

/* create group. */
module.exports.create = async function(req, res) {
    try{
        let db = await req.app.get('plugins');
		db = db.db;
		let rec = req.body;
		let res = await db.users.add(rec);
		res.status(200).json(res);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};

module.exports.addToGrp = async function(req, res) {
    try{
        let db = await req.app.get('plugins');
		db = db.db;
		let res = await db.users.addGroup(req.params.user, req.params.group);
		res.status(200).json(res);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};

module.exports.removeFromGrp = async function(req, res) {
    try{
        let db = await req.app.get('plugins');
		db = db.db;
		let res = await db.users.removeGroup(req.params.user, req.params.group);
		res.status(200).json(res);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
};

module.exports.invite = async function(req, res){
	try{
        let plugins = await req.app.get('plugins');
		let db = db.db;
		let mailer = plugins.getMailHandlerFor(req.params.site);
		if(mailer){
			let template = await db.emailTemplates.find("invite", req.params.site);
			if(template)
				mailer.send(req.params.site, req.body.email, template.subject, template.body);
			else
				mailer.send(req.params.site, req.body.email, "invitation", "you have been invited to join the deebobo community.");
		}
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}

module.exports.resetPwd = async function(req, res){
}
