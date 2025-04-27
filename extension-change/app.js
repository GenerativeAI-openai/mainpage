let uploadedFile = null;

function handleFiles(files) {
  uploadedFile = files[0];
  if (!uploadedFile) return;

  const filename = uploadedFile.name;
  document.getElementById('filename').innerText = "선택된 파일: " + filename;
  document.getElementById('options').classList.remove('hidden');

  const ext = getFileExtension(filename).toLowerCase();
  updateDropdown(ext);
}

function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : '';
}

function updateDropdown(ext) {
  const dropdown = document.getElementById('convertType');
  dropdown.innerHTML = '';

  const formats = {
    jpg: ['png', 'webp'],
    jpeg: ['png', 'webp'],
    png: ['jpg', 'webp'],
    webp: ['jpg', 'png']
  };

  const available = formats[ext];
  
  if (available) {
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

  document.getElementById('progress').classList.remove('hidden');

  const reader = new FileReader();
  reader.readAsDataURL(uploadedFile);

  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      let format;
      if (targetExt === 'png') format = 'image/png';
      else if (targetExt === 'jpg') format = 'image/jpeg';
      else if (targetExt === 'webp') format = 'image/webp';
      else {
        alert('지원되지 않는 변환입니다.');
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
  };
}
