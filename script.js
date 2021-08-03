const imageUpload = document.getElementById('imageUpload')

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(start)

async function start() {
  const container = document.createElement('div');
  container.style.position = 'relative';
  document.body.append(container);

  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)

  let image, canvas;
  
  document.body.append('Finished loading all content')

  imageUpload.addEventListener('change', async () => {

    // Clear the container before loading a new image
    if (image) {
      image.remove();
      canvas.remove();
    }

    // Convert the uploaded data to an image
    image = await faceapi.bufferToImage(imageUpload.files[0]);
    container.append(image);

    // Create the canvas and set its dimensions
    canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);

    const displaySize = { 
      width: image.width, 
      height: image.height 
    }

    faceapi.matchDimensions(canvas, displaySize);

    // Detect faces from the uploaded image
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));

    // Iterate over the detected faces and draw boxes
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box;
      const drawBox = new faceapi.draw.DrawBox(box, { 
        label: result.toString() 
      });
      drawBox.draw(canvas);
    })
  })
}

function loadLabeledImages() {
  const labels = ['Danyl', 'Joel']

  return Promise.all(
    labels.map(async label => {
      const descriptions = []

      const img = await faceapi.fetchImage(`https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/labeled_images/${label}/1.jpg`)
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
      descriptions.push(detections.descriptor)

      return new faceapi.LabeledFaceDescriptors(label, descriptions)
    })
  )
}
