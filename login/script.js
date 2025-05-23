  const nicknameInput = document.getElementById("nickname");
const passwordInput = document.getElementById("password");
const nickMsg = document.getElementById("nick-msg");
const pwMsg = document.getElementById("pw-msg");
const submitBtn = document.getElementById("submit-btn");

const existingNicknames = ["고양이", "guest123", "admin", "pikachu", "hello123"];
const funnyNames = ["멍때리기장인", "라면은물조절", "꿀잠러", "말이되는소리", "포켓몬조련사"];

nicknameInput.addEventListener("input", validate);
passwordInput.addEventListener("input", validate);
function check_recaptcha(){
  var v = grecaptcha.getResponse();
  if (v.length ==0) {
    submitBtn.disabled = true;
    return false;
  } else {
    location.reload();
    return true;
  }
}
function suggestNickname() {
  const random = funnyNames[Math.floor(Math.random() * funnyNames.length)];
  nicknameInput.value = random;
  validate();
}
function disassembleHangul(str) {
  const onset = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ",
                 "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  const nucleus = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ",
                   "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
  const coda = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ",
                "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ",
                "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  const result = [];

  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    if (ch >= 0xAC00 && ch <= 0xD7A3) {
      const syllableIndex = ch - 0xAC00;
      const onsetIndex = Math.floor(syllableIndex / (21 * 28));
      const nucleusIndex = Math.floor((syllableIndex % (21 * 28)) / 28);
      const codaIndex = syllableIndex % 28;
      result.push(onset[onsetIndex], nucleus[nucleusIndex]);
      if (coda[codaIndex]) result.push(coda[codaIndex]);
    } else {
      result.push(str[i]); // 영문자, 숫자 등은 그대로
    }
  }

  return result;
}
function isSubsequence(smallArr, bigArr) {
  let idx = 0;
  for (let i = 0; i < bigArr.length && idx < smallArr.length; i++) {
    if (smallArr[idx] === bigArr[i]) {
      idx++;
    }
  }
  return idx === smallArr.length;
}

function getLevenshteinDistance(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
    Array.from({ length: a.length + 1 }, (_, j) => j === 0 ? i : j === 0 ? i : 0)
  );

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (a[j - 1] === b[i - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function similarity(a, b) {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  const distance = getLevenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (1 - distance / longer.length);
}

function validate() {
  const nickname = nicknameInput.value.trim();
  const password = passwordInput.value;
  let valid = true;

  const taboo = [
    { word: "예쁜", message: "😏 당신은 예쁘지 않습니다 ㅋ" },
    { word: "예뻐", message: "😏 당신은 예쁘지 않습니다 ㅋ" },
    { word: "귀여운", message: "😏 당신은 1도 귀엽지 않습니다 ㅋ" },
    { word: "귀요미", message: "😏 당신은 기요미 아닙니다 ㅋ" },
    //{ word: "예뻐", message: "자기애가 넘치시네요. 하지만 시스템은 속지 않아요!" },
    { word: "잘생김", message: "그렇게 잘생기셨다구요? 글쎄요... 😏" },
    { word: "관리자", message: "관리자는 아무나 되는 게 아니에요~" },
    { word: "admin", message: "admin? 꿈도 꾸지 마세요." },
    // { word: "ㅂㅅ", message: "입 좀 조심해주세요. 저희는 착한 사이트입니다" },
    // { word: "fuck", message: "그런 단어는 NO! 😡" },
    // { word: "sh1t", message: "그건 안돼요... 👀" }
  ];
  if (nickname) {
    for (const item of taboo) {
      const userJamo = disassembleHangul(nickname.toLowerCase());
      const tabooJamo = disassembleHangul(item.word.toLowerCase());

      if (isSubsequence(tabooJamo, userJamo)) {
        nickMsg.textContent = item.message;
        submitBtn.disabled = true;
        return;
      }
    }
  } else {
    nickMsg.textContent = "닉네임을 입력하세요.";
    submitBtn.disabled = true;
  }

  if (existingNicknames.includes(nickname)) {
    nickMsg.textContent = "이미 사용 중인 닉네임입니다.";
    valid = false;
  } else if (nickname.length < 2) {
    nickMsg.textContent = "닉네임은 2자 이상이어야 해요!";
    valid = false;
  } else {
    nickMsg.textContent = "";
  }
//!Ab1
  const errors = [];
  if (password.length < 4) errors.push("짧아요… 너무 짧아서 마음이 아파요 😢");//너무 짧아요 (8자 이상)
  if (!/[A-Z]/.test(password)) errors.push("대문자가 없어요. 혹시 CAPS LOCK 고장났나요?");//대문자 1개는 넣어줘야죠
  if (!/[a-z]/.test(password)) errors.push("소문자도 있어야 합니다~");//소문자도 있어야 합니다~
  if (!/[0-9]/.test(password)) errors.push("숫자도 친구예요. 얘도 넣어줘요");//숫자도 하나쯤?
  if (!/[!@#$%^&*()]/.test(password)) errors.push("특수문자 없이 살 수 있다고 생각해요? 세상은 그렇게 쉽지 않아요");//특수문자가 안 보이네요?
  if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(password)) errors.push("한글은 비밀번호로 쓰기엔 너무 아름다워요. 안 돼요 💔");//한글은 비밀번호로 쓰면 안돼요 😅
  if (["password", "12345678", "qwerty"].some(p => password.toLowerCase().includes(p))) {
    errors.push("이건 너무 흔한 비밀번호 아닌가요?");//이건 너무 흔한 비밀번호 아닌가요?
  }
  if (password.length > 4) {
     errors.push("길어요… 너무 길어서 가슴이 찢어져요 😢");
  }

  if (errors.length > 0) {
    //pwMsg.textContent = ""
    // for (i = 0; i < errors.length; i ++) {
    //   pwMsg.textContent += `${errors[i]}\n`;
    // }
    //pwMsg.textContent = errors.join("");
    pwMsg.innerHTML = errors.map(e => "• " + e).join("<br>");//"비밀번호 문제:<br>" + errors.map(e => "• " + e).join("<br>");
    valid = false;
  } else {
    pwMsg.textContent = "";
  }
  var v = grecaptcha.getResponse();
  if (v.length ==0) {
    valid = true;
  }
  submitBtn.disabled = !valid;
}
document.addEventListener("DOMContentLoaded", check_recaptcha())
document.addEventListener("click", check_recaptcha())
