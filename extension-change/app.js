let uploadedFile = null;
let pyodideReadyPromise = loadPyodide({
    indexURL : "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
});

async function runPython(gifBytes) {
    let pyodide = await pyodideReadyPromise;
    await pyodide.loadPackage("micropip");

    await pyodide.runPythonAsync(`
import micropip
try:
    await micropip.install('Pillow')
except:
    pass
`);

    const code = `
import base64
from io import BytesIO
from PIL import Image, ImageSequence

gif_bytes = bytes(gif_bytes)

def image_to_base64(image):
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

def gif_to_svg(gif_bytes):
    gif = Image.open(BytesIO(gif_bytes))
    frames = [frame.copy() for frame in ImageSequence.Iterator(gif)]
    total_duration = sum(frame.info.get('duration', 100) for frame in frames) / 1000.0

    frames_base64 = [image_to_base64(frame) for frame in reversed(frames)]

    svg_images = "".join([
        f'<image id="frame{i}" xlink:href="data:image/png;base64,{base64_str}" x="0" y="0" '
        f'height="{gif.height}px" width="{gif.width}px" style="opacity:0;"/>'
        for i, base64_str in enumerate(frames_base64)
    ])

    animations_css = "".join([
        f"""#frame{i} {{
            animation: play {total_duration}s steps(1) infinite;
            animation-delay: {-i * (total_duration / len(frames))}s;
        }}"""
        for i in range(len(frames))
    ])

    keyframes_css = f"""
    @keyframes play {{
        0%, 100% {{ opacity: 0; }}
        {"; ".join([f"{(100/len(frames))*i}% {{ opacity: 1; }}" for i in range(len(frames))])}
        {"; ".join([f"{(100/len(frames))*i}% {{ opacity: 0; }}" for i in range(1, len(frames)+1)])}
    }}
    """

    svg_content = f"""<svg width="{gif.width}px" height="{gif.height}px" viewBox="0 0 {gif.width} {gif.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <style>
        {animations_css}
        {keyframes_css}
    </style>
    {svg_images}
    </svg>
    """
    return svg_content

converted_svg = gif_to_svg(gif_bytes)
converted_svg
`;

    pyodide.globals.set("gif_bytes", gifBytes);
    let svg_content = await pyodide.runPythonAsync(code);
    return svg_content;
}

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

function addOption(dropdown, value, label) {
  const option = document.createElement('option');
  option.value = value;
  option.text = label;
  dropdown.appendChild(option);
}

async function convertFile() {
  if (!uploadedFile) return;

  const targetExt = document.getElementById('convertType').value;
  if (!targetExt) {
    alert("변환할 확장자를 선택하세요.");
    return;
  }

  const reader = new FileReader();
  reader.readAsArrayBuffer(uploadedFile);

  document.getElementById('progress').classList.remove('hidden');

  reader.onload = async function (e) {
    const arrayBuffer = e.target.result;
    const bytes = new Uint8Array(arrayBuffer);

    const ext = getFileExtension(uploadedFile.name).toLowerCase();
    const imgExts = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'svg'];

    if (ext === 'gif' && targetExt === 'svg') {
      const svgContent = await runPython(bytes);
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      const downloadLink = document.getElementById('downloadLink');
      downloadLink.href = url;
      downloadLink.download = `converted.svg`;

      document.getElementById('download').classList.remove('hidden');
      document.getElementById('progress').classList.add('hidden');
    } else {
      alert('GIF → SVG 외 변환은 기존 방식(canvas)으로 계속 사용합니다.');
      document.getElementById('progress').classList.add('hidden');
    }
  };
}
