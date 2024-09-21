const resource = {
  hello: "translated hello",
  name: "Ali Burhan Keskin",
  confirm: "Onayla",
  cancel: "İptal",
  generalActivityIndicatorText: "Yükleniyor...",
  pleaseWait: "Lütfen Bekleyiniz... ",
  generalErrorText: "Bir hata oluştu lütfen daha sonra tekrar deneyiniz.",
  search: "Ara",
  noInternet: "İnternet bağlantısı yok",
  yes: "Evet",
  no: "Hayır",
  exit: "Çıkış",
  brand: "Marka",
  published: "Yayında",
  min: "dk",
  piece: "Adet",
  time: "Zaman",
  description: "Açıklama",
  send: "Gönder",
  next: "İleri",
  previous: "Önceki",
  retry: "Tekrar Dene",

  navigation: {
    home: "Ana Sayfa",
    profile: "Profil",
    settings: "Ayarlar",
    post: "Gönderi",
  },
  welcome: "Hoş geldiniz!",
  welcomeBack: "Tekrar hoş geldiniz!",
  email: "E-posta",
  password: "Şifre",
  forgotPassword: "Şifrenizi mi unuttunuz?",
  login: "Giriş Yap",
  or: "veya",
  loginWithGoogle: "Google ile Giriş Yap",
  dontHaveAccount: "Hesabınız yok mu?",
  register: "Kayıt Ol",
  googleLoginNotImplemented: "Google girişi henüz uygulanmadı.",
  forgotPasswordNotImplemented: "Şifremi unuttum işlevi henüz uygulanmadı.",
  invalidCredentials: "Geçersiz e-posta veya şifre",
  createAccount: "Hesap Oluştur",
  fullName: "Ad Soyad",
  firstName: "Ad",
  lastName: "Soyad",
  phone: "Telefon Numarası",
  invalidPhoneNumber: "Bu geçerli bir ivoirian telefon numarası değil",
  invalidEmail: "Geçersiz E-posta",
  confirmPassword: "Şifreyi Onayla",
  passwordsDoNotMatch: "Şifreler eşleşmiyor",
  acceptTerms: "Kabul ediyorum", // Consider adding "the" -> "Şartlar ve Koşulları kabul ediyorum"
  termsAndConditions: "Şartlar ve Koşullar",
  termsAndConditionsNotImplemented: "Şartlar ve Koşullar henüz uygulanmadı.",
  registrationSuccessful: "Kayıt başarılı!",
  back: "Geri",
  passwordStrength: {
    weak: "Zayıf",
    fair: "Orta",
    good: "İyi",
    strong: "Güçlü",
    veryStrong: "Çok Güçlü",
  },
  title: "Profil",
  theme: "Tema",
  system: "Sistem",
  dark: "Koyu",
  light: "Açık",
  language: "Dil",
  fr: "Fransızca",
  en: "İngilizce",
  tr: "Türkçe",
  notifications: "Bildirimler",
  logout: "Çıkış Yap",
  attendance: "Devamlılık",
  notes: "Notlar",
  schedule: "Ders Programı",
  exercises: "Alıştırmalar",
  discussion: "Tartışma",
  infoAndSchooling: "Bilgi ve Okul",
};

export default resource;

export type ILocalization = typeof resource;
