const { format, parse } = require('date-fns');
const cloudinary = require('../config/cloudinary');

async function uploadImage(imagePath, username) {
  const options = {
    asset_folder: 'members-only-user-images',
    resource_type: 'image',
    public_id: username,
    overwrite: true,
    allowed_formats: ['png', 'jpg', 'jpeg', 'webp'],
    transformation: [
      // tranform on upload to save space
      { width: 300, height: 300, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  };

  const result = await cloudinary.uploader.upload(imagePath, options);
  console.log(result);
}

async function uploadImageBuffer(buffer, username) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'members-only-user-images',
        public_id: username,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
        allowed_formats: ['png', 'jpg', 'jpeg', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }], // transform on upload to save space
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

function getImageUrlSm(username, version) {
  return cloudinary.url(`members-only-user-images/${username}`, {
    version, // needed to update pic when user uploads new image
    analytics: false,
    transformation: [
      { width: 80, height: 80, gravity: 'faces', crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
}

function getImageUrlLg(username, version) {
  return cloudinary.url(`members-only-user-images/${username}`, {
    version, // needed to update pic when user uploads new image
    analytics: false,
    transformation: [
      { width: 300, height: 300, gravity: 'faces', crop: 'fill' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });
}

function formatDate(date, use = 'timestamp') {
  if (use === 'timestamp') {
    return format(new Date(date), 'hh:mm aaa · M/d/yy');
  }
  if (use === 'birthday') {
    // Parse date-only string without timezone conversion
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    return format(parsedDate, 'MMM do, y');
  }
  return date;
}

module.exports = {
  formatDate,
  uploadImage,
  uploadImageBuffer,
  getImageUrlSm,
  getImageUrlLg,
};
