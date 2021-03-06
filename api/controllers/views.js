/**
 * Created by elastetic.dev on 10/06/2017.
 * copyright 2017 elastetic.dev
 * See the COPYRIGHT file at the top-level directory of this distribution
 */
const auth = require.main.require('../api/libs/auth');
const winston = require('winston');

/* GET views listing that the current user is allowed to see. */
module.exports.get = async function(req, res)
{
    try{
        let db = await req.app.get('plugins');
        db = db.db;
        let views = await db.views.list(req.params.site);
        let allowed = [];
        for(let item of views){
            if(auth.allowed(item.groups, req.user.groups))
                allowed.push(item);
            else
                return;                                                     //something was not allowed, error message has been set by auth
        }
        res.status(200).json(allowed);
    }
    catch(err){
        winston.log("error", err);
        res.status(500).json({message:err.message});
    }
};

/* GET single view, if the requestor is allowed to see it. */
module.exports.getview = async function(req, res) {
    let view = null;
    try{
        let db = await req.app.get('plugins');
        db = db.db;
        view = await db.views.findByName(req.params.view, req.params.site);
        if(view) {
            if (auth.allowed(view.groups, req.user.groups, res))         //auth will set the error message in res if there is a problem.
                res.status(200).json(view);
        }
        else
            res.status(404).json({message: "record not found"});
    }
    catch(err){
        winston.log("error", err);
        res.status(500).json({message:err.message});
    }
};

/* GET views listing. */
module.exports.create = async function(req, res) {
    try{
        if(auth.canWrite(req.user.groups, res)){                //auth will set the error message in res if there is a problem.
            let db = await req.app.get('plugins');
            db = db.db;
            let rec = req.body;
            rec.site = req.params.site;
            let res = await db.views.add(rec);
            res.status(200).json(res);
        }
    }
    catch(err){
        winston.log("error", err);
        res.status(500).json({message:err.message});
    }
};

/* GET views listing. */
module.exports.update = async function(req, res) {
    try{
        if(auth.canWrite(req.user.groups, res)){                //auth will set the error message in res if there is a problem.
            let db = await req.app.get('plugins');
            db = db.db;
            let rec = req.body;
			rec.name = req.params.view;							//make certain taht the id is filled in
            rec.site = req.params.site
            let newRec = await db.views.update(rec);
            res.status(200).json(newRec);
        }
    }
    catch(err){
        winston.log("error", err);
        res.status(500).json({message:err.message});
    }
};

/* delete view. */
module.exports.delete = async function(req, res) {
    try{
        if(auth.canWrite(req.user.groups, res)){                //auth will set the error message in res if there is a problem.
            let db = await req.app.get('plugins');
            db = db.db;
            let newRec = await db.views.delete(req.params.view, req.params.site);
            res.status(200).json(newRec);
        }
    }
    catch(err){
        winston.log("error", err);
        res.status(500).json({message:err.message});
    }
};