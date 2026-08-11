import { useMemo, useState } from 'react'

export const LANGUAGE_OPTIONS = [
  ['en', 'English'],
  ['ja', '日本語'],
  ['ko', '한국어'],
  ['de', 'Deutsch'],
  ['fr', 'français'],
  ['it', 'Italiano'],
  ['es', 'Español'],
  ['ar', 'العربية'],
  ['zh-TW', '繁體中文'],
  ['zh-CN', '简体中文'],
]

const en = {
  language: 'Language', chooseLanguage: 'Choose a language and region',
  welcome: 'Welcome to DXC', username: 'Username', password: 'Password', login: 'Login',
  noAccount: "I don't have an account?", register: 'Register', contact: 'Contact customer service',
  registerEmail: 'Register with email', registerPhone: 'Register with phone number', phone: 'Phone', email: 'Email',
  confirmPassword: 'Confirm Password', verificationCode: 'Verification Code', send: 'Send', signUp: 'Sign-up',
  alreadyAccount: 'Already have an account?', logout: 'Logout', home: 'Home', market: 'Market', cryptoEtf: 'Crypto ETF',
  loan: 'Loan', financial: 'Financial', account: 'Account', hero: 'Explore, learn, and manage 350+ digital assets in one place.',
  application: 'Application', appText: 'A streamlined experience for reviewing account information and managing your profile.',
  assetAccess: 'Digital asset access', assetText: 'Browse supported assets and market information from a responsive interface.',
  statVolume: '24-hour activity', statAssets: 'Assets listed', statUsers: 'Registered users',
  features: 'New features online', demo: 'Operate with a Demo Account', assets: 'Browse assets in one place', loans: 'Digital asset tools',
  getStarted: 'Get started', admin: 'Administration', users: 'Users', status: 'Status', actions: 'Actions', suspended: 'Suspended', active: 'Active',
  suspend: 'Suspend', restore: 'Restore', staff: 'Staff', joined: 'Joined', refresh: 'Refresh',
  invalidLogin: 'Invalid username or password.', codeSent: 'Verification code sent.', accountCreated: 'Account created successfully.',
}

const translations = {
  en,
  fr: {...en, language:'Langue', chooseLanguage:'Choisissez une langue et une région', welcome:'Bienvenue sur DXC', username:"Nom d’utilisateur", password:'Mot de passe', login:'Connexion', noAccount:"Je n’ai pas de compte ?", register:"S’inscrire", contact:'Contacter le service client', registerEmail:"S’inscrire avec e-mail", registerPhone:"S’inscrire avec un numéro de téléphone", phone:'Téléphone', email:'E-mail', confirmPassword:'Confirmer le mot de passe', verificationCode:'Code de vérification', send:'Envoyer', signUp:"S’inscrire", alreadyAccount:'Vous avez déjà un compte ?', logout:'Déconnexion', home:'Accueil', market:'Marché', loan:'Prêt', financial:'Finance', account:'Compte', admin:'Administration'},
  de: {...en, language:'Sprache', chooseLanguage:'Sprache und Region auswählen', welcome:'Willkommen bei DXC', username:'Benutzername', password:'Passwort', login:'Anmelden', noAccount:'Ich habe kein Konto?', register:'Registrieren', contact:'Kundendienst kontaktieren', registerEmail:'Mit E-Mail registrieren', registerPhone:'Mit Telefonnummer registrieren', phone:'Telefon', email:'E-Mail', confirmPassword:'Passwort bestätigen', verificationCode:'Bestätigungscode', send:'Senden', signUp:'Registrieren', alreadyAccount:'Bereits ein Konto?', logout:'Abmelden', home:'Startseite', market:'Markt', loan:'Kredit', financial:'Finanzen', account:'Konto'},
  it: {...en, language:'Lingua', chooseLanguage:'Scegli lingua e regione', welcome:'Benvenuto su DXC', username:'Nome utente', password:'Password', login:'Accedi', noAccount:'Non ho un account?', register:'Registrati', contact:'Contatta il servizio clienti', registerEmail:'Registrati con email', registerPhone:'Registrati con numero di telefono', phone:'Telefono', confirmPassword:'Conferma password', verificationCode:'Codice di verifica', send:'Invia', signUp:'Registrati', alreadyAccount:'Hai già un account?', logout:'Esci', home:'Home', market:'Mercato', loan:'Prestito', financial:'Finanza', account:'Account'},
  es: {...en, language:'Idioma', chooseLanguage:'Elige un idioma y una región', welcome:'Bienvenido a DXC', username:'Usuario', password:'Contraseña', login:'Iniciar sesión', noAccount:'¿No tengo una cuenta?', register:'Registrarse', contact:'Contactar con atención al cliente', registerEmail:'Registrarse con correo', registerPhone:'Registrarse con teléfono', phone:'Teléfono', email:'Correo electrónico', confirmPassword:'Confirmar contraseña', verificationCode:'Código de verificación', send:'Enviar', signUp:'Registrarse', alreadyAccount:'¿Ya tienes una cuenta?', logout:'Cerrar sesión', home:'Inicio', market:'Mercado', loan:'Préstamo', financial:'Finanzas', account:'Cuenta'},
  ja: {...en, language:'言語', chooseLanguage:'言語と地域を選択', welcome:'DXCへようこそ', username:'ユーザー名', password:'パスワード', login:'ログイン', noAccount:'アカウントをお持ちでないですか？', register:'登録', contact:'カスタマーサービスに連絡', registerEmail:'メールで登録', registerPhone:'電話番号で登録', phone:'電話', email:'メール', confirmPassword:'パスワード確認', verificationCode:'認証コード', send:'送信', signUp:'登録', alreadyAccount:'すでにアカウントをお持ちですか？', logout:'ログアウト', home:'ホーム', market:'マーケット', loan:'ローン', financial:'金融', account:'アカウント'},
  ko: {...en, language:'언어', chooseLanguage:'언어 및 지역 선택', welcome:'DXC에 오신 것을 환영합니다', username:'사용자 이름', password:'비밀번호', login:'로그인', noAccount:'계정이 없나요?', register:'회원가입', contact:'고객 서비스 문의', registerEmail:'이메일로 가입', registerPhone:'전화번호로 가입', phone:'전화', email:'이메일', confirmPassword:'비밀번호 확인', verificationCode:'인증 코드', send:'전송', signUp:'회원가입', alreadyAccount:'이미 계정이 있나요?', logout:'로그아웃', home:'홈', market:'마켓', loan:'대출', financial:'금융', account:'계정'},
  ar: {...en, language:'اللغة', chooseLanguage:'اختر اللغة والمنطقة', welcome:'مرحبًا بك في DXC', username:'اسم المستخدم', password:'كلمة المرور', login:'تسجيل الدخول', noAccount:'ليس لدي حساب؟', register:'إنشاء حساب', contact:'اتصل بخدمة العملاء', registerEmail:'التسجيل بالبريد الإلكتروني', registerPhone:'التسجيل برقم الهاتف', phone:'الهاتف', email:'البريد الإلكتروني', confirmPassword:'تأكيد كلمة المرور', verificationCode:'رمز التحقق', send:'إرسال', signUp:'إنشاء حساب', alreadyAccount:'لديك حساب بالفعل؟', logout:'تسجيل الخروج', home:'الرئيسية', market:'السوق', loan:'قرض', financial:'المالية', account:'الحساب'},
  'zh-TW': {...en, language:'語言', chooseLanguage:'選擇語言和地區', welcome:'歡迎來到 DXC', username:'使用者名稱', password:'密碼', login:'登入', noAccount:'我沒有帳戶？', register:'註冊', contact:'聯絡客服', registerEmail:'使用電子郵件註冊', registerPhone:'使用電話號碼註冊', phone:'電話', email:'電子郵件', confirmPassword:'確認密碼', verificationCode:'驗證碼', send:'發送', signUp:'註冊', alreadyAccount:'已有帳戶？', logout:'登出', home:'首頁', market:'市場', loan:'貸款', financial:'金融', account:'帳戶'},
  'zh-CN': {...en, language:'语言', chooseLanguage:'选择语言和地区', welcome:'欢迎来到 DXC', username:'用户名', password:'密码', login:'登录', noAccount:'我没有账户？', register:'注册', contact:'联系客服', registerEmail:'使用电子邮件注册', registerPhone:'使用电话号码注册', phone:'电话', email:'电子邮件', confirmPassword:'确认密码', verificationCode:'验证码', send:'发送', signUp:'注册', alreadyAccount:'已有账户？', logout:'退出登录', home:'首页', market:'市场', loan:'贷款', financial:'金融', account:'账户'},
}

export function useI18n() {
  const [language, setLanguageState] = useState(() => localStorage.getItem('dxc-language') || 'en')
  const setLanguage = (next) => {
    localStorage.setItem('dxc-language', next)
    setLanguageState(next)
    document.documentElement.lang = next
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
  }
  const t = useMemo(() => translations[language] || en, [language])
  return { language, setLanguage, t }
}
