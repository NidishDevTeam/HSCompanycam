const express = require("express");
const rout = express.Router();
const axios = require("axios");
require("dotenv").config();
const { stringify } = require("flatted");

const cron = require("node-cron");
const { json } = require("body-parser");
// Schedule to run every hour
var count = 0;
// cron.schedule("* * * * * *", () => {
//   if (count == 0) {
//     console.log("Fetching deals every minute");
//     getDeal();
//     count++;
//   } else {
//     console.log("count exceeded " + count);
//   }
// });

// cron.schedule("* * * * * *", () => {
//   console.log("Fetching deals every second");

// });
rout.get("/test", async (req, res) => {
  console.log("test success");
  // res.send({ body: {message: 'User Found'}, statusCode: 200 });
  // return

  try {
    res.send({ body: { message: "successs" }, statusCode: 200 });
  } catch (error) {
    res.send({ body: { error: error.message }, statusCode: 500 });
  }
});

rout.get("/list", (req, res) => {
  //AVjguITP34NelmkT9DgvAi0yelzyFkfrKlAwNfNLeP4
  const options = {
    method: "GET",
    // url: 'https://api.companycam.com/v2/checklists',
    // url: 'https://api.companycam.com/v2/checklists?per_page=2147483647',
    url: "https://api.companycam.com/v2/projects",

    headers: {
      accept: "application/json",
      authorization: `Bearer ${process.env.CompanyCamToken}`,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      console.log(response.data);
      res.send({ data: response.data, status: 200 });
    })
    .catch(function (error) {
      console.error(error);
      res.send({ error: error, status: 400 });
    });
});

rout.post("/webhook", async (req, res) => {
  const hubspotData = req.body;
  var companyCamResponse;
  var parsedCompanyResponse;
  var OwnerEmail = "andrew@digitalj2.com";
  var CompanyCamProId;
  var listOferror=[];
  console.log("Received data from HubSpot:", hubspotData);
  const Ownerid = hubspotData.hubspot_owner_id;
  var hs_object_id = hubspotData.hs_object_id;
  console.log("owner id" + Ownerid);
  try {
    var ownerResponse = await axios.request({
      method: "GET",
      url: `http://api.hubspot.com/crm/v3/owners/${Ownerid}`,
      headers: {
        authorization: `Bearer ${process.env.HApikey}`,
      },
    });
    var parsedOwner = JSON.parse(stringify(ownerResponse.data));
    OwnerEmail = parsedOwner[2];
    console.log("owner respone" + parsedOwner[2]);
  } catch (e) {
    console.log("error at owner" + e);
  }
  // var dealid=hubspotData.dealId;
  /// to send company cam response to hubspot with hs_object_id

  try {
     companyCamResponse = await axios.request({
      method: "POST",
      url: "https://api.companycam.com/v2/projects",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        X_COMPANYCAM_USER: OwnerEmail,
        authorization: `Bearer ${process.env.CompanyCamToken}`,
      },
      data: {
        name: hubspotData.dealname,
        address: {
          street_address_1: hubspotData.address,
          street_address_2: hubspotData.address2 || "",
          city: hubspotData.city,
          state: hubspotData.state,
          postal_code: hubspotData.postal___zip_code,
          country: hubspotData.country,
        },
        primary_contact: {
          name: `${hubspotData.firstname} ${hubspotData.lastname}`,
          email: hubspotData.email,
          phone_number: hubspotData.phoneNumber || "",
        },
      },
    });
     parsedCompanyResponse= JSON.parse(stringify(companyCamResponse.data));

    console.log("company cam Id " + stringify(parsedCompanyResponse[1]));
    CompanyCamProId = parsedCompanyResponse[1];
    console.log("company cam Response " + stringify(parsedCompanyResponse));
    console.log(
      "urls " +
      parsedCompanyResponse[12] +
        " url pro" +
        parsedCompanyResponse[11] +
        " proID" +
        parsedCompanyResponse[1]
    );
  } catch (e) {
    console.log("error " + e);
  }

  try {
    var labelResponse = await axios.request({
      method: "POST",
      url: `https://api.companycam.com/v2/projects/${CompanyCamProId}/labels`,
      headers: {
        accept: "application/json",
      
          authorization: `Bearer ${process.env.CompanyCamToken}`,
      
        "content-type": "application/json",
      },
      data: { project: { labels: [hubspotData.project_status] } },
    });
    console.log("labelresponse" + labelResponse.data);
  } catch (e) {
    console.log("Error at label api " + e);
  }
   

  try {
    var sendBackResponse = await axios.request({
      method: "PATCH",
      url: `https://api.hubspot.com/crm/v3/objects/deals/${hs_object_id}`,

      data:{properties: {
        project_public_url_companycam: parsedCompanyResponse[12],
        project_url_companycam: parsedCompanyResponse[11],
        project_id_companycam: parsedCompanyResponse[1],
      },},
      headers: {
        authorization: `Bearer ${process.env.HApikey}`,
        "content-type": "application/json",
      },
    });
    console.log("REsponse of SEndBAck to hubspot " + stringify(sendBackResponse.data));
  } catch (e) {
    console.log("Error at sending back to hubspot" + e);
  }
   

});

function saveErrorsToFile(errors) {
  const filePath = path.join(__dirname, 'errors.txt');
  const errorData = errors.join('\n'); // Join errors into a single string with new lines

  fs.writeFile(filePath, errorData, (err) => {
    if (err) {
      return console.error('Error writing to file:', err);
    }
    console.log('Errors saved successfully to errors.txt');
  });
}
rout.post("/creatProCC",async (req,res)=>{
 console.log("create project called "+stringify(req.body))
  hubspotData=req.body;
  
    var companyCamResponse = await axios.request({
     method: "POST",
     url: "https://api.companycam.com/v2/projects",
     headers: {
       accept: "application/json",
       "content-type": "application/json",
       X_COMPANYCAM_USER: "andrew@digitalj2.com",
       authorization: `Bearer ${process.env.CompanyCamToken}`,
     },
     data: {
       name: hubspotData.dealname,
       address: {
         street_address_1: hubspotData.address,
         street_address_2: hubspotData.address2 || "",
         city: hubspotData.city,
         state: hubspotData.state,
         postal_code: hubspotData.postal___zip_code,
         country: hubspotData.country,
       },
       primary_contact: {
         name: `${hubspotData.firstname} ${hubspotData.lastname}`,
         email: hubspotData.email,
         phone_number: hubspotData.phoneNumber || "",
       },
     },
   });
   var  parsedCompanyResponse=JSON.parse(stringify(companyCamResponse.data));
   console.log("company cam Id " +  parsedCompanyResponse[1]);
   CompanyCamProId = parsedCompanyResponse[1];
   console.log("company cam Response " + parsedCompanyResponse[1]);
   console.log(
     "urls " +
     parsedCompanyResponse.data[12] +
       " url pro" +
       parsedCompanyResponse.data[11] +
       " proID" +
       parsedCompanyResponse.data[1]
   );

})
async function getDeal() {
  var ListOfAllDeals = [];
  var Vid;
  var dealResponse = await axios.request({
    method: "GET",

    url: "https://api.hubapi.com/deals/v1/deal/recent/modified",

    headers: {
      accept: "application/json",
      authorization: `Bearer ${process.env.HApikey}`,
    },
  });

  ListOfAllDeals = dealResponse.data.results;

  console.log("deal id at 1 " + stringify(ListOfAllDeals[1].dealId));
  console.log(
    "deal name  at 1 " + stringify(ListOfAllDeals[1].properties.dealname.value)
  );
  console.log(
    "deal stage" + stringify(ListOfAllDeals[1].properties.dealstage.value)
  );
  console.log(
    "deal owner" + stringify(ListOfAllDeals[1].properties.dealstage.value)
  );
  console.log(
    "deal Vid" + stringify(ListOfAllDeals[1].associations.associatedVids[0])
  );

  Vid = ListOfAllDeals[1].associations.associatedVids[0];

  var contactResponse = await axios.request({
    method: "GET",

    url: "https://api.hubapi.com/contacts/v1/contact/vids/batch",
    // https://api.hubapi.com/contacts/v1/contact/vids/batch/?vid=3651
    params: { vid: Vid },

    headers: {
      // accept: "application/json",
      authorization: `Bearer ${process.env.HApikey}`,
    },
  });
  var parsedContactResp = JSON.parse(stringify(contactResponse.data));

  console.log("contact response " + stringify(contactResponse.data));
  console.log("Contact first name: " + stringify(parsedContactResp[149]));
  console.log("Contact address: " + stringify(parsedContactResp[165]));
  console.log(
    "contact city " +
      stringify(parsedContactResp[172] + stringify(parsedContactResp[276]))
  );
  console.log(
    "state/region" +
      stringify(parsedContactResp[270]) +
      stringify(parsedContactResp[156])
  );
  console.log("postal code " + stringify(parsedContactResp[271]));
  console.log("last name " + stringify(parsedContactResp[134]));
  console.log("emai id " + stringify(parsedContactResp[161]));
  console.log(
    "phone number  " +
      stringify(parsedContactResp[273]) +
      stringify(parsedContactResp[138])
  );
  // api.hubspot.com/crm/v3/owners/{ownerId}
  const Ownerid = "136581774";
  try {
    var ownerResponse = await axios.request({
      method: "GET",
      url: `http://api.hubspot.com/crm/v3/owners/${Ownerid}`,
      headers: {
        authorization: `Bearer ${process.env.HApikey}`,
      },
    });
    var parsedOwner = JSON.parse(stringify(ownerResponse.data));
    console.log("owner respone" + parsedOwner[2]);
  } catch (e) {
    console.log("error at owner" + e);
  }

  //api to get owner detail use to get the email and send it at the X_COMPANYCAM_USER  fiel of company cam
  try {
    var companyCamResponse = await axios.request({
      method: "POST",
      url: "https://api.companycam.com/v2/projects",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        X_COMPANYCAM_USER: "andrew@digitalj2.com",
        authorization: `Bearer ${process.env.CompanyCamToken}`,
      },
      data: {
        name: ListOfAllDeals[1].properties.dealname.value,
        address: {
          street_address_1: parsedContactResp[165],
          street_address_2: "test",
          city: parsedContactResp[276],
          state: parsedContactResp[172],
          postal_code: parsedContactResp[271],
          country: parsedContactResp[119],
        },
        primary_contact: {
          name: `${parsedContactResp[149]} ${parsedContactResp[134]}`,
          email: parsedContactResp[161],
          phone_number: parsedContactResp[138],
        },
      },
    });
    console.log("company cam Response " + stringify(companyCamResponse.data));
  } catch (e) {
    console.log("error " + e);
  }
}

rout.get("/getHubspotDeal", async (req, res) => {
  const options = {
    method: "GET",

    url: "https://api.hubapi.com/deals/v1/deal/recent/modified",

    headers: {
      accept: "application/json",
      authorization: `Bearer ${process.env.HApikey}`,
    },
  };
  axios
    .request(options)
    .then(function (response) {
      res.send({ data: response.data, status: 200 });
    })
    .catch(function (error) {
      res.send({ error: error, status: 400 });
    });
});

module.exports = rout;
