# 🎨 Guía de Colores del Sistema

## Configuración Centralizada

Todos los colores del sistema están definidos en un solo lugar: **`src/theme/colors.ts`**

### ✨ Ventaja Principal
**Cambiar un color en `colors.ts` afecta automáticamente toda la aplicación.**

---

## 🎯 Paleta de Colores Principal

```typescript
// src/theme/colors.ts

export const appColors = {
  primary: '#473587',      // Púrpura oscuro - Color principal
  secondary: '#A81B7C',    // Rosa/Magenta - Color secundario
  white: '#FFFFFF',        // Blanco - Fondos y textos
  accent1: '#DA8764',      // Coral/Salmón - Acentos y alertas
  accent2: '#86BEBD',      // Turquesa suave - Éxitos y estados positivos
}
```

### Visualización de Colores

| Color | Hex | Uso Principal |
|-------|-----|---------------|
| 🟣 **Primary** | `#473587` | Botones principales, encabezados, navegación |
| 🌸 **Secondary** | `#A81B7C` | Acentos secundarios, hover states |
| ⚪ **White** | `#FFFFFF` | Fondos, textos sobre colores oscuros |
| 🧡 **Accent 1** | `#DA8764` | Alertas, errores, advertencias |
| 💚 **Accent 2** | `#86BEBD` | Éxitos, confirmaciones, estados positivos |

---

## 📝 Cómo Cambiar los Colores

### Opción 1: Cambiar un Color Específico

Edita el archivo `src/theme/colors.ts`:

```typescript
export const appColors = {
  primary: '#YOUR_NEW_COLOR',    // Cambia aquí
  secondary: '#A81B7C',
  white: '#FFFFFF',
  accent1: '#DA8764',
  accent2: '#86BEBD',
}
```

**Resultado:** El nuevo color se aplicará automáticamente en:
- Botones principales
- Sidebar
- Encabezados
- Links
- Todos los componentes que usen `primary`

### Opción 2: Cambiar Todos los Colores

Reemplaza toda la paleta:

```typescript
export const appColors = {
  primary: '#1A237E',      // Azul oscuro
  secondary: '#D32F2F',    // Rojo
  white: '#FFFFFF',        // Blanco
  accent1: '#FF9800',      // Naranja
  accent2: '#4CAF50',      // Verde
}
```

---

## 🎨 Colores Derivados

El sistema genera automáticamente variaciones:

```typescript
// Variaciones claras y oscuras
primaryLight: '#5e4aa3',
primaryDark: '#2f2460',
secondaryLight: '#c92a93',
secondaryDark: '#7a1459',
```

Estas se calculan automáticamente basadas en los colores principales.

---

## 🌈 Gradientes Predefinidos

```typescript
gradients: {
  primary: 'linear-gradient(135deg, #473587 0%, #A81B7C 100%)',
  secondary: 'linear-gradient(135deg, #A81B7C 0%, #DA8764 100%)',
  accent: 'linear-gradient(135deg, #86BEBD 0%, #473587 100%)',
  soft: 'linear-gradient(135deg, #F5F3F8 0%, #FFFFFF 100%)',
}
```

**Uso en componentes:**
```tsx
sx={{
  background: theme.custom.colors.gradients.primary
}}
```

---

## 💡 Colores con Opacidad

El sistema incluye utilidades para usar colores con transparencia:

```typescript
colorWithOpacity.primary[10]  // Primary al 10% de opacidad
colorWithOpacity.primary[20]  // Primary al 20% de opacidad
colorWithOpacity.primary[30]  // Primary al 30% de opacidad
colorWithOpacity.primary[50]  // Primary al 50% de opacidad
colorWithOpacity.primary[80]  // Primary al 80% de opacidad
```

**Ejemplo de uso:**
```tsx
sx={{
  backgroundColor: theme.custom.colorWithOpacity.primary[10],
  border: `1px solid ${theme.custom.colorWithOpacity.primary[30]}`
}}
```

---

## 🎯 Uso en Componentes

### Método 1: Usando el Theme de Material-UI

```tsx
import { useTheme } from '@mui/material';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      color: theme.custom.colors.primary,
      backgroundColor: theme.custom.colorWithOpacity.accent2[10]
    }}>
      Contenido
    </Box>
  );
};
```

### Método 2: Directamente en sx prop

```tsx
<Button
  sx={{
    backgroundColor: 'primary.main',  // Usa el color primary del tema
    '&:hover': {
      backgroundColor: 'primary.dark',
    }
  }}
>
  Click me
</Button>
```

### Método 3: Importación Directa (menos recomendado)

```tsx
import { appColors } from '@/theme/colors';

const MyComponent = () => {
  return (
    <Box sx={{ color: appColors.primary }}>
      Contenido
    </Box>
  );
};
```

---

## 📦 Componentes que Usan los Colores

### iniciar-sesion Page
- Gradiente de fondo: `gradients.primary`
- Botón de iniciar-sesion: `gradients.primary`
- Iconos: `primary`
- Alertas de error: `accent1` con opacidad

### Sidebar
- Fondo: `background.paper`
- Items seleccionados: `primary.light`
- Iconos: `primary.main`

### Botones
- Primary: `primary.main`
- Secondary: `secondary.main`
- Success: `accent2` (turquesa)
- Error: `accent1` (coral)

### Alertas
- Success: `accent2`
- Error/Warning: `accent1`
- Info: `primary`

---

## 🔧 Personalización Avanzada

### Agregar Nuevos Colores

Edita `src/theme/colors.ts`:

```typescript
export const appColors = {
  // Colores existentes...
  primary: '#473587',
  secondary: '#A81B7C',
  
  // Nuevos colores personalizados
  tertiary: '#YOUR_COLOR',
  custom1: '#YOUR_COLOR',
  custom2: '#YOUR_COLOR',
}
```

Luego actualiza el tema en `src/theme/index.ts` si necesitas mapearlos a Material-UI.

---

## 🎨 Ejemplos de Paletas Alternativas

### Paleta Azul Corporativa
```typescript
primary: '#1565C0',      // Azul corporativo
secondary: '#0277BD',    // Azul claro
accent1: '#FF6F00',      // Naranja
accent2: '#00897B',      // Verde azulado
```

### Paleta Verde Natural
```typescript
primary: '#2E7D32',      // Verde oscuro
secondary: '#558B2F',    // Verde medio
accent1: '#F57C00',      // Naranja
accent2: '#0097A7',      // Cyan
```

### Paleta Monocromática Elegante
```typescript
primary: '#212121',      // Negro casi puro
secondary: '#424242',    // Gris oscuro
accent1: '#FF5722',      // Naranja intenso
accent2: '#00BCD4',      // Cyan brillante
```

---

## ⚡ Mejores Prácticas

1. **Siempre usa los colores del tema** en lugar de valores hardcodeados
2. **Usa colores con opacidad** para fondos sutiles y overlays
3. **Mantén consistencia** usando los mismos colores para las mismas acciones
4. **Prueba el contraste** especialmente para texto sobre fondos de color
5. **Documenta cambios** si modificas la paleta principal

---

## 🚀 Aplicar Cambios

1. Edita `src/theme/colors.ts`
2. Guarda el archivo
3. La aplicación se recargará automáticamente (hot reload)
4. Todos los componentes reflejarán los nuevos colores

**¡No necesitas tocar ningún otro archivo!**

---

## 📚 Recursos Adicionales

- [Material-UI Theme Documentation](https://mui.com/material-ui/customization/theming/)
- [Color Palette Generator](https://coolors.co/)
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Adobe Color Wheel](https://color.adobe.com/)
