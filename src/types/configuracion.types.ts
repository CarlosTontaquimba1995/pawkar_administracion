export interface Configuracion {
  configuracionId: number;
  primario: string;
  secundario: string;
  acento1: string;
  acento2: string;
}

export interface ConfiguracionResponse {
  success: boolean;
  message: string;
  data: Configuracion;
}

export interface UpdateConfiguracionRequest {
  primario: string;
  secundario: string;
  acento1: string;
  acento2: string;
}
