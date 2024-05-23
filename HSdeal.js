const express = require("express");
const axios = require("axios");
require("dotenv").config();
const { stringify } = require("flatted");

async function GetDeal()
{
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
}