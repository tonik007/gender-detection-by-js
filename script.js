const imageUpload = document.getElementById('imageUpload');
const uploadedImage = document.getElementById('uploadedImage');
const overlay = document.getElementById('overlay');

// Load models from local ./models folder
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.ageGenderNet.loadFromUri('./models')
]).then(() => {
  console.log("✅ Models loaded");
});

imageUpload.addEventListener('change', async () => {
  const file = imageUpload.files[0];
  if (!file) {
    alert("Please select an image.");
    return;
  }

  // Read file as base64 URL
  const reader = new FileReader();
  reader.onload = function () {
    uploadedImage.src = reader.result;
  };
  reader.readAsDataURL(file);
});

uploadedImage.addEventListener('load', async () => {
  // Adjust canvas size
  overlay.width = uploadedImage.width;
  overlay.height = uploadedImage.height;

  const detections = await faceapi
    .detectAllFaces(uploadedImage, new faceapi.TinyFaceDetectorOptions())
    .withAgeAndGender();

  const resizedDetections = faceapi.resizeResults(detections, {
    width: uploadedImage.width,
    height: uploadedImage.height
  });

  const ctx = overlay.getContext('2d');
  ctx.clearRect(0, 0, overlay.width, overlay.height);

  resizedDetections.forEach(detection => {
    const box = detection.detection.box;
    const gender = detection.gender;
    const probability = (detection.genderProbability * 100).toFixed(1);
    const label = `${gender} (${probability}%)`;

    ctx.strokeStyle = '#DE2000';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    ctx.fillStyle = '#008000';
    ctx.font = '16px Arial';
    ctx.fillText(label, box.x, box.y > 20 ? box.y - 5 : box.y + 15);
  });
});
