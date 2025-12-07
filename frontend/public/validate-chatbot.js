/**
 * Script de Validación del Chatbot N8N
 * 
 * Uso: 
 * 1. Abre DevTools (F12)
 * 2. Ve a Console
 * 3. Copia y pega TODO el contenido de este archivo
 * 4. Presiona Enter
 * 
 * Mostrará un reporte completo del estado del chat
 */

console.clear();
console.log('%c🤖 VALIDADOR DE CHATBOT N8N - AmparIA', 'font-size: 18px; color: #7c3aed; font-weight: bold;');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #7c3aed;');

// Color helpers
const styles = {
  success: 'color: #10b981; font-weight: bold;',
  error: 'color: #ef4444; font-weight: bold;',
  warning: 'color: #f59e0b; font-weight: bold;',
  info: 'color: #3b82f6; font-weight: bold;',
  section: 'color: #7c3aed; font-weight: bold; font-size: 14px;'
};

// Función para reportar estado
function report(name, exists, details = '') {
  const status = exists ? '✅' : '❌';
  const color = exists ? styles.success : styles.error;
  console.log(`%c${status} ${name}${details ? ': ' + details : ''}`, color);
  return exists;
}

console.log('');
console.log('%c📁 ELEMENTOS DEL DOM', styles.section);
console.log('%c───────────────────────────────────────', 'color: #7c3aed;');

// Verificar wrapper
const wrapper = document.getElementById('n8n-chat-wrapper');
report('Wrapper (#n8n-chat-wrapper)', !!wrapper);

if (wrapper) {
  const styles_wrapper = window.getComputedStyle(wrapper);
  console.log(`   └─ Position: ${styles_wrapper.position}`);
  console.log(`   └─ Z-index: ${styles_wrapper.zIndex}`);
  console.log(`   └─ Bottom: ${styles_wrapper.bottom}`);
  console.log(`   └─ Right: ${styles_wrapper.right}`);
  console.log(`   └─ Visible: ${wrapper.offsetHeight > 0 ? 'Sí' : 'No'}`);
}

console.log('');
console.log('%c🎨 RECURSOS CARGADOS', styles.section);
console.log('%c──────────────────────────────────────', 'color: #7c3aed;');

// Verificar CSS
const cssLink = document.querySelector('link[href*="n8n"]');
report('CSS de N8N', !!cssLink, cssLink ? cssLink.href.substring(cssLink.href.length - 30) : '');

// Verificar script
const moduleScript = document.querySelector('script[type="module"]');
report('Script del Módulo', !!moduleScript);

console.log('');
console.log('%c🔌 ELEMENTOS DEL CHAT', styles.section);
console.log('%c─────────────────────────────────────', 'color: #7c3aed;');

// Buscar elementos del chat
const chatElements = {
  'Chat Toggle': '[class*="chat-toggle"]',
  'Chat Container': '[class*="chat-container"]',
  'Chat Messages': '[class*="chat-messages"]',
  'Chat Input': '[class*="chat-input"]',
  'Chat Header': '[class*="chat-header"]'
};

let elementosEncontrados = 0;
for (const [name, selector] of Object.entries(chatElements)) {
  const el = document.querySelector(selector);
  if (report(name, !!el, el ? `(${el.className})` : '')) {
    elementosEncontrados++;
  }
}

console.log(`   └─ Total elementos: ${elementosEncontrados}/${Object.keys(chatElements).length}`);

// Contar todos los elementos "chat"
const allChatElements = document.querySelectorAll('[class*="chat"]');
console.log(`   └─ Elementos con "chat" en clase: ${allChatElements.length}`);

console.log('');
console.log('%c💾 ALMACENAMIENTO LOCAL', styles.section);
console.log('%c──────────────────────────────────────', 'color: #7c3aed;');

const userData = {
  'userId': localStorage.getItem('userId'),
  'userRole': localStorage.getItem('userRole'),
  'email': localStorage.getItem('email'),
  'token': localStorage.getItem('token')
};

for (const [key, value] of Object.entries(userData)) {
  if (value) {
    const preview = value.length > 30 ? value.substring(0, 30) + '...' : value;
    console.log(`%c✅ ${key}: ${preview}`, styles.success);
  } else {
    console.log(`%c❌ ${key}: no encontrado`, styles.warning);
  }
}

console.log('');
console.log('%c🌐 CONEXIÓN', styles.section);
console.log('%c────────────────────────────────────────', 'color: #7c3aed;');

// Probar conexión al webhook
const webhookUrl = 'http://localhost:4000/webhook/713a62c3-cfa4-4df7-af75-05c877ccf605/chat';
console.log('   Probando webhook...');

fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    chatInput: 'test', 
    sessionId: 'validation-test',
    userId: localStorage.getItem('userId') || 'test'
  })
})
.then(r => {
  console.log(`%c✅ Webhook responde: ${r.status}`, styles.success);
  return r.json().catch(() => null);
})
.then(data => {
  if (data) {
    console.log(`   └─ Respuesta recibida`);
  }
})
.catch(err => {
  console.log(`%c❌ Error de conexión: ${err.message}`, styles.error);
  console.log(`   └─ Verifica que N8N esté ejecutándose en: ${webhookUrl.split('/webhook')[0]}`);
});

console.log('');
console.log('%c📊 RESUMEN DE ESTADO', styles.section);
console.log('%c────────────────────────────────────────', 'color: #7c3aed;');

const resumen = {
  'DOM': !!wrapper,
  'CSS': !!cssLink,
  'Script': !!moduleScript,
  'Elementos': elementosEncontrados > 0,
  'LocalStorage': !!userData.userId
};

let contador = 0;
for (const [item, status] of Object.entries(resumen)) {
  if (status) contador++;
  const emoji = status ? '✅' : '❌';
  const color = status ? styles.success : styles.error;
  console.log(`%c${emoji} ${item}`, color);
}

console.log('');
if (contador === Object.keys(resumen).length) {
  console.log('%c🎉 TODO PARECE ESTAR BIEN!', 'color: #10b981; font-weight: bold; font-size: 16px;');
  console.log('%cEl chatbot debería estar visible. Si no lo ves:', 'color: #10b981;');
  console.log('   1. Recarga la página (Ctrl+F5)');
  console.log('   2. Verifica que N8N está corriendo');
  console.log('   3. Revisa la esquina inferior derecha');
} else {
  console.log('%c⚠️ ALGO NO ESTÁ BIEN', 'color: #ef4444; font-weight: bold; font-size: 16px;');
  console.log('%cRev isa los elementos marcados con ❌ arriba', 'color: #ef4444;');
}

console.log('');
console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #7c3aed;');
console.log('');
