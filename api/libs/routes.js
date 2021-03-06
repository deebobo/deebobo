/**
 * Created by elastetic.dev on 25/05/2017.
 * copyright 2017 elastetic.dev
 * See the COPYRIGHT file at the top-level directory of this distribution
 */

const winston = require('winston');

const appAuth =         require('../routes/app_authentication');
const users =           require('../routes/users');
const groups =          require('../routes/groups');
const auth =            require('../routes/site_authentication');
const sites =           require('../routes/sites');
const plugins =         require('../routes/plugins');
const pages =           require('../routes/pages');
const views =           require('../routes/views');
const index =           require('../routes/index');
const connections =     require('../routes/connections');
const connectionData =  require('../routes/connectionData');
const emailTemplates =  require('../routes/email_templates');
const verifiedsite =    require('../routes/verifiedsite');
const siteData  =       require('../routes/siteData');
//const devices =  require('../routes/devices');
const functions =       require('../routes/functions');
const express =         require('express');
const install =         require('../routes/install');

let router = express.Router({mergeParams: true});

function initPaths(app, passport) {
    app.use('/', index);
	app.use('/install', install);
    app.use('/api', appAuth);
	app.use('/api/site', sites);
    app.use(router.use('/api/site/:site', auth));

    app.use(router.use('/api/site/:site', passport.authenticate('jwt', { session: false }), verifiedsite));
    app.use(router.use('/api/site/:site/data', passport.authenticate('jwt', { session: false }), siteData));

    app.use(router.use('/api/user', passport.authenticate('jwt', { session: false }), users));
    app.use(router.use('/api/site/:site/user', passport.authenticate('jwt', { session: false }), users));

    app.use(router.use('/api/site/:site/group', passport.authenticate('jwt', { session: false }), groups));
	app.use(router.use('/api/site/:site/plugin', passport.authenticate('jwt', { session: false }), plugins));
    app.use(router.use('/api/site/:site/page', passport.authenticate('jwt', { session: false }), pages));
	app.use(router.use('/api/site/:site/view', passport.authenticate('jwt', { session: false }), views));
    app.use(router.use('/api/site/:site/connection', passport.authenticate('jwt', { session: false }), connections));
    app.use(router.use('/api/site/:site/connection/:connection/data', passport.authenticate('jwt', { session: false }), connectionData));
	app.use(router.use('/api/site/:site/templates/email', passport.authenticate('jwt', { session: false }), emailTemplates));
    //app.use(router.use('/api/site/:site/connection/:connection/device', passport.authenticate('jwt', { session: false }), devices));
    app.use(router.use('/api/site/:site/function', passport.authenticate('jwt', { session: false }), functions));


	//catch all for invalid api calls
	app.use("/api/*", function(req, res){
        res.status(404).json({message:"invalid request"});
    });

    // catch 404 and forward to main app
    app.use(function(req, res) {
        res.render('index', { title: 'elastetic' });
    });

    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        winston.log("error", err);
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
}

module.exports = initPaths;