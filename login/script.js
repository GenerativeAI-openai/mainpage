const nicknameInput = document.getElementById("nickname");
const passwordInput = document.getElementById("password");
const nickMsg = document.getElementById("nick-msg");
const pwMsg = document.getElementById("pw-msg");
const submitBtn = document.getElementById("submit-btn");

// 기존 닉네임 및 비밀번호 검증 (간단화 버전)
nicknameInput.addEventListener("input", validate);
passwordInput.addEventListener("input", validate);

function validate() {
  const nickname = nicknameInput.value.trim();
  const password = passwordInput.value.trim();

  let valid = true;
  if (nickname.length < 2) {
    nickMsg.textContent = "닉네임은 2자 이상이어야 해요.";
    valid = false;
  } else {
    nickMsg.textContent = "";
  }

  const errors = [];
  if (password.length < 6) errors.push("비밀번호는 6자 이상이어야 합니다.");
  if (!/[0-9]/.test(password)) errors.push("숫자가 포함되어야 합니다.");
  if (!/[A-Z]/.test(password)) errors.push("대문자가 필요합니다.");
  if (!/[!@#$%^&*]/.test(password)) errors.push("특수문자를 포함해야 합니다.");

  if (errors.length > 0) {
    pwMsg.innerHTML = errors.map(e => "• " + e).join("<br>");
    valid = false;
  } else {
    pwMsg.textContent = "";
  }

  submitBtn.disabled = !valid;
}

// 이미지 기반 CAPTCHA
const captchaImagesPool = [
  { url: "https://i.ibb.co/yXc0KZ3/human1.jpg", isHuman: true },
  { url: "https://i.ibb.co/0sW2QZ6/robot1.png", isHuman: false },
  { url: "https://i.ibb.co/g7R7Sgj/robot2.png", isHuman: false },
  { url: "https://i.ibb.co/T4f6w98/robot3.png", isHuman: false },
  { url: "https://i.ibb.co/D7Q2xg8/robot4.png", isHuman: false },
  { url: "https://i.ibb.co/ZVj4KY8/robot5.png", isHuman: false },
  { url: "https://i.ibb.co/5YHh9fp/robot6.png", isHuman: false },
  { url: "https://i.ibb.co/FKtqTHL/robot3.jpg", isHuman: false },
];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

submitBtn.addEventListener("click", () => {
  const shuffled = shuffle([...captchaImagesPool]);
  const selected = shuffled.slice(0, 6);
  const humanIndex = Math.floor(Math.random() * 6);
  selected[humanIndex] = captchaImagesPool.find(img => img.isHuman); // 강제 삽입

  const container = document.getElementById("captcha-images");
  container.innerHTML = "";

  selected.forEach(item => {
    const img = document.createElement("img");
    img.src = item.url;
    img.onclick = () => {
      if (item.isHuman) {
        alert("✅ 인증 완료! 인간이 맞습니다.");
        closeCaptcha();
      } else {
        document.getElementById("captcha-error").textContent = "❌ 틀렸습니다. 다시 시도하세요.";
      }
    };
    container.appendChild(img);
  });

  document.getElementById("captcha-popup").style.display = "block";
  document.getElementById("captcha-error").textContent = "";
});

function closeCaptcha() {
  document.getElementById("captcha-popup").style.display = "none";
}
