// =====================================================================
//  AYARLAR
// =====================================================================
//
//  1) DEMO MODU (varsayılan)
//     FIREBASE_CONFIG = null bırakılırsa veriler tarayıcıda (localStorage)
//     tutulur. Sunum için idealdir: aynı tarayıcıda admin ve menü sekmeleri
//     anlık olarak senkron çalışır. Ama başka bir telefondaki müşteri
//     değişiklikleri GÖRMEZ.
//
//  2) CANLI MOD (kafede gerçek kullanım)
//     Firebase konsolundan aldığınız web config'i aşağıya yapıştırın.
//     O andan itibaren personelin yaptığı her değişiklik tüm müşterilerin
//     telefonuna anında yansır. Kurulum adımları README.md içinde.
//
//  Örnek:
//  export const FIREBASE_CONFIG = {
//    apiKey: "AIza...",
//    authDomain: "kafe-menu.firebaseapp.com",
//    projectId: "kafe-menu",
//    storageBucket: "kafe-menu.appspot.com",
//    messagingSenderId: "123456789",
//    appId: "1:123456789:web:abc123"
//  };
// =====================================================================

export const FIREBASE_CONFIG = null;

// Demo modunda personel paneline giriş şifresi.
// (Canlı modda Firebase e-posta/şifre girişi kullanılır.)
export const ADMIN_PIN = "1234";
