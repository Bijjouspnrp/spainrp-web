import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mzsisbajrbzhhgusluac.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c2lzYmFqcmJ6aGhndXNsdWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDQ5OTIsImV4cCI6MjA3MjkyMDk5Mn0.wSqv7ls1i4zWVKnDyrlbE1CrDr_M6Bcj5iUpjzKaIDI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('[Supabase] Cliente inicializado:', supabaseUrl);

/**
 * Devuelve true si el usuario es staff (según claim de rol en user_metadata o app_metadata)
 * @param {object} user - Objeto user de Supabase
 */
export function isStaff(user) {
	if (!user) return false;
	// Puedes ajustar el claim según tu auth
	const role = user.user_metadata?.role || user.app_metadata?.role;
	console.log('[Supabase] Usuario:', user.email || user.id, 'Rol:', role);
	return role === 'staff';
}
