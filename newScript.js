const ID_REFERENCE_IMG_INPUT = "input-reference-image";
const ID_QUERY_IMG_INPUT = "input-query-image";

document.querySelector('body').style.display = 'none';

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then( initPageUi );

async function findBestMatchFromQueryImage(queryImage) {
    try {
        if (!queryImage) throw "Invalid query image";

        const results = await faceapi
  		    .detectAllFaces(queryImage)
            .withFaceLandmarks()
            .withFaceDescriptors();

        // Get facematcher using reference image
        const imageElement = await getLoadedImage(ID_REFERENCE_IMG_INPUT);
        const faceMatcher = await getFaceMatcherFromReferenceImage(imageElement);

        let bestMatchString = "";
        results.forEach(detection => {
            const bestMatch = faceMatcher.findBestMatch(detection.descriptor)
            bestMatchString = bestMatch.toString();
        });

        return bestMatchString;

    } catch (error) {
        console.log(`FindBestMatchFromQueryImage: ${error}`);
    }
}

/**
 * Takes in an HTMLImageElement and returns a FaceMatcher object with appropriate descriptors
 * 
 * @param {HTMLImageElement} referenceImage
 * @returns {FaceMatcher} - a FaceMatcher
 */
async function getFaceMatcherFromReferenceImage(referenceImage) {
    try {
        if (!referenceImage) throw "Invalid reference image";

        const results = await faceapi
            .detectAllFaces(referenceImage)
            .withFaceLandmarks()
            .withFaceDescriptors();

        if (!results.length) return;

        return new faceapi.FaceMatcher(results);

    } catch (error) {
        console.log(`GetFaceMatcherFromReferenceImage: ${error}`);

    }
}

/**
 * Loads the image from the Input element into the Target element
 * 
 * @param {string} inputElementId the input element that contains the selected image.
 * @param {string} targetElementId the target element where the image is to be displayed.
 */
async function loadImageIntoTarget(inputElementId, targetElementId) {    
    try {
        const targetImgElement = document.getElementById(targetElementId);

        if (
            inputElementId != ID_REFERENCE_IMG_INPUT && 
            inputElementId != ID_QUERY_IMG_INPUT
        ) throw "Invalid input element id.";

        if (!targetImgElement) throw "Invalid target element id."

        const currentlyLoadedImage = await getLoadedImage(inputElementId);
        targetImgElement.src = currentlyLoadedImage.src;

    } catch (error) {
        console.log(`LoadImageIntoTarget: ${error}`);
    }
}

/**
 * Gets the loaded image from the input element and returns an image
 * 
 * @param {string} imageInputElementId the input element that contains the selected image.
 * @returns {Promise<HTMLImageElement>} a HTMLImageElement image
 */
async function getLoadedImage(imageInputElementId) {
    const LoadedImageBlob = document.getElementById(imageInputElementId).files[0];
    return await faceapi.bufferToImage(LoadedImageBlob);
}

async function initPageUi() {
    document.querySelector('body').style.display = 'grid';
}

async function doAfterRefImageLoaded() {

    // const imageElement = await getLoadedImage(ID_REFERENCE_IMG_INPUT);

    // const facematcher = await getFaceMatcherFromReferenceImage(imageElement);

    // console.log(facematcher);
}



async function doAfterQueryImageLoaded(){
    const imageElement = await getLoadedImage(ID_QUERY_IMG_INPUT);
    const bestMatchString = await findBestMatchFromQueryImage(imageElement);

    console.log(bestMatchString);
}