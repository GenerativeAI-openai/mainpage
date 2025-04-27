let uploadedFile = null;

function handleFiles(files) {
  uploadedFile = files[0];
  if (!uploadedFile) return;

  const filename = uploadedFile.name;
  showFilePreview(filename);
  document.getElementById('options').classList.remove('hidden');

  const ext = getFileExtension(filename).toLowerCase();
  updateDropdown(ext);
}

function showFilePreview(filename) {
  const preview = document.getElementById('file-preview');
  preview.innerHTML = `선택한 파일: <strong>${filename}</strong>`;
  preview.classList.remove('hidden');
}

function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : '';
}

function updateDropdown(ext) {
  const dropdown = document.getElementById('convertType');
  dropdown.innerHTML = '';

  const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'svg'];
  const docFormats = ['pdf', 'doc', 'docx', 'txt'];
  const videoFormats = ['mp4', 'webm', 'avi'];

  let available = [];

  if (imageFormats.includes(ext)) {
    available = imageFormats.filter(f => f !== ext);

    // gif -> svg, svg -> gif 특별 추가
    if (ext === 'gif') available.push('svg');
    if (ext === 'svg') available.push('gif');
  } else if (docFormats.includes(ext)) {
    available = docFormats.filter(f => f !== ext);
  } else if (videoFormats.includes(ext)) {
    available = videoFormats.filter(f => f !== ext);
  }

  if (available.length > 0) {
    available.forEach(target => {
      addOption(dropdown, target, target.toUpperCase());
    });
  } else {
    addOption(dropdown, '', '지원되지 않는 파일 형식');
  }
}

function addOption(dropdown, value, label) {
  const option = document.createElement('option');
  option.value = value;
  option.text = label;
  dropdown.appendChild(option);
}

function convertFile() {
  if (!uploadedFile) return;

  const targetExt = document.getElementById('convertType').value;
  if (!targetExt) {
    alert("변환할 확장자를 선택하세요.");
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(uploadedFile);

  document.getElementById('progress').classList.remove('hidden');

  reader.onload = function (e) {
    const ext = getFileExtension(uploadedFile.name).toLowerCase();
    const imgExts = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'svg'];

    if (imgExts.includes(ext) && imgExts.includes(targetExt)) {
      convertImage(e.target.result, targetExt);
    } else {
      alert('현재는 이미지 파일만 브라우저 안에서 변환할 수 있습니다. (문서/영상 변환은 지원 예정)');
      document.getElementById('progress').classList.add('hidden');
    }
  };
}

function convertImage(dataURL, targetExt) {
  const img = new Image();
  img.src = dataURL;
  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    let format;
    if (targetExt === 'png') format = 'image/png';
    else if (targetExt === 'jpg' || targetExt === 'jpeg') format = 'image/jpeg';
    else if (targetExt === 'webp') format = 'image/webp';
    else if (targetExt === 'bmp') format = 'image/bmp';
    else if (targetExt === 'gif') format = 'image/gif';
    else if (targetExt === 'svg') {
      alert('SVG로 변환은 아직 직접 변환 지원하지 않습니다.');
      document.getElementById('progress').classList.add('hidden');
      return;
    }
    else {
      alert('지원되지 않는 변환입니다.');
      document.getElementById('progress').classList.add('hidden');
      return;
    }

    canvas.toBlob(function(blob) {
      const url = URL.createObjectURL(blob);
      const downloadLink = document.getElementById('downloadLink');
      downloadLink.href = url;
      downloadLink.download = `converted.${targetExt}`;
      document.getElementById('download').classList.remove('hidden');
      document.getElementById('progress').classList.add('hidden');
    }, format);
  };
}
