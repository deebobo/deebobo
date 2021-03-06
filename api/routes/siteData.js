/**
 * Created by elastetic.dev on 26/05/2017.
 * copyright 2017 elastetic.dev
 * See the COPYRIGHT file at the top-level directory of this distribution
 */

const express = require('express');
const winston = require('winston');
let router = express.Router({mergeParams: true});
const ctrlSiteData = require.main.require('../api/controllers/siteData');

router.get('/:plugin',ctrlSiteData.get);
router.post('/:plugin',ctrlSiteData.post);
router.put('/:plugin', ctrlSiteData.put);


module.exports = router;
