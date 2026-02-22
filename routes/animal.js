// routes/animal.js

const express = require('express');
const { createClient } = require('pexels');

// Correctly create a Pexels client instance
const pexelsClient = createClient('goT7jSJYxYoqXLfc0i66CmfxqZ1ty8IeSGEl4qYVvZhDV3NjJT2Ny8ro');

const router = express.Router();

// Local image list
const animalImages = {
  tiger: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Tiger.50.jpg',
  lion: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Lion_waiting_in_Namibia.jpg',
  elephant: 'https://upload.wikimedia.org/wikipedia/commons/3/37/African_Bush_Elephant.jpg',
  pixelclass: 'https://ik.imagekit.io/pxc/pixel%20class%20fav-02.png?updatedAt=1735069173555',
  mann: 'https://ik.imagekit.io/pxc/t-man-removebg.png?updatedAt=1737288208061',
  man: 'https://ik.imagekit.io/pxc/t-man-removebg.png?updatedAt=1737288208061'
};

const vehicleImages = {
  car: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/2018_Toyota_Corolla_Icon_Tech_VVT-i_HEV_CVT_1.8.jpg',
  bike: 'https://upload.wikimedia.org/wikipedia/commons/5/58/2009-03-01_White_motorcycle.jpg',
  bicycle: 'https://upload.wikimedia.org/wikipedia/commons/3/39/City_bicycle_in_Melbourne.jpg',
  bus: 'https://upload.wikimedia.org/wikipedia/commons/1/17/2016_New_Flyer_XN40_CNG.jpg',
  truck: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Freightliner_Cascadia_Sleeper_Cab.jpg',
  scooter: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Honda_Activa_125.jpg',
  "MARUTI SWIFT VDI  BSIV" : 'https://cdn1.acedms.com/w709/photos/listing/2022-04-14/58ef3bac3064e9fff90e47d9fab177d4_extra_large.jpg.webp'

};

async function redirectFromPexels(res, query) {
  try {
    const result = await pexelsClient.photos.search({
      query,
      per_page: 1
    });

    if (result.photos && result.photos.length > 0) {
      const photo = result.photos[0];
      const imgUrl = photo.src.large2x || photo.src.original;
      return res.redirect(imgUrl);
    }
    return res.status(404).send('No image found for this');
  } catch (err) {
    console.error('Error fetching image from Pexels:', err.message);
    return res.status(500).send('Internal Server Error');
  }
}

// GET /api/animal/vehicle/:name
router.get('/vehicle/:name', async (req, res) => {
  const vehicleName = req.params.name.toLowerCase();

  // Check local vehicle images
  if (vehicleImages[vehicleName]) {
    return res.redirect(vehicleImages[vehicleName]);
  }

  return redirectFromPexels(res, `${vehicleName} vehicle`);
});

// GET /api/animal/:name
router.get('/:name', async (req, res) => {
  const animalName = req.params.name.toLowerCase();

  // Check local animal images
  if (animalImages[animalName]) {
    return res.redirect(animalImages[animalName]);
  }

  return redirectFromPexels(res, animalName);
});

module.exports = router;
