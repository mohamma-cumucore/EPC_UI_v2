const mysql = require('mysql');
const fs = require('fs');
const flash = require('connect-flash');
const connection = require('../config/db_config');
const db = connection.getConnection();
const request = require('request');
var exec = require('child_process').execFile;
var moment = require('moment');
var jscontent = fs.readFileSync(process.cwd() + "/public/settings.json");
var jsonContent = JSON.parse(jscontent);
var title = jsonContent.header_name;
var username = jsonContent.username;
var password = jsonContent.password;
var path = jsonContent.path;
var baseurl = jsonContent.url;
exports.indexpage = function (req, res) {
  res.render('pages/index', { header: title, error: {}, message: '' });

}
//post login creditentials
exports.indexpost = function (req, res) {
  //var session_store=req.session;  
  var user_name = req.body.username;
  var pass_word = req.body.password;
  if (user_name == username) {
    if (pass_word == password) {
      //session_store.is_login = true;
      res.redirect('/mgt_dashboard');
    }
    else {
      res.render('pages/index', { header: title, message: 'In correct password!', error: {} });
    }
  }
  else {
    res.render('pages/index', { header: title, message: 'Wrong username or password. Try again.', error: {} });
  }

}
exports.dashboard = function (req, res) {

  db.query('SELECT amf_enb_data.enb_name,amf_enb_data.amf_name,amf_enb_data.enb_ipv4,amf_settings.mmegi,amf_settings.mmec,amf_settings.s1_addr_ipv4,amf_settings.smf_s11_addr_ipv4,amf_settings.mcc,amf_settings.mnc FROM amf_enb_data INNER JOIN amf_settings ON amf_enb_data.amf_name = amf_settings.name WHERE amf_settings.amf_state=?; SELECT * FROM service_data;SELECT * FROM enb_configuration', [2], function (err, data, fields) {

    if (err) {
      console.log('Error', err.sqlMessage);
      res.redirect('/');
    }
    else {
      console.log('enb configuration ', data[2]);
      res.render('pages/mgt_dashboard', { message: {}, streams: data[0], users: data[1], enbconf: data[2] });
    }

  });
}
// post search ue by imsi
exports.uesearch = function (req, res) {
  const id = req.body.imsi;
  console.log('this is the id', id);
  db.query('SELECT pdn_subscription_ctx.*,subscriber_profile.* FROM pdn_subscription_ctx INNER JOIN subscriber_profile ON pdn_subscription_ctx.imsi = subscriber_profile.imsi WHERE subscriber_profile.imsi = ?', [id], function (err, serviceD, fields) {
    if (err) {
      //console.log('wrong imsi  number');
      res.redirect('/mgt_dashboard');
    }
    else if (serviceD.length <= 0) {
      req.flash('error', 'The Subscriber is not found!');
      res.redirect('/mgt_dashboard');

    }
    else {
      console.log('this is the serviceD data', serviceD[0]);
      res.render('pages/api', { ue_data: serviceD[0] });
    }
  })
}
/* setting default amf configuration settings to the db */
exports.addamf = function (req, res) {
  const amf = {
    name: "mme1",
    s1_addr_ipv4: "127.0.0.1",
    s1_addr_ipv6: "::1",
    smf_s11_addr_ipv4: "127.0.0.1",
    smf_s11_addr_ipv6: "::1",
    s11_addr_ipv4: "127.0.0.5",
    s11_addr_ipv6: "::2",
    mmec: "3",
    mmegi: "32772",
    mcc: "244",
    mnc: "44",
    s10_addr_ipv4: "127.0.0.12",
    tracking_area_list: "12594",
    periodic_tau_timer: "10",
    s10_mcc: "244",
    s10_mnc: "44",
    s10_mmec: "3",
    s10_mmegi: "32773",
    s10_rem_addr_ipv4: "172.16.0.4",
    s11u_addr_ipv4: "127.0.0.10",
    m3_addr_ipv4: "127.0.0.1",
    m3_addr_ipv6: "::1",
    sm_addr_ipv4: "127.0.30.1"
  };

  res.render('pages/amfadd', { message: '', error: {}, amf: amf });

}
/* setting default smf configuration settings to the db */
exports.smfadd = function (req, res) {
  const smf = {
    name: "testsmf",
    s11_addr_ipv4: "127.0.0.1",
    s11_addr_ipv6: "NULL",
    amf_s11_addr_ipv4: "127.0.0.5",
    amf_s11_addr_ipv6: "NULL",
    upf_s5_addr_ipv4: "127.0.0.1",
    upf_s5_port: "10000",
    s5_addr_ipv4: "127.0.0.1",
    s5_port: "20000",
    s1u_uplink_addr_ipv4: "172.16.0.1",
    sgmb_addr_ipv4: "127.0.0.1",
    sgmb_port: "22330",
    sm_addr_ipv4: "127.0.30.2",
    amf_sm_addr_ipv4: "127.0.30.1",
    ue_addr_ipv4_pool_start: "10.200.1.1",
    dns_addr_ipv4: "8.8.8.8",
    iot_upf_user_plane_addr_ipv4: "127.0.1.9",
    iot_upf_s5_addr_ipv4: "127.0.1.7",
    iot_upf_s5_port: "8000",
    iot_upf_apn: "iot",
    mysql_host: "localhost",
    mysql_db_name: "hss_lte_db",
    mysql_user_name: "hss",
    mysql_password: "hss",
    smf_state: "0"
  }

  res.render('pages/smfadd', { message: '', error: {}, smf: smf });

}
/* Display available amf  configurations in the db */
exports.listamf = function (req, res) {
  db.query('SELECT * FROM amf_settings', function (err, amf_data, fields) {
    if (err) {
      console.log('UNABLE TO RETRIVE DATA FROM DB');
    }
    else {
      var amf_array = [];
      amf_array = amf_data;
      //console.log(amf_data);
      res.render('pages/amfdisplay', { amfd: amf_array, message: req.flash() });
    }
  });
}
/* Display available smf configuration in the database */
exports.listsmf = function (req, res) {
  db.query('SELECT * FROM smf_settings', function (err, smf_data, fields) {

    if (err) throw err;
    var smf_array = [];
    smf_array = smf_data;
    res.render('pages/smfdisplay', { smfd: smf_array, message: req.flash() });

  });
}
/* starting the amf service */
exports.amfStart = function (req, res) {

  var file = path + "core";
  var child = exec(file, [path],
    function (error, stdout, stderr) {
      if (error) {
        console.log('error', stderr);
        req.flash("error", "ERROR! UNABLE TO START THE AMF");
        res.redirect('/amfdisplay');
      }

      //console.log('success'+stdout);
      req.flash("info", "AMF IS STARTING ...Refresh the page");
      res.redirect('/amfdisplay');



    });

}
/* Edit available amf configurations in the db */
exports.editAmf = function (req, res) {
  var id = req.params.id;
  db.query('SELECT * FROM amf_settings a INNER JOIN five_g_amf_settings f ON a.name=f.name WHERE a.name=?', [id], function (err, row_data, fields) {
    if (err) {
      res.redirect('/amfdisplay');
    }
    else {
      const Ta = row_data[0].tracking_area_list1;
      const track = Ta.split(',')[0];
      res.render('pages/edit_amf', { message: '', error: {}, edit_data: row_data[0], Ta: track });
    }

  });
}
/* delete a given amf from db */
exports.deleteAmf = function (req, res) {
  var id = req.params.id;
  var amf_id = id.split(',');
  db.query('DELETE a,f FROM amf_settings a JOIN five_g_amf_settings f ON a.name = f.name WHERE a.name IN (?)', [amf_id], function (err, del_data, fields) {
    if (err) {
      res.redirect('/amfdisplay');
    }
    else {
      req.flash('info', 'DATA SUCCESSFULLY DELETED!');
      res.redirect('/amfdisplay');
    }

  });
}
/* start smf  */
exports.smfStart = function (req, res) {
  var file = path + "smf_mbms";
  var config = path + "smf_config.json";
  var child = exec(file, [config],
    function (error, stdout, stderr) {
      if (error) {
        console.log('error', stderr);
        req.flash("error", "ERROR! UNABLE TO START THE SMF");
        res.redirect('/smfdisplay');
      }

      //console.log('success'+stdout);
      req.flash("info", "SMF IS STARTING ...Refresh the page");
      res.redirect('/smfdisplay');


    });

}
exports.editSmf = function (req, res) {
  var id = req.params.id;
  //console.log('the id is ',id);
  db.query('SELECT * FROM smf_settings WHERE name =?', [id], function (err, row, fields) {
    if (err) {

      res.redirect('/smfdisplay');
    }
    else {
      res.render('pages/edit_smf', { message: '', error: {}, smfdata: row[0] });
    }

  });

}
/* delete smf configuration settings from the datebase */
exports.deleteSmf = function (req, res) {
  var id = req.params.id.split(',');
  db.query('DELETE FROM smf_settings WHERE name IN (?)', [id], function (err, del_data, fields) {
    if (err) {
      //console.log('Error Unable to delete',err.sqlMessage);
      res.redirect('/smfdisplay');
    }
    else {
      req.flash('info', 'DATA SUCCESSFULLY DELETED! ');
      res.redirect('/smfdisplay');
    }
  });
}
/* downloading the amf 4g(core) binaries from the UI */
exports.core = function (req, res) {

  var core = fs.copyFile(process.cwd() + "/public/core", path + "core", (error) => {
    if (error) {
      console.log('unable to write to file', error)
      req.flash("error", "AMF BINARY NOT SAVRD! " + path);
      res.redirect('/amfdisplay');
    }
    else {
      req.flash("info", "AMF BINARY FILE SUCCESSFULLY SAVED! " + path);
      res.redirect('/amfdisplay');
    }
  })

}
/* Downloading the smf binaries which  supports the mbms */
exports.smfMbms = function (req, res) {

  var smfmbms = fs.copyFile(process.cwd() + "/public/smf_mbms", path + "smf_mbms", (error) => {
    if (error) {
      console.log('unable to write to file', error);
      req.flash("error", "SMF-eMBMS BINARY FILE NOT SAVED! " + path);
      res.redirect('/smfdisplay');
    }
    else {
      req.flash("info", "SMF-eMBMS BINARY FILE SUCCESSFULLY SAVED! " + path);
      res.redirect('/smfdisplay');
    }
  });
}
/* downloading the xmb interface API from the ui */
exports.xmb = function (req, res) {

  var xmb = fs.copyFile(process.cwd() + "/public/xmbapi", path + "xmbapi", (error) => {
    if (error) {
      console.log('UNABLE TO WRITE TO A FILE', error);
      req.flash("error", "BMSCAPI BINARY FILE NOT SAVED! " + path);
      res.redirect('/smfdisplay');
    }
    else {
      req.flash("info", "BMSCAPI BINARY FILE SUCCESSFULLY SAVED! " + path);
      res.redirect('/smfdisplay');
    }
  });
}
/* scheduling the session */
exports.sessionSchedule = function (req, res) {
  var url = baseurl + '/xmb/v1.0/services/';
  var session_list = [];
  console.log('Another baseurl:', url);
  request(url, function (err, response, body) {
    if (err) {
      console.log('End point(xmbapi) is not running:', err.code);
      req.flash('error', 'ERROR SOMETHING WENT WRONG WITH THE API');
      res.redirect('/mgt_dashboard');
    }

    else {
      var services = JSON.parse(body);
      if (services == '') {
        console.log('RESPONSE MESSAGE:', response.statusCode);
        res.render('pages/schedule', { events: [] });
      }
      else {
        var id = services[0]['service-id'];
        var url_session = url + id + '/sessions';
        console.log(url_session);
        request(url_session, function (err, response_ses, body_ses) {
          if (err) {
            console.log('NO SCHEDULED SESSIONS!!', err.code);
            res.render('pages/schedule', { events: [] });
          }
          var sessions = JSON.parse(body_ses);
          for (var i = 0; i < sessions.length; i++) {
            if (sessions[i]["session-state"] == "Session Idle") {
              session_list.push({
                //title  : sessions[i]["file-session"]["file-list"][0]["file-url"],
                start: moment(sessions[i]["session-start"] * 1000).format("YYYY-MM-DDTHH:mm:ss"),
                end: moment(sessions[i]["session-stop"] * 1000).format("YYYY-MM-DDTHH:mm:ss"),
                color: 'blue'
              });

            }
            else {
              session_list.push({
                //title  : sessions[i]["file-session"]["file-list"][0]["file-url"],
                start: moment(sessions[i]["session-start"] * 1000).format("YYYY-MM-DDTHH:mm:ss"),
                end: moment(sessions[i]["session-stop"] * 1000).format("YYYY-MM-DDTHH:mm:ss"),
                color: 'green'
              });

            }

          }
          console.log(session_list);
          res.render('pages/schedule', { events: session_list });
        });
      }
    }
  });
}
/* Display services */
exports.mbmsServices = function (req, res) {

  let url = baseurl + '/xmb/v1.0/services';
  request(url, function (err, response, body) {
    if (err) {
      console.log('Error code:', err);
      req.flash('error', 'ERROR CAN NOT ACCESS THE API');
      res.redirect('/schedule');
    }
    else {
      if (body == "404 page not found\n") {
        console.log(err.code);
        //req.flash('error', 'ERROR CAN NOT ACCESS THE API');
        res.redirect('/schedule');
      }
      else {
        console.log('SUCCESS!', response.statusCode);
        let services = JSON.parse(body);
        res.render('pages/services', { data: services, error: {} });
      }

    }
  });
}
/* Adding services */
exports.createService = function (req, res) {

  var url = baseurl + '/xmb/v1.0/services/';
  request.post({
    url: url,
    body: JSON.stringify({}),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  }, function (err, response, body) {
    if (err) {
      console.log('Error!', err.code);
      res.render('pages/mgt_dashboard', { message: "Error!provide with working API: " + err.code, error: {} });
    }
    var service = JSON.parse(body);
    console.log('Response', response.statusCode);
    var id = service["service-id"];
    var url_ser = url + id + '';
    request(url_ser, function (error, resser, bpdyres) {
      if (error) {
        console.log('Error!', error);
        res.render('pages/mgt_dashboard', { message: "Error!creating a service: " + err.code, error: {} });
      }
      else {
        //console.log(resser);
        let newservices = JSON.parse(bpdyres);
        res.render('pages/addservices', { datax: newservices, error: {} });
      }

    });
  });
}
/* Removing available services */
exports.deleteService = function (req, res) {
  var urld = baseurl + '/xmb/v1.0/services/';
  var id = req.params.id;
  console.log('deleting service with id' + id);
  request.delete({ url: urld + id },
    function (err) {
      if (err) {
        console.log('Error');
        res.redirect('/services');
      }
      else {
        console.log('Service with the specific id successfully deleted!!');
        res.redirect('/services');
      }
    });
}
/* adding sessions */
exports.addSessions = function (req, res) {

  var url = baseurl + '/xmb/v1.0/services/';
  var id = req.params.id;
  console.log('The id is: ', id);
  var apiurl = url + id + '/sessions';
  request.post({
    url: apiurl,
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Content-Length": 214
    }
  }, function (err, response, body) {
    if (err) {
      //console.log('Error! Unable to create session');
      console.log(response);
      res.redirect('/services');
    }
    else {

      sess = JSON.parse(body);
      var ses_id = sess.id;
      var single_sess = [];
      var url_ses = url + id + '/sessions/' + ses_id;
      request(url_ses, function (error, resp, ses_bod) {
        if (error) {
          //console.log("Error, fail to retrive a session with this id");
          console.log(resp);
          res.redirect('/schedule');
        }
        else {
          let availa_ses = JSON.parse(ses_bod);
          single_sess.push({
            id: ses_id,
            start: moment(availa_ses["session-start"] * 1000).format("YYYY-MM-DDTHH:mm:ss"),
            end: moment(availa_ses["session-stop"] * 1000).format("YYYY-MM-DDTHH:mm:ss"),
            max_bitrate: availa_ses['max-bitrate'],
            session_type: availa_ses['session-type'],
            //ingest_mode: availa_ses["file-session"]["ingest-mode"],
            //file_url:availa_ses["file-session"]["file-list"][0]["file-url"]

          });
          console.log(single_sess[0]);
          console.log("the current moment", moment().format("YYYY-MM-DDTHH:mm:ss"));
        }
        res.render('pages/modifysessions', { data: single_sess[0], error: {}, msg: "", servid: id, ses_id: ses_id });
      });
    }
  });

}
/*display avilable sessions */
exports.viewsessions = function (req, res) {

  var urlses = baseurl + '/xmb/v1.0/services/';
  var available_ses = [];
  var id = req.params.id;
  var url = urlses + id + '/sessions';
  //console.log(url);
  request(url, function (err, response, body) {
    if (err) {
      console.log('There is an error happening');
      console.log('Error:', err.code);
      res.redirect('/schedule');
    }
    else {
      let services = JSON.parse(body);
      console.log('service length', services);
      if (services != null && services.length > 0) {
        console.log('hello');
        for (var i = 0; i < services.length; i++) {
          available_ses.push({
            id: services[i]["id"],
            start: moment(services[i]["session-start"] * 1000).format("YYYY-MM-DDTHH:mm:ss"),
            end: moment(services[i]["session-stop"] * 1000).format("YYYY-MM-DDTHH:mm:ss"),
            max_bitrate: services[i]['max-bitrate'],
            session_type: services[i]['session-type'],
            // ingest_mode: services[i]["file-session"]["ingest-mode"],
            // file_list:services[i]["file-session"]["file-list"][0]["file-url"]

          });
        }

        res.render('pages/viewsessions', { data: available_ses, error: {}, ser_res_id: id });
      }
      else {
        console.log(available_ses);
        res.render('pages/viewsessions', { data: available_ses, error: {}, ser_res_id: id });
      }

    }
  });
}
/* delete a session */
exports.deletesession = function (req, res) {
  var service_res_id = req.params.ser_res_id;
  var session_res_id = req.params.id;
  var delurl = baseurl + '/xmb/v1.0/services/';
  var url = delurl + service_res_id + '/sessions/' + session_res_id;
  console.log(url);
  request({
    url: url,
    method: 'DELETE'

  }, function (err, response, body) {
    if (err) {
      console.log('statusCode:', response && response.statusCode);
      res.redirect('/services');
    }
    res.redirect('/services');

  });
}
/* downloading smf config from the UI */
exports.smfconfig = function (req, res) {
  var id = req.params.id;
  var dbquery = "SELECT * FROM smf_settings WHERE name=?";
  db.query(dbquery, [id], function (err, result, fields) {
    if (err) {
      //console.log('Error!',err.sqlMessage);
      res.redirect('/smfdisplay');
    }
    else {
      //console.log('Configuration file successfully saved');
      var smfdata = JSON.stringify(result[0], null, 2);
      //console.log(smfdata);
      var saveconfig = fs.writeFileSync(path + "smf_config.json", smfdata);
      req.flash("info", "CONFIGURATION FILE SUCCESSFULLY SAVED! " + path + "smf_config.json");
      res.redirect('/smfdisplay');
    }
  });
}
/* adding subscriber to the db */
exports.user = function (req, res) {
  var countryx = fs.readFileSync(process.cwd() + "/public/mcc-mnc-table.json");
  var mcc_mnc = JSON.parse(countryx);
  var input_data = {
    mnc: '88',
    msin: '1000000001',
    msisdn: '007881000000001',
    apn: 'internet',
    qci: '9',
    k: '000102030405060708090A0B0C0D0E0F',
    served_party_ipv4_addr: 'NULL'
  }

  res.render('pages/add_pdn_subscription', { message: '', error: {}, input: input_data, file: mcc_mnc });
}
/* List of subscribers available in the db */
exports.listusers = function (req, res) {
  db.query("SELECT pdn_subscription_ctx.imsi,pdn_subscription_ctx.apn,pdn_subscription_ctx.qci,pdn_subscription_ctx.served_party_ipv4_addr,subscriber_profile.msisdn,subscriber_profile.k,subscriber_profile.opc FROM  subscriber_profile INNER JOIN pdn_subscription_ctx ON pdn_subscription_ctx.imsi=subscriber_profile.imsi", function (err, pdn_data, fields) {
    if (err) {
      console.log('Here an error happens to retrive!');
      res.redirect('/');
    }
    else {
      //console.log('the display data are',pdn_data);
      res.render('pages/display_pdn_subsc', { data: pdn_data, message: req.flash() });
    }

  });
}
/* edit subscriber */
exports.editusers = function (req, res) {
  var countryx = fs.readFileSync(process.cwd() + "/public/mcc-mnc-table.json");
  var mcc_mnc = JSON.parse(countryx);
  var imsi = req.params.imsi;
  var mcc = imsi.substring(0, 3);
  db.query("SELECT pdn_subscription_ctx.*,subscriber_profile.* FROM pdn_subscription_ctx INNER JOIN subscriber_profile ON pdn_subscription_ctx.imsi = subscriber_profile.imsi WHERE subscriber_profile.imsi = ? ", [req.params.imsi], function (err, data, fields) {
    if (err) {

      res.redirect('/display_pdn_subsc');
    }
    else {

      res.render('pages/edit_pdn_subs', { message: '', error: "", Datasubs: data, file: mcc_mnc });

    }


  });
}
/* delete a single ot multiple subscribers */
exports.deleteusers = function (req, res) {

  var imsi = req.params.id.split(',');
  //var msin = req.params.msin;
  db.query("DELETE x.*, p.* FROM pdn_subscription_ctx x INNER JOIN subscriber_profile p ON x.imsi = p.imsi WHERE p.imsi IN (?) ", [imsi], function (err, data, fields) {
    if (err) {
      //console.log('Error message',err.sqlMessage);
      req.flash("error", "Not deleted!");
      res.redirect('/display_pdn_subsc');
    }
    else {
      db.query("DELETE auth_vec.* FROM auth_vec WHERE imsi IN (?)", [imsi], function (err, del_auth, fields) {
        if (err) {
          //console.log('second Error message',err.sqlMessage);
          res.redirect('/display_pdn_subsc');
        }

      });
      req.flash("info", "Successfully deleted!");
      res.redirect('/display_pdn_subsc');
    }

  });
}
/* Add operator to the db */
exports.addoperator = function (req, res) {
  var countryx = fs.readFileSync(process.cwd() + "/public/mcc-mnc-table.json");
  var mcc_mnc = JSON.parse(countryx);
  var input_data = {
    country: mcc_mnc[0].country,
    mcc: mcc_mnc[0].mcc,
    mnc: mcc_mnc[0].mnc,
    op: 'f964ba9478cdc6c72eaf1e95dbc6674a',
    amf: '8000',
    name: mcc_mnc[0].network
  }

  res.render('pages/operator', { message: '', error: {}, input: input_data, file: mcc_mnc });
}
/* list of subscribers */
exports.listoperator = function (req, res) {

  db.query('SELECT * FROM operators', function (err, operator_info, fields) {
    if (err) throw err;
    res.render('pages/display_operator', { operator: operator_info, message: req.flash() });

  });
}
/* edit an operator table */
exports.editoperator = function (req, res) {
  var countryx = fs.readFileSync(process.cwd() + "/public/mcc-mnc-table.json");
  var mcc_mnc = JSON.parse(countryx);
  var mnc = req.params.mnc;
  var mcc = req.params.mcc;
  for (var i = 0; i < mcc_mnc.length; i++) {
    if (mcc_mnc[i].mcc == mcc) {
      var country = mcc_mnc[i].country;
    }

  }
  db.query("SELECT mcc,mnc,op,amf,name FROM operators WHERE mnc= ? AND mcc = ? ", [mnc, mcc], function (err, data, fields) {
    if (err) {
      res.redirect('/display_operator');
    };

    var editop = {
      mcc: data[0].mcc,
      mnc: data[0].mnc,
      op: data[0].op,
      amf: data[0].amf,
      name: data[0].name

    }
    res.render('pages/edit_operator', { error: {}, message: '', editoperator: editop, file: mcc_mnc, country: country });

  });

}
/* deleting an operator */
exports.deleteoperator = function (req, res) {

  var id = req.params.id;
  var id1 = id.split('s');
  var pids = [];
  var primary = [];
  for (var i = 0; i < id1.length - 1; i++) {
    pids.push([]);
  }

  for (var i = 0; i < id1.length - 1; i++) {
    pids[i].push(parseInt(id1[i].split('-')[0]));
    pids[i].push(parseInt(id1[i].split('-')[1]));
  }

  db.query('DELETE operators.* FROM operators WHERE (mnc,mcc) IN (?)', [pids], function (err, data, fields) {
    if (err) {

      req.flash("error", "Not deleted!");
      res.redirect('/display_operator');
    }
    else {

      req.flash('info', 'SUCCESSFULLY DELETED!');
      res.redirect('/display_operator');

    }
  });
}
/* list available eNB in the Ui */
exports.listeNB = function (req, res) {

  db.query("SELECT * FROM enb_configuration", function (err, configuration, fields) {
    if (err) {
      res.redirect('/');
    }
    else {
      res.render('pages/viewconfig', { data: configuration });
    }
  });
}
/* editing a given enb */
exports.modifyeNB = function (req, res) {
  var id = req.params.id;

  db.query("SELECT * FROM enb_configuration WHERE ip= ?", [id], function (err, data, fields) {
    if (err) {
      //console.log('UNABLE TO RETRIVE: ',err.sqlMessage);
      res.redirect('/viewconfig');
    }
    else {
      //console.log(data);
      res.render('pages/modifyconfig', { error: {}, data: data[0] });
    }

  });

}

exports.deleteNB = function (req, res) {
  var id = req.params.id.split(',');
  db.query("DELETE FROM enb_configuration WHERE ip IN (?)", [id], function (err, rementry, fields) {
    if (err) {
      //console.log('UNABLE TO DELETE: ',err.sqlMessage);
      res.redirect('/viewconfig');
    }
    else {
      res.redirect('/viewconfig');
    }
  });

}
/* Downloading a given amf configuration file to the given path */
exports.amfconfig = function (req, res) {
  var id = req.params.id;
  var result = "SELECT * FROM amf_settings a WHERE a.name=?;SELECT * FROM five_g_amf_settings f WHERE f.name=?";
  db.query(result, [id, id], function (err, data, fileds) {
    if (err) {
      //console.log('ERROR',err.sqlMessage);
      req.flash('error', 'NO AMF CONFIGURATIONS FOUND WITH THIS NAME.');
      res.redirect('/amfdisplay');
    }
    else {
      var trackingA1 = [];
      var trackingA2 = [];
      var ta1 = data[0][0].tracking_area_list1.split(',');
      trackingA1.push(parseInt(ta1[0]));
      data[0][0].tracking_area_list1=trackingA1;
      data[0][0].tracking_area_list2=trackingA2;
      data[0][0].tracking_area_list3=trackingA2;
      var mnc_val = data[0][0].mnc;
      var mnc_s10_val= data[0][0].s10_mnc;      
      if(mnc_val.toString().length==1){
        //console.log('the amf length is 1');
        data[0][0].mnc= "0"+mnc_val;
        data[0][0].s10_mnc= "0"+mnc_s10_val;
        data[1][0].mnc = "0"+mnc_val;
      }
      var amf4gdata = JSON.stringify(data[0]);
      //console.log(data[0]);
      var mme_json = fs.writeFileSync(path + "mme_config.json", amf4gdata);
      var amf5gdata = JSON.stringify(data[1], null, 2);
      var amf_json = fs.writeFileSync(path + "amf_config.json", amf5gdata);
      //var files = fs.readFileSync(process.cwd("/binaries.zip"));
      req.flash('info', 'CONFIGURATION FILE SUCCESSFULLY DOWNLOADED AT: ' + path);
      res.redirect('/amfdisplay');
      //res.send(amf5gdata);
    }
  });
}
exports.logout = function (req, res) {
  res.redirect('/');
}
exports.simwriter = function (req, res) {
  var id = req.params.id;
  var imsi = id.split(',');
  db.query("SELECT * from subscriber_profile WHERE imsi IN (?)",[imsi],function(err,data){
    if(err){
      console.log("unable to retrive data from the db");
    }
    else{
      var simdata = "PIN1 PUK1 PIN2 PUK2 ADM ICCID IMSI ACC MSISDN KI OPC \n";
      for(var i=0; i< data.length; i++){
        simdata = simdata +  "1234 88888888 1234 88888888 0102030405060708 894900150624013455 " + "" + parseFloat(data[i].imsi) + " 0004 " + Number(data[i].msisdn) + " " + data[i].k.toString('HEX') + " NULL" +"\n";
      }
      var simwriter = fs.writeFile(process.cwd() + "/public/SIMscript.txt",simdata, (error) => {
        if (error) {
            req.flash('error', 'UNABLE TO WRITE SIM INFORMATION TO FILE');
            res.redirect('/display_pdn_subsc');
        }
        else {
            //req.flash('info', 'USER SUCCESSFULLY SAVED!');
            //res.redirect('/display_pdn_subsc');
            var filepath = fs.readFileSync(process.cwd() + "/public/SIMscript.txt");
            res.send(filepath);
        }
    });     
    }

  });  
  
}