// Configuração do Supabase
// IMPORTANTE: Substitua estas variáveis pelas suas credenciais do Supabase
const SUPABASE_CONFIG = {
    url: 'https://nkpwsgrysdxnqufuqioo.supabase.co', // Ex: https://xyzcompany.supabase.co
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU0MzYyODAwLCJleHAiOjE5MTIxMjkyMDB9.mu4XUCAdMsuF5Y0n4SmdsH05rKo57x7cMCQHTZmLwko' // Sua chave anônima do Supabase
};

// Verificar se as configurações foram definidas
if (SUPABASE_CONFIG.url === 'https://nkpwsgrysdxnqufuqioo.supabase.co' || SUPABASE_CONFIG.anonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU0MzYyODAwLCJleHAiOjE5MTIxMjkyMDB9.mu4XUCAdMsuF5Y0n4SmdsH05rKo57x7cMCQHTZmLwko') {
    console.warn('⚠️ ATENÇÃO: Configure suas credenciais do Supabase em js/supabase-config.js');
    console.warn('📖 Veja o README.md para instruções de configuração');
}

// Criar cliente Supabase
let supabase = null;

// Função para inicializar o Supabase (será chamada quando a biblioteca for carregada)
function initializeSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase inicializado com sucesso');
        return true;
    } else {
        console.error('❌ Biblioteca Supabase não encontrada. Verifique se o CDN está carregado.');
        return false;
    }
}

// Função para verificar se o Supabase está disponível
function isSupabaseAvailable() {
    return supabase !== null;
}

// Exportar configurações e cliente
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.supabaseClient = supabase;
window.initializeSupabase = initializeSupabase;
window.isSupabaseAvailable = isSupabaseAvailable;