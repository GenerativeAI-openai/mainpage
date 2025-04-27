let uploadedFile = null;

function handleFiles(files) {
  uploadedFile = files[0];
  document.getElementById('filename').innerText = "선택된 파일: " + uploadedFile.name;
  document.getElementById('options').classList.remove('hidden');
}

function convertFile() {
  if (!uploadedFile) return;
  
  const type = document.getElementById('convertType').value;
  document.getElementById('progress').classList.remove('hidden');

  if (type === 'jpg2png' || type === 'png2jpg') {
    convertImage(uploadedFile, type);
  } else {
    alert("이 변환은 곧 지원됩니다!");
    document.getElementById('progress').classList.add('hidden');
  }
}

function convertImage(file, type) {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      let format = (type === 'jpg2png') ? 'image/png' : 'image/jpeg';
      canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.download = 'converted.' + (type === 'jpg2png' ? 'png' : 'jpg');
        document.getElementById('download').classList.remove('hidden');
        document.getElementById('progress').classList.add('hidden');
      }, format);
    };
  };
}

function shareSNS(platform) {
  const url = location.href;
  if (platform === 'kakao') {
    window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}`);
  } else if (platform === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=빠른 파일 변환기!`);
  } else if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  }
}
