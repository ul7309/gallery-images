const FORM = document.querySelector('.js-form');
const INPUT_VALUE = document.querySelector('.js-input');
const INPUT_FILE = document.querySelector('.js-input-file');
const BTN_UPLOAD = document.querySelector('.js-form-btn');
const GALLERY = document.querySelector('.js-gallery');
const GALLERY_WIDTH = GALLERY.clientWidth;
const ROW_MIN_HEIGHT = 150;

function imageScale() {
  const IMAGES = document.querySelectorAll('.gallery__image');

  const matrix = matrixArray(IMAGES, ROW_MIN_HEIGHT, GALLERY_WIDTH);
  const widthImagesRow = sumWidthImagesRow(matrix);
  const scale = scaleRow(widthImagesRow, GALLERY_WIDTH);
  const newWidthImagesScale = widthImagesScale(matrix, scale);

  setWidthImagesScale(newWidthImagesScale, IMAGES);
}

/* Создаем двумерный массив с 3 элементами в строке */
function matrixArray(images, rowMinHeight, galleryWidth) {
  let buffering = [];
  let matrix = [];

  minWidthImages(images, rowMinHeight).forEach((item) => {
    if (sumWidthImages(item, buffering) > galleryWidth) {
      matrix.push([...buffering]);
      buffering.length = 0;
    }

    buffering.push(item);
  });

  matrix.push([...buffering]);

  return matrix;
}

/* Узнаем сумму элементов на каждом шаге */
function sumWidthImages(item, buffering) {
  return [item, ...buffering].reduce((a, b) => a + b, 0);
}

/* Узнаем сумму ширины картинок в строке */
function sumWidthImagesRow(matrix) {
  return matrix.map((item) => item.reduce((a, b) => a + b, 0));
}

/* Высчитываем scale для каждой строки */
function scaleRow(sumWidthImagesRow, galleryWidth) {
  return sumWidthImagesRow.map((item) => galleryWidth / item);
}

/* Новая ширина изображений */
function widthImagesScale(matrix, scaleRow) {
  return matrix.map((mItem, mIndex) => mItem.map((item) => item * scaleRow[mIndex])).flat();
}

/* Проставляем полученную ширину изображениям */
function setWidthImagesScale(newWidthImagesScale, images) {
  newWidthImagesScale.forEach((item, index) => (images[index].style.width = `${item}px`));
}

/* Массив с минимальной шириной изображений */
function minWidthImages(images, rowMinHeight) {
  return [...images].map(item => {
    let scaleImages = rowMinHeight / item.naturalHeight;
    return scaleImages * item.naturalWidth;
  });
}

/* Пересчет размера изображений при ресайзе */
const ro = new ResizeObserver((entries) => {
  for (let entry of entries) {
    imageScale();
  }
});

ro.observe(GALLERY);

/* Удалить изображение */
function removeImage() {
  this.remove();
  imageScale();
}

/* Создаем элемент img */
function createImageElement(url) {
  let image = document.createElement('img');

  return Object.assign(image, {
    className: 'gallery__image',
    src: url
  });
}

/* Создаем обертку для img */
function createWrapElement() {
  let imageWrap = document.createElement('div');

  return Object.assign(imageWrap, {
    className: 'gallery__wrap-image loading'
  });
}

/* Вставляем изображение */
function insertImage(url) {
  let imageWrap = createWrapElement();
  let image = createImageElement(url);

  GALLERY.append(imageWrap);
  imageWrap.append(image);

  image.addEventListener('load', () => {
    imageWrap.classList.remove('loading');
    imageWrap.addEventListener('click', removeImage);
  });
}

/* Добавляем изображения в галерею по URL */
function addUrlImage() {
  if (!INPUT_VALUE) return false;

  imageScale();
  insertImage(INPUT_VALUE.value);
  formReset();
}

/* Получаем содержимое загруженного файла */
function getUrlFileContent(file, result) {
  file.type === 'application/json'
    ? JSON.parse(result).galleryImages?.forEach((item) => insertImage(item.url))
    : insertImage(result);

  imageScale();
}

/* Добавляем изображения в галерею */
function uploadFile() {
  if (!INPUT_FILE.files.length > 0) return false;

  let file = INPUT_FILE.files[0];
  let reader = new FileReader();

  file.type === 'application/json'
    ? reader.readAsText(file)
    : reader.readAsDataURL(file);

  reader.addEventListener('loadend', () => getUrlFileContent(file, reader.result));

  reader.addEventListener('error', () => console.log(reader.error));

  formReset();
}

function formReset() {
  if (!FORM) return false;

  FORM.reset();
}

function onDrag(event) {
  event.target.parentNode.classList.add('form__drag--draging');
}

function onDrop(event) {
  event.target.parentNode.classList.remove('form__drag--draging');
}

if (BTN_UPLOAD) BTN_UPLOAD.addEventListener('click', addUrlImage);

if (INPUT_FILE) {
  INPUT_FILE.addEventListener('change', uploadFile);
  INPUT_FILE.addEventListener('dragenter', onDrag)
  INPUT_FILE.addEventListener('dragover', onDrag);
  INPUT_FILE.addEventListener('dragleave', onDrop);
  INPUT_FILE.addEventListener('drop', onDrop);
}
