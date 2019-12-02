const express = require('express');
const router = express.Router();
const connection = require('../config/db_config');
const db = connection.getConnection();
const request = require('request');
var moment = require('moment');
const flash = require('connect-flash');
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const loginAuthentica = require('./login_auth.js');
const controller = require('./controller');
/* READING THE SETTINGS FILE */
var jscontent = fs.readFileSync(process.cwd() + "/public/settings.json");
var jsonContent = JSON.parse(jscontent);
var path = jsonContent.path;
var baseurl = jsonContent.url;
router.get('/logout', controller.logout);
router.get('/', controller.indexpage);
router.post('/', controller.indexpost);
router.get('/mgt_dashboard', controller.dashboard);
router.post('/UE_search', controller.uesearch);
router.get('/amfadd', controller.addamf);
router.get('/smfadd', controller.smfadd);
router.get('/amfdisplay', controller.listamf);
router.get('/smfdisplay', controller.listsmf);
router.get('/startamf/(:id)', controller.amfStart);
router.get('/edit_amf/(:id)', controller.editAmf);
router.get('/del_amf/(:id)', controller.deleteAmf);
router.get('/startsmf/(:id)', controller.smfStart);
router.get('/edit_smf/(:id)', controller.editSmf);
router.get('/del_smf/(:id)', controller.deleteSmf);
router.get('/amfbinary', controller.core);
router.get('/smfembmsbinary', controller.smfMbms);
router.get('/bmscapi', controller.xmb);
router.get('/schedule', controller.sessionSchedule);
router.get('/services', controller.mbmsServices);
router.get('/addservices', controller.createService);
router.get('/deleteServ/:id', controller.deleteService);
router.get('/services/(:id)/sessions', controller.addSessions);
router.get('/services/(:id)/vsessions', controller.viewsessions);
router.get('/delete-session/:ser_res_id/:id', controller.deletesession);
router.get('/downloadSMFconfig/:id', controller.smfconfig);
router.get('/add_pdn_subscription', controller.user);
router.get('/display_pdn_subsc', controller.listusers);
router.get('/edit_pdn_subs/:imsi', controller.editusers);
router.get('/delpdn_subs/:id', controller.deleteusers);
router.get('/operator', controller.addoperator);
router.get('/display_operator', controller.listoperator);
router.get('/edit_operator/(:mnc/:mcc)', controller.editoperator);
router.get('/del_operator/:id', controller.deleteoperator);
router.get('/viewconfig', controller.listeNB);
router.get('/modifyconfig/:id', controller.modifyeNB);
router.get('/deleteconfig/:id', controller.deleteNB);
router.get('/downloadconfig/:id', controller.amfconfig);

/* adding values to the db */
router.post('/amfadd', [
    check('name').isLength({ min: 2 }).withMessage('Error! The name field should not empty !').trim(),
    check('s1_addr_ipv4').isIP(4).withMessage('Error! s1_adr should be valid IPv4').trim(),
    check('s1_addr_ipv6').isIP(6).withMessage('Error! s1_adr_ipv6 should be valid IPv6').trim(),
    check('smf_s11_addr_ipv4').isIP(4).withMessage('Error! smf_s11_adr should be valid IPv4').trim(),
    check('smf_s11_addr_ipv6').isIP(6).withMessage('Error! smf_s11_adr should be valid IPv6').trim(),
    check('s11_addr_ipv4').isIP(4).withMessage('Error! s11_addr_ipv4 should be valid IPv4').trim(),
    check('s11_addr_ipv6').isIP(6).withMessage('Error! s11_addr_ipv6 should be valid IPv6').trim(),
    check('mmec').isInt().withMessage('Error! mmec should be Integer value').trim(),
    check('mmegi').isInt().withMessage('Error! mmegi should be Integer value').trim(),
    check('mcc').isLength({ min: 3, max: 3 }).withMessage('Error! The length of mcc should be 3 !').isInt({ min: 100, max: 999 }).withMessage('Error! mcc should be integer value!').trim(),
    check('mnc').isLength({ min: 2, max: 3 }).withMessage('Error! The length of mnc should be 2 or 3 !').trim(),
    check('s10_addr_ipv4').isIP(4).withMessage('Error! s10_addr_ipv4 should be valid IPv4').trim(),
    check('s10_mcc').isLength({ min: 3, max: 3 }).withMessage('Error! The length of mcc should be 3 !').isInt({ min: 100, max: 999 }).withMessage('Error! mcc should be integer value!').trim(),
    check('s10_mnc').isLength({ min: 2, max: 3 }).withMessage('Error! The length of mnc should be 2 or 3 !').trim(),
    check('s10_mmec').isInt().withMessage('Error! mmec should be Integer value').trim(),
    check('s10_mmegi').isInt().withMessage('Error! mmegi should be Integer value').trim(),
    check('s10_rem_addr_ipv4').isIP(4).withMessage('Error! s10_addr_ipv4 should be valid IPv4').trim(),
    check('s11u_addr_ipv4').isIP(4).withMessage('Error! s11u_addr_ipv4 should be valid IPv4').trim(),
    check('m3_addr_ipv4').isIP(4).withMessage('Error! m3_addr should be valid IPv4').trim()

], function (req, res, next) {

    var errors = validationResult(req);
    var amf4g = {
        name: req.body.name,
        s1_addr_ipv4: req.body.s1_addr_ipv4,
        s1_addr_ipv6: req.body.s1_addr_ipv6,
        m3_addr_ipv4: req.body.m3_addr_ipv4,
        m3_addr_ipv6: req.body.m3_addr_ipv6,
        smf_s11_addr_ipv4: req.body.smf_s11_addr_ipv4,
        smf_s11_addr_ipv6: req.body.smf_s11_addr_ipv6,
        s11_addr_ipv4: req.body.s11_addr_ipv4,
        s11_addr_ipv6: req.body.s11_addr_ipv6,
        sm_addr_ipv4: req.body.sm_addr_ipv4,
        mmec: req.body.mmec,
        mmegi: req.body.mmegi,
        mcc: req.body.mcc,
        mnc: req.body.mnc,
        s11u_addr_ipv4: req.body.s11u_addr_ipv4,
        s10_addr_ipv4: req.body.s10_addr_ipv4,
        mysql_host: req.body.mysql_host,
        mysql_db_name: req.body.mysql_db_name,
        mysql_user_name: req.body.mysql_user_name,
        mysql_password: req.body.mysql_password,
        diam_config_file_path: req.body.diam_config_file_path,
        diam_hss_host_name: req.body.diam_hss_host_name,
        diam_hss_realm: req.body.diam_hss_realm,
        auth_data_path: req.body.auth_data_path,
        auth_srv_ip: req.body.auth_srv_ip,
        tracking_area_list1: req.body.tracking_area_list1a + "," + req.body.tracking_area_list1b + "," + req.body.tracking_area_list1c + "," + req.body.tracking_area_list1d + "," + req.body.tracking_area_list1e,
        tracking_area_list2: req.body.tracking_area_list2a + "," + req.body.tracking_area_list2b + "," + req.body.tracking_area_list2c + "," + req.body.tracking_area_list2d + "," + req.body.tracking_area_list2e,
        tracking_area_list3: req.body.tracking_area_list3a + "," + req.body.tracking_area_list3b + "," + req.body.tracking_area_list3c + "," + req.body.tracking_area_list3d + "," + req.body.tracking_area_list3e,
        periodic_tau_timer: req.body.periodic_tau_timer,
        s10_mcc: req.body.s10_mcc,
        s10_mnc: req.body.s10_mnc,
        s10_mmec: req.body.s10_mmec,
        s10_mmegi: req.body.s10_mmegi,
        s10_rem_addr_ipv4: req.body.s10_rem_addr_ipv4,
        amf_state: 0
    };
    var amf5g = {
        name: req.body.name,
        ng_addr_ipv4: req.body.ng_addr_ipv4,
        smf_n11_addr_ipv4: req.body.smf_n11_addr_ipv4,
        smf_n11_addr_ipv6: "",
        n11_addr_ipv4: req.body.n11_addr_ipv4,
        n11_addr_ipv6: "",
        mcc: req.body.mcc_5g,
        mnc: req.body.mnc_5g,
        amf_region_id: req.body.amf_region_id,
        amf_set_id: req.body.amf_set_id,
        amf_pointer: req.body.amf_pointer,
        mysql_host: req.body.mysql_host,
        mysql_db_name: req.body.mysql_db_name,
        mysql_user_name: req.body.mysql_user_name,
        mysql_password: req.body.mysql_password,
        auth_data_path: req.body.auth_data_path,
        auth_srv_ip: req.body.auth_srv_ip,
        periodic_tau_timer: req.body.periodic_tau_timer_5g,
        tracking_area_list: req.body.tracking_area_list,
        amf_state: 0
    };

    if (!errors.isEmpty()) {
        res.render('pages/amfadd', { message: '', error: errors.array(), amf: amf4g, amf5: amf5 });
    }
    // insert the user input values to the mysql database
    else {
        var mmeQuery = "INSERT INTO amf_settings SET ?";
        var amfQuery = "INSERT INTO five_g_amf_settings SET ?";
        db.query(mmeQuery, [amf4g], function (err, doc) {
            if (err) {
                //console.log(err.sqlMessage);
                res.render('pages/amfadd', { message: err.sqlMessage, error: {}, amf: amf4g });

            }
            else {

                db.query(amfQuery, [amf5g], function (err, amf5, fields) {
                    if (err) {
                        //console.log(err.sqlMessage);
                        res.render('pages/amfadd', { message: err.sqlMessage, error: {}, amf: amf4g });
                    }
                    else {
                        req.flash('info', 'CONFIGURATION SUCCESSFULLY SAVED');
                        res.redirect('/amfdisplay');
                    }
                });

            }
        });
    }
})
/* edit amf entries */
router.post('/edit_amf/(:id)', [
    check('name').isLength({ min: 2 }).withMessage('Error! The name field should not empty !').trim(),
    check('s1_addr_ipv4').isIP(4).withMessage('Error! s1_adr should be valid IPv4').trim(),
    check('s1_addr_ipv6').isIP(6).withMessage('Error! s1_adr_ipv6 should be valid IPv6').trim(),
    check('smf_s11_addr_ipv4').isIP(4).withMessage('Error! smf_s11_adr should be valid IPv4').trim(),
    check('smf_s11_addr_ipv6').isIP(6).withMessage('Error! smf_s11_adr should be valid IPv6').trim(),
    check('s11_addr_ipv4').isIP(4).withMessage('Error! s11_addr_ipv4 should be valid IPv4').trim(),
    check('s11_addr_ipv6').isIP(6).withMessage('Error! s11_addr_ipv6 should be valid IPv6').trim(),
    check('mmec').isInt().withMessage('Error! mmec should be Integer value').trim(),
    check('mmegi').isInt().withMessage('Error! mmegi should be Integer value').trim(),
    check('mcc').isLength({ min: 3, max: 3 }).withMessage('Error! The length of mcc should be 3 !').isInt({ min: 100, max: 999 }).withMessage('Error! mcc should be integer value!').trim(),
    check('mnc').isLength({ min: 2, max: 3 }).withMessage('Error! The length of mnc should be 2 or 3 !').trim(),
    check('s10_addr_ipv4').isIP(4).withMessage('Error! s10_addr_ipv4 should be valid IPv4').trim(),
    //check('tracking_area_list').isInt().withMessage('Error! tracking_area_list should be valid Integer number').trim(),
    check('s10_mcc').isLength({ min: 3, max: 3 }).withMessage('Error! The length of mcc should be 3 !').isInt({ min: 100, max: 999 }).withMessage('Error! mcc should be integer value!').trim(),
    check('s10_mnc').isLength({ min: 2, max: 3 }).withMessage('Error! The length of mnc should be 2 or 3 !').trim(),
    check('s10_mmec').isInt().withMessage('Error! mmec should be Integer value').trim(),
    check('s10_mmegi').isInt().withMessage('Error! mmegi should be Integer value').trim(),
    check('s10_rem_addr_ipv4').isIP(4).withMessage('Error! s10_addr_ipv4 should be valid IPv4').trim(),
    check('s11u_addr_ipv4').isIP(4).withMessage('Error! s11u_addr_ipv4 should be valid IPv4').trim(),
    check('m3_addr_ipv4').isIP(4).withMessage('Error! m3_addr should be valid IPv4').trim()
], function (req, res, next) {
    var id = req.params.id;
    //console.log(id);
    var errors = validationResult(req);
    var edit_amf4g = {
        name: req.body.name,
        s1_addr_ipv4: req.body.s1_addr_ipv4,
        s1_addr_ipv6: req.body.s1_addr_ipv6,
        m3_addr_ipv4: req.body.m3_addr_ipv4,
        m3_addr_ipv6: req.body.m3_addr_ipv6,
        smf_s11_addr_ipv4: req.body.smf_s11_addr_ipv4,
        smf_s11_addr_ipv6: req.body.smf_s11_addr_ipv6,
        s11_addr_ipv4: req.body.s11_addr_ipv4,
        s11_addr_ipv6: req.body.s11_addr_ipv6,
        sm_addr_ipv4: req.body.sm_addr_ipv4,
        mmec: req.body.mmec,
        mmegi: req.body.mmegi,
        mcc: req.body.mcc,
        mnc: req.body.mnc,
        s11u_addr_ipv4: req.body.s11u_addr_ipv4,
        s10_addr_ipv4: req.body.s10_addr_ipv4,
        mysql_host: req.body.mysql_host,
        mysql_db_name: req.body.mysql_db_name,
        mysql_user_name: req.body.mysql_user_name,
        mysql_password: req.body.mysql_password,
        diam_config_file_path: req.body.diam_config_file_path,
        diam_hss_host_name: req.body.diam_hss_host_name,
        diam_hss_realm: req.body.diam_hss_realm,
        auth_data_path: req.body.auth_data_path,
        auth_srv_ip: req.body.auth_srv_ip,
        tracking_area_list1: req.body.tracking_area_list1a + "," + req.body.tracking_area_list1b + "," + req.body.tracking_area_list1c + "," + req.body.tracking_area_list1d + "," + req.body.tracking_area_list1e,
        tracking_area_list2: req.body.tracking_area_list2a + "," + req.body.tracking_area_list2b + "," + req.body.tracking_area_list2c + "," + req.body.tracking_area_list2d + "," + req.body.tracking_area_list2e,
        tracking_area_list3: req.body.tracking_area_list3a + "," + req.body.tracking_area_list3b + "," + req.body.tracking_area_list3c + "," + req.body.tracking_area_list3d + "," + req.body.tracking_area_list3e,
        periodic_tau_timer: req.body.periodic_tau_timer,
        s10_mcc: req.body.s10_mcc,
        s10_mnc: req.body.s10_mnc,
        s10_mmec: req.body.s10_mmec,
        s10_mmegi: req.body.s10_mmegi,
        s10_rem_addr_ipv4: req.body.s10_rem_addr_ipv4,
        amf_state: "0"
    };
    var edit_amf5g = {
        name: req.body.name,
        ng_addr_ipv4: req.body.ng_addr_ipv4,
        smf_n11_addr_ipv4: req.body.smf_n11_addr_ipv4,
        smf_n11_addr_ipv6: "::1",
        n11_addr_ipv4: req.body.n11_addr_ipv4,
        n11_addr_ipv6: "::1",
        mcc: req.body.mcc_5g,
        mnc: req.body.mnc_5g,
        amf_region_id: req.body.amf_region_id,
        amf_set_id: req.body.amf_set_id,
        amf_pointer: req.body.amf_pointer,
        mysql_host: req.body.mysql_host,
        mysql_db_name: req.body.mysql_db_name,
        mysql_user_name: req.body.mysql_user_name,
        mysql_password: req.body.mysql_password,
        auth_data_path: req.body.auth_data_path,
        auth_srv_ip: req.body.auth_srv_ip,
        periodic_tau_timer: req.body.periodic_tau_timer_5g,
        tracking_area_list: req.body.tracking_area_list_5g,
        amf_state: "0"
    };

    if (!errors.isEmpty()) {
        //console.log('Here is the error!');
        res.render('pages/edit_amf', { message: '', error: errors.array(), edit_data: edit_amf4g });
    }
    else {
        var mmeUpdate = "UPDATE amf_settings SET ? WHERE name=?; UPDATE five_g_amf_settings SET ? WHERE name= ?";

        db.query(mmeUpdate, [edit_amf4g, id, edit_amf5g, id], function (err, row, fields) {
            if (err) {
                console.log('Error encountered', err.sqlMessage);
                //res.redirect('/amfdisplay');
                res.render('pages/edit_amf', { message: err.sqlMessage, error: {}, edit_data: edit_amf4g, Ta: "" });
            }
            else {
                //console.log('successfully saved');
                req.flash('info','SUCCESSFULLY UPDATED!');
                res.redirect('/amfdisplay');
            }

        });
    }
})

/* adding smf entries */
router.post('/smfadd', [
    check('name').isLength({ min: 2 }).withMessage('ERROR NAME SHOULD NOT BE EMPTY!').trim(),
    check('s11_addr_ipv4').isIP(4).withMessage('ERROR! S11 ADDRESS SHOULD BE VALID IPv4').trim(),
    check('amf_s11_addr_ipv4').isIP(4).withMessage('ERROR! AMF S11 ADDRESS SHOULD BE VALID IPv4').trim(),
    check('upf_s5_addr_ipv4').isIP(4).withMessage('ERROR!, UPF S5 ADDRESS SHOULD BE VALID IPv4').trim(),
    check('upf_s5_port').isInt().withMessage('ERROR! PORT NUMBER SHOULD BE POSITIVE INTEGER!').trim(),
    check('s5_addr_ipv4').isIP(4).withMessage('ERROR S5 ADDRESS SHOULD BE VALID IPv4 ADDRESS!').trim(),
    check('s5_port').isInt().withMessage('ERROR! PORT NUMBER SHOULD BE POSITIVE INTEGER!').trim(),
    check('s1u_uplink_addr_ipv4').isIP(4).withMessage('ERROR S1U UPLINK ADDRESS SHOULD BE VALID IPv4').trim(),
    check('sgmb_addr_ipv4').isIP(4).withMessage('ERROR!, SGMB ADDRESS SHOULFD BE VALID IPv4 ADDRESS').trim(),
    check('ue_addr_ipv4_pool_start').isIP(4).withMessage('ERROR! UE ADDRESS POOL SHOULD BE VALID IPv4').trim(),
    check('dns_addr_ipv4').isIP(4).withMessage('ERROR! DNS ADDRESS POOL SHOULD BE VALID IPv4').trim(),
    check('iot_upf_user_plane_addr_ipv4').isIP(4).withMessage('ERROR! IoT UPF USER PLANE SHOULD BE VALID IPv4').trim(),
    check('iot_upf_s5_addr_ipv4').isIP().withMessage('ERROR! IoT UPF S5 ADDRESS SHOULD BE VALID IPv4').trim(),
    check('iot_upf_s5_port').isInt().withMessage('ERROR! PORT NUMBER SHOULD BE POSITIVE INTEGER!').trim(),
    check('iot_upf_apn').isLength({ min: 2 }).withMessage('ERROR APN SHOULD NOT BE EMPTY!').trim(),
    check('mysql_host').isLength({ min: 3 }).withMessage('ERROR HOST SHOULD NOT BE EMPTY!').trim(),
    check('mysql_db_name').isLength({ min: 3 }).withMessage('ERROR DATABASE NAME SHOULD NOT BE EMPTY!').trim(),
    check('mysql_user_name').isLength({ min: 3 }).withMessage('ERROR USER NAME SHOULD NOT BE EMPTY!').trim(),
    check('mysql_password').isLength({ min: 2 }).withMessage('ERROR DATABASE PASSWORD SHOULD NOT BE EMPTY!').trim()
], function (req, res, next) {
    //console.log('this is for amf user entries page');
    // create a variable to hold all the user input datas
    var errors = validationResult(req);
    var smf = {
        name: req.body.name,
        s11_addr_ipv4: req.body.s11_addr_ipv4,
        s11_addr_ipv6: req.body.s11_addr_ipv6,
        amf_s11_addr_ipv4: req.body.amf_s11_addr_ipv4,
        amf_s11_addr_ipv6: req.body.amf_s11_addr_ipv6,
        upf_s5_addr_ipv4: req.body.upf_s5_addr_ipv4,
        upf_s5_port: req.body.upf_s5_port,
        s5_addr_ipv4: req.body.s5_addr_ipv4,
        s5_port: req.body.s5_port,
        s1u_uplink_addr_ipv4: req.body.s1u_uplink_addr_ipv4,
        sgmb_addr_ipv4: req.body.sgmb_addr_ipv4,
        sgmb_port: req.body.sgmb_port,
        sm_addr_ipv4: req.body.sm_addr_ipv4,
        amf_sm_addr_ipv4: req.body.amf_sm_addr_ipv4,
        ue_addr_ipv4_pool_start: req.body.ue_addr_ipv4_pool_start,
        dns_addr_ipv4: req.body.dns_addr_ipv4,
        iot_upf_user_plane_addr_ipv4: req.body.iot_upf_user_plane_addr_ipv4,
        iot_upf_s5_addr_ipv4: req.body.iot_upf_s5_addr_ipv4,
        iot_upf_s5_port: req.body.iot_upf_s5_port,
        iot_upf_apn: req.body.iot_upf_apn,
        mysql_host: req.body.mysql_host,
        mysql_db_name: req.body.mysql_db_name,
        mysql_user_name: req.body.mysql_user_name,
        mysql_password: req.body.mysql_password,
        smf_state: "0"

    };
    if (!errors.isEmpty()) {
        res.render('pages/smfadd', { message: '', error: errors.array(), smf: smf });
    }
    else {
        db.query('INSERT INTO smf_settings SET ?', smf, function (err, smf_data) {
            if (err) {
                //console.log('Error encointered',err.sqlMessage);
                res.render('pages/smfadd', { message: err.sqlMessage, error: {}, smf: smf });
            }
            else {
                //console.log('data successfully saved');
                req.flash('info','DATA SUCCESSFULLY SAVED!');
                res.redirect('/smfdisplay');
            }

        });
    }
})

/* editing smf entries */
router.post('/edit_smf/(:id)', [
    check('name').isLength({ min: 2 }).withMessage('ERROR NAME SHOULD NOT BE EMPTY!').trim(),
    check('s11_addr_ipv4').isIP(4).withMessage('ERROR! S11 ADDRESS SHOULD BE VALID IPv4').trim(),
    check('amf_s11_addr_ipv4').isIP(4).withMessage('ERROR! AMF S11 ADDRESS SHOULD BE VALID IPv4').trim(),
    check('upf_s5_addr_ipv4').isIP(4).withMessage('ERROR!, UPF S5 ADDRESS SHOULD BE VALID IPv4').trim(),
    check('upf_s5_port').isInt().withMessage('ERROR! PORT NUMBER SHOULD BE POSITIVE INTEGER!').trim(),
    check('s5_addr_ipv4').isIP(4).withMessage('ERROR S5 ADDRESS SHOULD BE VALID IPv4 ADDRESS!').trim(),
    check('s5_port').isInt().withMessage('ERROR! PORT NUMBER SHOULD BE POSITIVE INTEGER!').trim(),
    check('s1u_uplink_addr_ipv4').isIP(4).withMessage('ERROR S1U UPLINK ADDRESS SHOULD BE VALID IPv4').trim(),
    check('sgmb_addr_ipv4').isIP(4).withMessage('ERROR!, SGMB ADDRESS SHOULFD BE VALID IPv4 ADDRESS').trim(),
    check('ue_addr_ipv4_pool_start').isIP(4).withMessage('ERROR! UE ADDRESS POOL SHOULD BE VALID IPv4').trim(),
    check('dns_addr_ipv4').isIP(4).withMessage('ERROR! DNS ADDRESS POOL SHOULD BE VALID IPv4').trim(),
    check('iot_upf_user_plane_addr_ipv4').isIP(4).withMessage('ERROR! IoT UPF USER PLANE SHOULD BE VALID IPv4').trim(),
    check('iot_upf_s5_addr_ipv4').isIP().withMessage('ERROR! IoT UPF S5 ADDRESS SHOULD BE VALID IPv4').trim(),
    check('iot_upf_s5_port').isInt().withMessage('ERROR! PORT NUMBER SHOULD BE POSITIVE INTEGER!').trim(),
    check('iot_upf_apn').isLength({ min: 2 }).withMessage('ERROR APN SHOULD NOT BE EMPTY!').trim(),
    check('mysql_host').isLength({ min: 3 }).withMessage('ERROR HOST SHOULD NOT BE EMPTY!').trim(),
    check('mysql_db_name').isLength({ min: 3 }).withMessage('ERROR DATABASE NAME SHOULD NOT BE EMPTY!').trim(),
    check('mysql_user_name').isLength({ min: 3 }).withMessage('ERROR USER NAME SHOULD NOT BE EMPTY!').trim(),
    check('mysql_password').isLength({ min: 2 }).withMessage('ERROR DATABASE PASSWORD SHOULD NOT BE EMPTY!').trim()

], function (req, res, next) {
    var id = req.params.id;
    //console.log('the id is',id);
    var errors = validationResult(req);
    var edit_smf = {
        name: req.body.name,
        s11_addr_ipv4: req.body.s11_addr_ipv4,
        s11_addr_ipv6: req.body.s11_addr_ipv6,
        amf_s11_addr_ipv4: req.body.amf_s11_addr_ipv4,
        amf_s11_addr_ipv6: req.body.amf_s11_addr_ipv6,
        upf_s5_addr_ipv4: req.body.upf_s5_addr_ipv4,
        upf_s5_port: req.body.upf_s5_port,
        s5_addr_ipv4: req.body.s5_addr_ipv4,
        s5_port: req.body.s5_port,
        s1u_uplink_addr_ipv4: req.body.s1u_uplink_addr_ipv4,
        sgmb_addr_ipv4: req.body.sgmb_addr_ipv4,
        sgmb_port: req.body.sgmb_port,
        sm_addr_ipv4: req.body.sm_addr_ipv4,
        amf_sm_addr_ipv4: req.body.amf_sm_addr_ipv4,
        ue_addr_ipv4_pool_start: req.body.ue_addr_ipv4_pool_start,
        dns_addr_ipv4: req.body.dns_addr_ipv4,
        iot_upf_user_plane_addr_ipv4: req.body.iot_upf_user_plane_addr_ipv4,
        iot_upf_s5_addr_ipv4: req.body.iot_upf_s5_addr_ipv4,
        iot_upf_s5_port: req.body.iot_upf_s5_port,
        iot_upf_apn: req.body.iot_upf_apn,
        mysql_host: req.body.mysql_host,
        mysql_db_name: req.body.mysql_db_name,
        mysql_user_name: req.body.mysql_user_name,
        mysql_password: req.body.mysql_password,
        smf_state: "0"
    }
    if (!errors.isEmpty()) {
        res.render('pages/edit_smf', { message: '', error: errors.array(), smfdata: edit_smf });
    }
    else {
        db.query('UPDATE smf_settings SET ? WHERE name = ?', [edit_smf, id], function (err, data, fields) {
            if (err) {
                console.log('Error', err);
                res.render('pages/edit_smf', { message: err.sqlMessage, error: {}, smfdata: edit_smf });
            }
            else {
                //console.log('smf data successfully updated');
                req.flash('info','DATA SUCCESSFULLY UPDATED!!');
                res.redirect('/smfdisplay');
            }
        });
    }
});
/* editing the mbms service */
router.post('/modify-service/:id', [
    check("service-class").isLength({ min: 1 }).withMessage('Error! Service class should not be empty !').trim().escape(),
    check("service-names").isLength({ min: 1 }).withMessage('Error! Service names should not be empty !').trim().escape(),
    check("service-announcement-mode").isLength({ min: 1 }).withMessage('Error! service-announcement-mode should not be empty !').trim().escape()

], function (req, res) {
    console.log('the id is' + req.params.id);
    var id = req.params.id;
    var modified_entries = {
        "service-id": id,
        "service-class": req.body["service-class"],
        "service-languages": ['' + req.body["service-languages"] + ''],
        "service-names": ['' + req.body["service-names"] + ''],
        "service-announcement-mode": req.body["service-announcement-mode"]
    };
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('pages/modify-service', { data: modified_entries, error: errors.array() });
    }
    else {
        var urlContent = fs.readFileSync(process.cwd() + "/public/settings.json");
        var jsonContent = JSON.parse(urlContent);
        var urladd = baseurl + '/xmb/v1.0/services/';
        //console.log('The base url in post');
        //console.log(baseurl+id);
        request.patch({
            url: urladd + id,
            body: JSON.stringify(modified_entries),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }, function (err, response, body) {
            if (err) {
                console.log('Error!', err);

                //res.render('pages/services',{data:{}});
                res.redirect('/services');
            }
            else {
                res.redirect('/services');
            }            

        });
    }

});
/* adding moified sessions */
router.post('/modifysessions/:servid/:ses_id', [
    check("max-bitrate").isInt({ min: 0 }).withMessage("Error! max bit rate should be a positive integer!"),
    check("session-type").isAlpha().withMessage("Error! Session type should be alphabetic!"),
    //check("file-url").isURL().withMessage('Error!Not valid URL!')
], function (req, res) {
    var service_res_id = req.params.servid;
    var session_res_id = req.params.ses_id;
    var urlContent = fs.readFileSync(process.cwd() + "/public/settings.json");
    var jsonContent = JSON.parse(urlContent);
    var baseurl = jsonContent.url + '/xmb/v1.0/services/';
    var errors = validationResult(req);

    //validate the input values and return back to modify page in case of an error.

    var validate_input = {
        'start': req.body["session-start"],
        'end': req.body["session-stop"],//parseInt(req.body['session-stop'],10),
        'max_bitrate': req.body['max-bitrate'],
        'session_type': req.body['session-type'],
        'session-state': 'Session Idle',
        //'ingest-mode':req.body['ingest-mode'],
        //'file_url':req.body['file-url']

    }
    if (!errors.isEmpty()) {
        //console.log('Error happening for the user input!!');

        res.render('pages/modifysessions', { data: validate_input, error: errors.array(), msg: '', servid: service_res_id, ses_id: session_res_id });
    }
    else {
        if (moment(req.body['session-start'], "YYYY-MM-DDTHH:mm:ss", true).isValid() && moment(req.body["session-stop"], "YYYY-MM-DDTHH:mm:ss", true).isValid()) {

            console.log("Data validation successfully completed!!");
            var start = new Date(req.body["session-start"]);
            var stop = new Date(req.body["session-stop"]);
            var start_time = start.getTime() / 1000;
            var stop_time = stop.getTime() / 1000;
            var session_update = {
                'session-start': start_time,
                'session-stop': stop_time,//parseInt(req.body['session-stop'],10),
                'max-bitrate': parseInt(req.body['max-bitrate'], 10),
                'session-type': req.body['session-type'],
                'session-state': 'Session Idle',
                // 'file-session':{
                //     'ingest-mode':req.body['ingest-mode'],
                //     'file-list':[{
                //       'file-url':req.body['file-url']
                //     }]
                // }
            }

            console.log(session_update);
            request.patch({
                url: baseurl + service_res_id + '/sessions/' + session_res_id + '',
                body: JSON.stringify(session_update),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"

                }
            }, function (err, response, body) {

                if (err) {
                    console.log('statusCode:', err.code);
                    res.redirect('/services');

                }
                res.redirect('/schedule');
            });
        }
        else {
            var message = 'Error! Date format should be eg.,2019-01-01T17:00:00';
            res.render('pages/modifysessions', { data: validate_input, error: {}, msg: message, servid: service_res_id, ses_id: session_res_id });
        }

    }

});
/* add subscriber information */
router.post('/add_pdn_subscription', [
    check('mcc').isLength({ min: 3, max: 3 }).withMessage('Error! The length of mcc should be 3 !').isInt({ min: 100, max: 999 }).withMessage('Error! mcc should be integer value!').trim(),
    check('mnc').isLength({ min: 2, max: 3 }).withMessage('Error! The length of mnc should be 2 or 3 !').trim(),
    check('msin').isLength({ min: 10 }).withMessage('Error! The length of msin should be 9 or 10!').isInt().withMessage('Error! msin should be integer value!').trim(),
    check('msisdn').isLength({ min: 7, max: 15 }).withMessage('Error! The length of msisdn should be 15!').isInt().withMessage('Error! msisdn should be integer value!').trim(),
    check('apn').isAlpha().withMessage('Error! apn should be Alphabetic only!').trim(),
    check('k').isHexadecimal().withMessage('Error! The k field requires hexadecimal value!').trim(),
    
], function (req, res) {
    var errors = validationResult(req);
 
    var countryx = fs.readFileSync(process.cwd() + "/public/mcc-mnc-table.json");
    var mcc_mnc = JSON.parse(countryx);
    var input_data = {
        mcc: req.body.mcc,
        mnc: req.body.mnc,
        msin: req.body.msin,
        msisdn: req.body.msisdn,
        apn: req.body.apn,
        qci: req.body.qci,
        k: req.body.k,
        served_party_ipv4_addr: req.body.served_party_ipv4_addr
    };
    console.log('imsi value is: ', (req.body.mcc + req.body.mnc + req.body.msin));
    if (!errors.isEmpty()) {
       
        res.render('pages/add_pdn_subscription', { message: '', error: errors.array(), input: input_data, file: mcc_mnc });

    }
    else {
        sanitizeBody('mcc').trim().escape(),
            sanitizeBody('mnc').trim().escape(),
            sanitizeBody('msin').trim().escape(),
            sanitizeBody('apn').trim().escape(),
            sanitizeBody('qci').trim().escape(),
            sanitizeBody('k').trim().escape();

        var msisdn = req.body.msisdn;
        var msin = req.body.msin;
        var mnc = req.body.mnc;
        var mcc = req.body.mcc;
        
        if (mnc.length == 3) {
            var msisdn_12 = msisdn.substring(2);
        }
        else {
            var msisdn_12 = msisdn.substring(3);
        }
     
        if (msisdn_12 == (mnc + msin)) {

            var sql = "INSERT INTO pdn_subscription_ctx SET imsi=?,ctx_id=?, apn=?, pgw_allocation_type=?,vplmn_dynamic_address_allowed =?,eps_pdn_subscribed_charging_characteristics=?, pdn_addr_type =?,pdn_addr=?,subscribed_apn_ambr_dl=?,subscribed_apn_ambr_up=?, qci=?, qos_allocation_retention_priority_level =?, qos_allocation_retention_priority_preemption_capability =?, qos_allocation_retention_priority_preemption_vulnerability=?,served_party_ipv4_addr= ?";
            var sql_subsc = "INSERT INTO subscriber_profile SET imsi = ?,msisdn= ?,k= UNHEX(?),opc= ?,sqn= ?,imsisv=?,ue_ambr_ul =?,ue_ambr_dl=?";
           
            db.query(sql, [req.body.mcc + req.body.mnc + req.body.msin, 0, req.body.apn, 0x00, 0x00, 0x0000, 0x00, 0x000000000000000000000000, 100000, 100000, req.body.qci, 15, 0x00, 0x00, req.body.served_party_ipv4_addr], function (err, pdn_data) {
                if (err) {
                    
                }
            });
            db.query(sql_subsc, [req.body.mcc + req.body.mnc + req.body.msin, req.body.msisdn, req.body.k, null, 0x000000000020, 0x0000000000000000, 100000, 100000], function (err, result, fields) {
              

                if (err) {
                
                    res.render('pages/add_pdn_subscription', { message: "Duplicate ENTRY(MCC,MNC,MSIN)", error: {}, input: input_data, file: mcc_mnc });
                }
                else {
                    var simwriter = fs.appendFile(process.cwd() + "/public/SIMscript.txt", "\n1234 88888888 1234 88888888 0102030405060708 894900150624013455 " + "" + parseFloat(mcc + mnc + msin) + " 004 " + Number(msisdn) + " " + req.body.k + " NULL", (error) => {
                        if (error) {
                            req.flash('error', 'UNABLE TO WRITE SIM INFORMATION TO FILE');
                            res.redirect('/display_pdn_subsc');
                        }
                        else {
                            req.flash('info', 'USER SUCCESSFULLY SAVED!');
                            res.redirect('/display_pdn_subsc');
                        }
                    });

                }

            })
        }
        else {
            
            res.render('pages/add_pdn_subscription', { message: 'Error! MNC+MSIN does not match the last 12 digits of the MSISDN', error: {}, input: input_data, file: mcc_mnc });
        }
    }
});
router.post('/edit_pdn_subs/:imsi', loginAuthentica.is_login, [
    check('imsi').isLength({ min: 15, max: 15 }).withMessage('ERROR: THE LENGTH OF IMSI HAS TO BE 15').isInt().withMessage('ERROR: IMSI VALUE HAS TO BE INTEGER VALUE').trim(),
    check('msisdn').isLength({ min: 15, max: 15 }).withMessage('ERROR: THE LENGTH OF MSISDN HAS TO BE 15').isInt().withMessage('ERROR: MSISDN VALUE HAS TO BE INTEGER VALUE').trim(),
    check('apn').isAlpha().withMessage('ERROR: THE APN VALUE HAS TO BE ALPHANUMERIC VALUE'),
    check('k').isHexadecimal().withMessage('ERROR! THE K FIELD REQUIRES HEXADECIMAL VALUE'),

], function (req, res, next) {
    var errors = validationResult(req);
    var countryx = fs.readFileSync(process.cwd() + "/public/mcc-mnc-table.json");
    var mcc_mnc = JSON.parse(countryx);

    var updated_data = {
        imsi: req.params.imsi,
        msisdn: req.body.msisdn,
        apn: req.body.apn,
        qci: req.body.qci,
        k: req.body.k,
        served_party_ipv4_addr: req.body.served_party_ipv4_addr
    };

    if (!errors.isEmpty()) {
        console.log(updated_data);
        req.flash('error', errors.array()[0].msg);        
        res.redirect('/display_pdn_subsc');
    }
    else {
        sanitizeBody('imsi').trim().escape(),
            sanitizeBody('apn').trim().escape(),
            sanitizeBody('qci').trim().escape(),
            sanitizeBody('k').trim().escape();

        var imsi = req.params.imsi;
        var msisdn = req.body.msisdn;
        var update = "UPDATE pdn_subscription_ctx INNER JOIN subscriber_profile ON pdn_subscription_ctx.imsi = subscriber_profile.imsi SET pdn_subscription_ctx.imsi = ?,pdn_subscription_ctx.apn=?,pdn_subscription_ctx.qci=?,pdn_subscription_ctx.served_party_ipv4_addr=?, subscriber_profile.imsi= ?,subscriber_profile.msisdn= ?,subscriber_profile.k= UNHEX(?) WHERE pdn_subscription_ctx.imsi= ?";
        
        db.query(update, [req.body.imsi, req.body.apn, req.body.qci, req.body.served_party_ipv4_addr, req.body.imsi, req.body.msisdn, req.body.k, req.params.imsi], function (err, data, fields) {

            //console.log('this is the edited data',data)
            if (err) {
                req.flash('error', 'ERROR: DUPLICATE IMSI VALUE');
                res.redirect('/display_pdn_subsc');
               

            }
            else {
                
                req.flash("info", "Successfully updated!");
                res.redirect('/display_pdn_subsc');
            }
        });

    }
});
router.post('/operator', [
    check('mcc').isInt({ min: 100, max: 999 }).withMessage('Error! mcc should be integer value!').trim().escape(),
    check('mnc').isLength({ min: 1, max: 3 }).withMessage('Error! Mnc should not be empty !').trim().escape(),
    check('op').isHexadecimal().withMessage('Error! The op field requires hexadecimal value!').trim().escape(),
    check('amf').isHexadecimal().withMessage('Error! The amf field requires hexadecimal value!').trim().escape(),
    check('name').isLength({ min: 1 }).withMessage('Error! The name field requires alphanumeric characters!').trim()
], function (req, res, next) {    
    var errors = validationResult(req);
    var countryx = fs.readFileSync(process.cwd() + "/public/mcc-mnc-table.json");
    var mcc_mnc = JSON.parse(countryx);
    var operator = {
        mcc: req.body.mcc,
        mnc: req.body.mnc,
        op: req.body.op,
        amf: req.body.amf,
        name: req.body.name
    };   
    if (!errors.isEmpty()) {
        res.render('pages/operator', { message: '', error: errors.array(), file: mcc_mnc, input: operator });
    }
    else {
        mysql_op = "INSERT INTO operators (mcc,mnc,op,amf,name) values ('" + req.body.mcc + "','" + req.body.mnc + "',UNHEX('" + req.body.op + "'),UNHEX('" + req.body.amf + "'),'" + req.body.name + "')";
        db.query(mysql_op, function (err, op_data) {

            if (err) {
                req.flash('error',err);
               
                res.render('pages/operator', { message: "DUPLICATE ENTRY(MCC,MNC)", error: {}, file: mcc_mnc, input: operator });
            }
            else {
                
                req.flash('info','OPERATOR SUCCESSFULLY ADDED!');
                res.redirect('/display_operator');
            }

        });
    }
});
router.post('/edit_operator/(:mnc/:mcc)', [
    check('mcc').isLength({ min: 3, max: 4 }).withMessage('Error! The length of mcc should be 3 !').isInt({ min: 100, max: 999 }).withMessage('Error! mcc should be integer value!').trim().escape(),
    check('mnc').isLength({ min: 1 }).withMessage('Error! The length of mnc should be 2 or 3 !').trim().escape(),
    check('op').isHexadecimal().withMessage('Error! The op field requires hexadecimal value!').trim().escape(),
    check('amf').isLength({ max: 4 }).withMessage('Error! The length of amf should be 4 !').isHexadecimal().withMessage('Error! The amf field requires hexadecimal value!').trim().escape(),
    check('name').isLength({ min: 1 }).withMessage('Error! The name field requires alphanumeric characters!').trim().escape()

], function (req, res, next) {
    var errors = validationResult(req);
    var countryx = fs.readFileSync(process.cwd() + "/public/mcc-mnc-table.json");
    var mcc_mnc = JSON.parse(countryx);
    var editoper = {
        mcc: req.body.mcc,
        mnc: req.body.mnc,
        op: req.body.op,
        amf: req.body.amf,
        name: req.body.name
    }
    var mnc = req.params.mnc;
    var mcc = req.params.mcc;
    for (var i = 0; i < mcc_mnc.length; i++) {
        if (mcc_mnc[i].mcc == mcc) {
            var country = mcc_mnc[i].country;
        }
    }
    if (!errors.isEmpty()) {
        res.render('pages/edit_operator', { message: '', error: errors.array(), editoperator: editoper, file: mcc_mnc, country: country });
    }
    else {

        var operator_str = "UPDATE operators SET mcc=?,mnc=?,op=UNHEX(?),amf=UNHEX(?),name= ?  WHERE mnc = ? AND mcc= ?";
        db.query(operator_str, [req.body.mcc, req.body.mnc, req.body.op, req.body.amf, req.body.name, mnc, mcc], function (err, editop, fields) {
            if (err) {
                req.flash('error',' Error! Duplicate entries (mcc, mnc)!');

                res.render('pages/edit_operator', { message: "DUPLICATE ENTRY(MCC,MNC)", error: {}, editoperator: editoper, file: mcc_mnc, country: country });
              
            }
            else {
                req.flash('info','SUCCESSFULLY UPDATED!');            
                res.redirect('/display_operator');

            }

        });
    }
});
router.post('/postconfig',function(req,res){
  var enbdata = {
    ip:req.body.eNBIP,
    name: req.body.eNBname,
    latitude:req.body.gps_coorlat,
    longitude:req.body.gps_coorlng,
    coverage_area:400,
    cell_id:req.body.cellID,
    tracking_area_id:req.body.trackingA_ID,
    service_id:req.body.service_ID
  };
  db.query("INSERT INTO enb_configuration SET ?",enbdata,function(err,enbdata,fields){
    if(err){     
      req.flash('error','DUPLICATE IP ENTRIES');
      res.redirect('/mgt_dashboard');
    }
    else{
        res.redirect('/mgt_dashboard');
    }
  });
});
/* modify enb configuration */
router.post('/modifyconfig/:id',function(req,res){
  var id= req.params.id;
  var modifydata = {
    ip:req.body.eNBIP,
    name: req.body.eNBname,
    latitude:req.body.gps_coorlat,
    longitude:req.body.gps_coorlng,
    coverage_area:req.body.coverageA,
    cell_id:req.body.cellID,
    tracking_area_id:req.body.trackingA_ID,
    service_id:req.body.service_ID
  }  
 var enbconfig="UPDATE enb_configuration SET ip=?,name=?,latitude=?,longitude=?,coverage_area=?,cell_id=?,tracking_area_id=?,service_id=? WHERE ip=?";
  db.query(enbconfig,[req.body.eNBIP,req.body.eNBname,req.body.gps_coorlat,req.body.gps_coorlng,req.body.coverageA,req.body.cellID,req.body.trackingA_ID,req.body.service_ID,id],function(err,data,fields){
    if(err){
   
      res.redirect('/viewconfig');
    }
    else{
      res.redirect('/viewconfig');
    }
  });
});
module.exports = router;
