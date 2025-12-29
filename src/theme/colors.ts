/**
 * 🎨 CONFIGURACIÓN CENTRALIZADA DE COLORES
 * 
 * Todos los colores del sistema están definidos aquí.
 * Cambiar un color aquí afectará automáticamente toda la aplicación.
 */

// Default color constants
export const defaultPrimary = '#1f0d4a';
export const defaultSecondary = '#482E76';
export const defaultAccent1 = '#E00099';
export const defaultAccent2 = '#F5C000';

export const appColors = {
  // Colores principales del sistema
  primary: defaultPrimary,      // Color principal
  secondary: defaultSecondary,  // Color secundario
  white: '#FFFFFF',            // Blanco - Fondos y textos
  accent1: defaultAccent1,     // Acentos y alertas
  accent2: defaultAccent2,     // Éxitos y estados positivos
  
  // Variaciones para diferentes usos
  primaryLight: '#3a1f8a',
  primaryDark: '#140835',
  secondaryLight: '#6a42b3',
  secondaryDark: '#2e1f4d',
  
  // Colores de estado
  success: '#86BEBD',      // Turquesa - Operaciones exitosas
  error: '#DA8764',        // Coral - Errores y advertencias
  warning: '#DA8764',      // Coral - Advertencias
  info: '#473587',         // Púrpura - Información
  
  // Colores de fondo
  background: {
    default: '#F8F9FA',    // Fondo general de la app
    paper: '#FFFFFF',      // Fondo de tarjetas y papeles
    dark: '#473587',       // Fondo oscuro (púrpura)
    light: '#F5F3F8',      // Fondo claro con tinte púrpura
  },
  
  // Colores de texto
  text: {
    primary: '#2D3748',    // Texto principal
    secondary: '#718096',  // Texto secundario
    disabled: '#CBD5E0',   // Texto deshabilitado
    white: '#FFFFFF',      // Texto blanco
    onPrimary: '#FFFFFF',  // Texto sobre color primario
    onSecondary: '#FFFFFF',// Texto sobre color secundario
  },
  
  // Gradientes predefinidos
  gradients: {
    primary: `linear-gradient(135deg, #473587 0%, #6f5dadff 100%)`,
    secondary: `linear-gradient(135deg, #A81B7C 0%, #DA8764 100%)`,
    accent: `linear-gradient(135deg, #86BEBD 0%, #473587 100%)`,
    soft: `linear-gradient(135deg, #F5F3F8 0%, #FFFFFF 100%)`,
  },
  
  // Sombras con los colores del tema
  shadows: {
    primary: '0 4px 20px rgba(71, 53, 135, 0.15)',
    secondary: '0 4px 20px rgba(168, 27, 124, 0.15)',
    accent1: '0 4px 20px rgba(218, 135, 100, 0.15)',
    accent2: '0 4px 20px rgba(134, 190, 189, 0.15)',
    soft: '0 2px 10px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 20px rgba(0, 0, 0, 0.08)',
    strong: '0 8px 32px rgba(0, 0, 0, 0.12)',
  },
};

/**
 * Función helper para crear variaciones de color con opacidad
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Convertir hex a rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Colores con opacidad predefinidos
 */
export const colorWithOpacity = {
  primary: {
    10: withOpacity(appColors.primary, 0.1),
    20: withOpacity(appColors.primary, 0.2),
    30: withOpacity(appColors.primary, 0.3),
    50: withOpacity(appColors.primary, 0.5),
    80: withOpacity(appColors.primary, 0.8),
  },
  secondary: {
    10: withOpacity(appColors.secondary, 0.1),
    20: withOpacity(appColors.secondary, 0.2),
    30: withOpacity(appColors.secondary, 0.3),
    50: withOpacity(appColors.secondary, 0.5),
    80: withOpacity(appColors.secondary, 0.8),
  },
  accent1: {
    10: withOpacity(appColors.accent1, 0.1),
    20: withOpacity(appColors.accent1, 0.2),
    30: withOpacity(appColors.accent1, 0.3),
    50: withOpacity(appColors.accent1, 0.5),
    80: withOpacity(appColors.accent1, 0.8),
  },
  accent2: {
    10: withOpacity(appColors.accent2, 0.1),
    20: withOpacity(appColors.accent2, 0.2),
    30: withOpacity(appColors.accent2, 0.3),
    50: withOpacity(appColors.accent2, 0.5),
    80: withOpacity(appColors.accent2, 0.8),
  },
};

export default appColors;
