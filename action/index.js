
const { External, KeyValueStore } = require('mydaco');

const API_KEY = '00000000-0000-0000-0000-000000000002'

exports.main = function (call) {
  const message = 'This is just a fallback';
  return { html: message };
};

const filterSelection = (selectionObject) => {
  console.log(selectionObject)
  let foundKey;
  Object.entries(selectionObject).forEach(([key, value]) => {
    console.log(key, value);
    if (value === true) {
      foundKey = key;
    }
  })
  return foundKey;
}

exports.ServiceMarketplace = {};

exports.Widget = {};

exports.Widget.getPerimeterPrice = async function (params) {
  try {
    const keyList = ['modusSelection', 'perimeterCoords-latitude', 'perimeterCoords-longitude', 'gasSelection', 'rad']

    const promises = [
      KeyValueStore.get({ key: '_component__mdc-selection_modusSelection_value' }),
      KeyValueStore.get({ key: '_component__mdc-input_perimeterCoords-latitude_value' }),
      KeyValueStore.get({ key: '_component__mdc-input_perimeterCoords-longitude_value' }),
      KeyValueStore.get({ key: '_component__mdc-selection_gasSelection_value' }),
      KeyValueStore.get({ key: '_component__mdc-input_rad_value' }),
    ];
    const results = await Promise.all(promises);

    const resultObj = {};
    results.forEach((res, index) => {
      resultObj[keyList[index]] = res.value;
    });

    const gasType = filterSelection(resultObj.gasSelection);
    console.log(gasType);

    const config = {
      verb: 'GET',
      url: `https://creativecommons.tankerkoenig.de/json/list.php`,
      query: {
        lat: resultObj['perimeterCoords-latitude'],
        lng: resultObj['perimeterCoords-longitude'],
        apikey: API_KEY,
        rad: resultObj.rad,
        sort: 'price',
        type: gasType
      }
    };

    const res = await External.request(config);

    return { bestPrice: res.body.stations[0] };
  } catch (e) {
    console.log(e);
    return { e };
  }
}
