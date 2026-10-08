# Plan V1 de cuentas, empresas y aprendizaje

## Modelo para el usuario

- **Cuenta:** identidad individual en Supabase Auth. Un empleado nunca comparte la contraseña del empresario.
- **Perfil:** datos personales de esa cuenta (`public.users`).
- **Empresa:** espacio de trabajo creado por el primer usuario (`public.companies`).
- **Membresía:** relación entre una cuenta y una empresa (`public.company_members`).
- **Configuración:** preferencias individuales (`public.user_settings`).

## Roles

- `owner`: empresario o creador de la empresa. Puede invitar y administrar el espacio.
- `admin`: persona autorizada para gestionar miembros y acompañar el aprendizaje.
- `member`: empleado que aprende y completa acciones según sus áreas.

El progreso de cursos y quizzes pertenece al usuario. Los procesos, planes y métricas de aplicación pertenecen a la empresa cuando corresponda.

## Flujo implementado

1. El primer registro crea perfil, empresa y membresía `owner`.
2. Owner/admin entra a **Equipo y accesos**.
3. Genera una invitación para un correo y un rol.
4. Comparte el enlace generado con el empleado.
5. El empleado crea o inicia sesión con el mismo correo.
6. Supabase valida la invitación y crea la membresía.
7. El empleado llega al dashboard con su progreso individual.

## Validación de la V1

- Revisar cuentas en **Authentication > Users**.
- Revisar perfiles en `public.users`.
- Revisar empresas en `public.companies`.
- Revisar accesos en `public.company_members`.
- Confirmar que cada usuario solo ve su progreso.
- Confirmar que el equipo ve miembros de su empresa, no de otras empresas.
- Completar diagnóstico, lección, quiz y una acción con dos cuentas distintas.
