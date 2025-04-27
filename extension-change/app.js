function updateDropdown(ext) {
  const dropdown = document.getElementById('convertType');
  dropdown.innerHTML = '';

  const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'svg'];
  const docFormats = ['pdf', 'doc', 'docx', 'txt'];
  const videoFormats = ['mp4', 'webm', 'avi'];

  let available = [];

  if (imageFormats.includes(ext)) {
    available = imageFormats.filter(f => f !== ext);

    // 특별 추가 (단, 중복 방지)
    if (ext === 'gif' && !available.includes('svg')) available.push('svg');
    if (ext === 'svg' && !available.includes('gif')) available.push('gif');
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
      if (ext === 'gif' && targetExt === 'svg') {
        gifToSvg(e.target.result);
      } else if (ext === 'svg' && targetExt === 'gif') {
        svgToGif(e.target.result);
      } else {
        convertImage(e.target.result, targetExt);
      }
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

// GIF -> SVG 변환 함수 (base64 이미지로 감싼 SVG 생성)
function gifToSvg(dataURL) {
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
  <image href="${dataURL}" width="100%" height="100%"/>
</svg>
`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.getElementById('downloadLink');
  downloadLink.href = url;
  downloadLink.download = `converted.svg`;

  document.getElementById('download').classList.remove('hidden');
  document.getElementById('progress').classList.add('hidden');
}

// SVG -> GIF 변환 함수 (단순히 이미지로 렌더링해서 GIF 저장)
function svgToGif(dataURL) {
  const img = new Image();
  img.src = dataURL;
  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(function(blob) {
      const url = URL.createObjectURL(blob);
      const downloadLink = document.getElementById('downloadLink');
      downloadLink.href = url;
      downloadLink.download = `converted.gif`;

      document.getElementById('download').classList.remove('hidden');
      document.getElementById('progress').classList.add('hidden');
    }, 'image/gif');
  };
}
