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
