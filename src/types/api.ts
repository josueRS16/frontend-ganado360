// Tipos base para respuestas de la API
export interface ApiResponse<T> {
  data: T;
}

// Tipos para respuestas paginadas
export interface PaginatedResponse<T> {
  data: T;
  count: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export interface ApiError {
  message: string;
  status?: number;
}

// Tipos para Roles
export interface Rol {
  RolID: number;
  Nombre: string;
}

export interface RolRequest {
  Nombre: string;
}

// Tipos para Usuarios
export interface Usuario {
  ID_Usuario: number;
  Nombre: string;
  Correo: string;
  RolID: number;
  RolNombre: string;
  Creado_En: string;
}

export interface UsuarioRequest {
  Nombre: string;
  Correo: string;
  Contraseña: string;
  RolID: number;
}

// Tipos para Categorías
export interface Categoria {
  ID_Categoria: number;
  Tipo: string;
}

export interface CategoriaRequest {
  Tipo: string;
}

export type UpdateCategoriaRequest = CategoriaRequest;

// Tipos para Animales
export interface Animal {
  ID_Animal: number;
  Nombre: string;
  EstadoNombre: string;
  ID_Estado_Animal?: number; // Para dar de baja
  Sexo: string;
  Color: string;
  Peso: string;
  Fecha_Nacimiento: string;
  Raza: string;
  Esta_Preniada: number;
  Fecha_Monta: string | null;
  Fecha_Estimada_Parto: string | null;
  Fecha_Ingreso: string;
  ID_Categoria: number;
  CategoriaTipo: string;
  Imagen_URL?: string | null;
}

export interface AnimalConDetalle {
  ID_Animal: number;
  Nombre: string;
  Sexo: string;
  Color: string;
  Peso: number;
  Fecha_Nacimiento: string;
  Raza: string;
  Esta_Preniada: boolean;
  Fecha_Monta: string | null;
  Fecha_Estimada_Parto: string | null;
  Fecha_Ingreso: string;
  ID_Categoria: number;
  Imagen_URL: string | null;
  ID_Estado_Animal: number;
  ID_Estado: number;
  Fecha_Fallecimiento: string | null;
  AnimalNombre: string;
  EstadoNombre: string;
  CategoriaTipo: string;
  ID_Venta: number | null;
  Fecha_Venta: string | null;
  Precio: number | null;
  Comprador: string | null;
  Tipo_Venta: string | null;
  Registrado_Por: number;
  Observaciones: string | null;
  UsuarioNombre: string;
}

export interface CreateAnimalRequest {
  Nombre: string;
  Sexo: "M" | "F";
  Color: string;
  Peso: number;
  Fecha_Nacimiento: string;
  Raza: string;
  Esta_Preniada: boolean;
  Fecha_Monta: string | null;
  Fecha_Estimada_Parto: string | null;
  Fecha_Ingreso: string;
  ID_Categoria: number;
  Imagen_URL?: string | null; // URL opcional (máx. 500) o null para eliminar
}

export type UpdateAnimalRequest = CreateAnimalRequest;

export interface AnimalRequest {
  Nombre: string;
  Sexo: string;
  Color: string;
  Peso: string;
  Fecha_Nacimiento: string;
  Raza: string;
  Esta_Preniada: number;
  Fecha_Monta: string;
  Fecha_Estimada_Parto: string;
  Fecha_Ingreso: string;
  ID_Categoria: number;
}

export interface AnimalesFilters {
  ID_Categoria?: number;
  Sexo?: "M" | "F";
  fechaIngresoDesde?: string;
  fechaIngresoHasta?: string;
  EstadoNombre?: string;
  Esta_Preniada?: boolean;
  ID_Estado?: number;
  fechaVentaDesde?: string;
  fechaVentaHasta?: string;
  Tipo_Venta?: string;
  page?: number;
  limit?: number;
}

// Tipos para Recordatorios
export interface Recordatorio {
  ID_Recordatorio: number;
  ID_Animal: number;
  Titulo: string;
  Descripcion: string;
  Fecha_Recordatorio: string;
  AnimalNombre: string;
  Estado: 'pendiente' | 'hecho';
}

export interface RecordatorioRequest {
  ID_Animal: number;
  Titulo: string;
  Descripcion: string;
  Fecha_Recordatorio: string;
}

export interface RecordatoriosFilters {
  ID_Animal?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  Estado?: 'pendiente' | 'hecho';
  page?: number;
  limit?: number;
}

// Tipos para Historial Veterinario
export interface HistorialVeterinario {
  ID_Evento: number;
  ID_Animal: number;
  Tipo_Evento: string;
  Descripcion: string;
  Fecha_Aplicacion: string;
  Proxima_Fecha: string;
  Hecho_Por: number;
  AnimalNombre: string;
  UsuarioNombre: string;
}

export interface HistorialVeterinarioRequest {
  ID_Animal: number;
  Tipo_Evento: string;
  Descripcion: string;
  Fecha_Aplicacion: string;
  Proxima_Fecha: string;
  Hecho_Por: number;
}

export interface HistorialFilters {
  ID_Animal?: number;
  Tipo_Evento?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  Hecho_Por?: number;
  page?: number;
  limit?: number;
}

// Tipos para Estados
export interface Estado {
  ID_Estado: number;
  Nombre: string;
}

export interface EstadoRequest {
  Nombre: string;
}

// Tipos para Estado Animal
export interface EstadoAnimal {
  ID_Estado_Animal: number;
  ID_Animal: number;
  ID_Estado: number;
  Fecha_Fallecimiento: string | null;
  AnimalNombre: string;
  EstadoNombre: string;
}

export interface EstadoAnimalRequest {
  ID_Animal: number;
  ID_Estado: number;
  Fecha_Fallecimiento?: string | null;
}

export interface EstadoAnimalFilters {
  ID_Animal?: number;
}

// Tipos para Ventas
export interface Venta {
  ID_Venta: number;
  ID_Animal: number;
  Fecha_Venta: string;
  Tipo_Venta: string;
  Comprador: string;
  Precio: number;
  Registrado_Por: number;
  Observaciones: string;
  AnimalNombre: string;
  UsuarioNombre: string;
}

export interface VentaRequest {
  ID_Animal: number;
  Fecha_Venta: string;
  Tipo_Venta: string;
  Comprador: string;
  Precio: number;
  Registrado_Por: number;
  Observaciones: string;
}

export interface VentasFilters {
  ID_Animal?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  Tipo_Venta?: string;
  Comprador?: string;
  page?: number;
  limit?: number;
}
