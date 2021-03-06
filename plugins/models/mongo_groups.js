/**
 * Created by elastetic.dev on 25/05/2017.
 * copyright 2017 elastetic.dev
 * See the COPYRIGHT file at the top-level directory of this distribution
 */

/**@ignore */
const mongoose = require('mongoose');


class Groups{

    /**
     * @constructor
     * creates the collection that stores the group (authorisation) information
     * required fields:
     *  - name: the name of the group
     * 	- site: the site to which this group applies
     *  - level: the level of access that this group has. Can be one of the following values:
     *  	- admin: full access
     *		- edit: can edit views
     *		- view: can see views
     *		- public: items authorized with this view are publicly accessible.
     * 	- keys:
     *		- (unique) name - site
     */
    constructor(){
        let groupsSchema = new mongoose.Schema({
            name: {type: String },
            site: String,
            level: {type: String, enum: ['admin', 'edit', 'view', 'public']}
        });
        groupsSchema.index({ name: 1, site: 1}, {unique: true});        //make certain that email + site is unique in the system.
        this._groups = mongoose.model('groups', groupsSchema);
    }

	/**
     * adds a group to the db
     *
     * @param {Object} `group` details about the group. The object should contain the following fields:
	 *	- name: the name of the group. 
	 * 	- site: the site to which the group belongs
	 * 	- level: the level of access for the group
     * @return {Promise}] a promise to perform async operations with. The result of the promise is the record that
     * was added
     */
    add(group){
        let grp = new this._groups(group);
        return grp.save();
    }
	
	/**
     * updates a group
     *
     * @name .update()
     * @param {Object} `group` see add for more details
     * @return {Promise}] a promise to perform async operations with. The result of the promise is the record that
     * was added
     */
    update(group){
        return this._groups.findOneAndUpdate({"_id": group._id}, group).exec();
    }

	/** Returns all the groups for a particular site.
	* @param {string} `site` The name of the site to list the groups for.
	* @return {Promise}] a promise to perform async operations with. The result of the promise is the list of groups
	*/
    list(site){
        let query = this._groups.find({site: site});
        return query.exec();
    }

    /** Returns all the groups for a particular site.
     * @param {string} `site` The name of the site to list the groups for.
     * @param {string} `name` The name of the group to list the groups for.
     * @return {Promise}] a promise to perform async operations with. The result of the promise is the list of groups
     */
    find(site, name){
        let query = this._groups.findOne({site: site, name: name});
        return query.exec();
    }
	
	/** Returns all the groups for a particular site.
	* @param {string} `site` The name of the site to list the groups for.
	* @param {string} `level` The name of the level that the groups need to belong too..
	* @return {Promise}] a promise to perform async operations with. The result of the promise is the list of groups
	*/
    listForLevel(site, level){
        let query = this._groups.find({site: site, level: level});
        return query.exec();
    }
}

module.exports = Groups;