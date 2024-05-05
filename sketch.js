let classifier;
let img;
let resultDiv;
let classifyButton;
let correctButton;
let incorrectButton;
let dropZone;

function setup() {
  noCanvas();
  
  dropZone = select('#drop_zone');
  dropZone.dragOver(highlight);
  dropZone.dragLeave(unhighlight);
  dropZone.drop(gotFile, displayImage);
  
  resultDiv = select('#result');

  classifyButton = select('#classifyButton');
  classifyButton.mousePressed(classifyImage);

  correctButton = select('#correctButton');
  correctButton.mousePressed(() => { saveClassification(true); });

  incorrectButton = select('#incorrectButton');
  incorrectButton.mousePressed(() => { saveClassification(false); });

  classifier = ml5.imageClassifier('MobileNet', () => {
    console.log('Image Classifier geladen.');
  });
}

function gotFile(file) {
  if (file.type === 'image') {
    img = createImg(file.data, 'Uploaded Image', '', displayImage);
    img.hide();
  } else {
    console.log('Es wurde keine Bilddatei hochgeladen.');
  }
}

function displayImage() {
  img.show();
  img.size(200, 200);
  select('#imageContainer').html(img);
  select('#classifyButton').style('display', 'inline');
}

function classifyImage() {
  if (img) {
    classifier.classify(img.elt, gotResult);
  } else {
    console.log('Es wurde noch kein Bild hochgeladen.');
  }
}

function gotResult(error, results) {
  if (error) {
    console.error(error);
  } else {
    let confidenceBar = select('#confidenceBar');
    confidenceBar.style('width', `${results[0].confidence * 200}px`);
    confidenceBar.html(`${nf(results[0].confidence * 100, 0, 2)}%`);
    resultDiv.html(`<strong>Label:</strong> ${results[0].label}<br><strong>Confidence:</strong> ${nf(results[0].confidence * 100, 0, 2)}%`);
    select('#correctButton').style('display', 'inline');
    select('#incorrectButton').style('display', 'inline');
  }
}

function saveClassification(isCorrect) {
  if (img) {
    let data = {
      label: resultDiv.elt.textContent.split(':')[1].trim(),
      confidence: parseFloat(resultDiv.elt.textContent.split(':')[3].trim()),
      thumbnailUrl: img.elt.src,
      isCorrect: isCorrect
    };

    let classificationsKey = isCorrect ? 'correctClassifications' : 'incorrectClassifications';
    let classifications = JSON.parse(localStorage.getItem(classificationsKey)) || [];
    classifications.push(data);
    localStorage.setItem(classificationsKey, JSON.stringify(classifications));

    loadLastClassifications();
  } else {
    console.log('Es wurde noch kein Bild hochgeladen.');
  }
}

function highlight() {
  dropZone.style('background-color', '#eee');
}

function unhighlight() {
  dropZone.style('background-color', '');
}

window.ondragover = function (e) {
  e.preventDefault();
  return false;
};

window.ondrop = function (e) {
  e.preventDefault();
  return false;
};

window.onload = loadLastClassifications;
