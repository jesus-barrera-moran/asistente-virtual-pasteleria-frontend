'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Stack,
  Text,
  Spinner,
  Checkbox,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const EmployeeForm: React.FC = () => {
  const [username, setUsername] = useState<string>(''); 
  const [email, setEmail] = useState<string>(''); 
  const [firstName, setFirstName] = useState<string>(''); 
  const [lastName, setLastName] = useState<string>(''); 
  const [currentPassword, setCurrentPassword] = useState<string>(''); // Para actualización de contraseña en /profile
  const [password, setPassword] = useState<string>(''); 
  const [confirmPassword, setConfirmPassword] = useState<string>(''); 
  const [updatePasswordMode, setUpdatePasswordMode] = useState<boolean>(false); // Modo para actualización de contraseña
  const [isEditing, setIsEditing] = useState<boolean>(false); // Modo para edición de perfil
  const [loading, setLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<any>({}); 
  const router = useRouter();
  const pathname = usePathname();

  // Efecto para manejar el modo de creación o perfil
  useEffect(() => {
    if (pathname === '/profile') {
      // Si estamos en el perfil, cargamos los datos del usuario actual
      const fetchUserProfile = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setError('No hay un token de autenticación.');
            setLoading(false);
            return;
          }

          const response = await fetch('http://localhost:8000/users/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          // Check if response status is 401
          if (response.status === 401) {
            setLoading(false);
            alert('La sesión ha expirado, por favor inicia sesión nuevamente');
            localStorage.removeItem('token');
            router.push('/login');
            return;
          }

          if (response.ok) {
            const userData = await response.json();
            setUsername(userData.usuario || '');
            setEmail(userData.email || '');
            setFirstName(userData.nombre || '');
            setLastName(userData.apellido || '');
            setInitialData({
              usuario: userData.usuario || '',
              email: userData.email || '',
              nombre: userData.nombre || '',
              apellido: userData.apellido || '',
            });
          } else {
            setError('No se pudieron cargar los datos del perfil.');
          }
        } catch (err) {
          setError('Hubo un problema al cargar los datos del perfil.');
        } finally {
          setLoading(false);
        }
      };

      fetchUserProfile();
    }
  }, [pathname]);

  const handleSubmit = async () => {
    // Validación de contraseñas para nuevo usuario o actualización de contraseña
    if ((pathname === '/admin/employee' || updatePasswordMode) && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError(null);

    // Crear el payload dependiendo de si es nuevo usuario o actualización de perfil
    const userPayload = {
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      ...(pathname === '/admin/employee' && { password }), // Incluir la contraseña si estamos creando un nuevo usuario
      ...(updatePasswordMode && { current_password: currentPassword, password }), // Incluir la contraseña actual y nueva si estamos actualizando
    };

    try {
      const token = localStorage.getItem('token');
      const endpoint = pathname === '/profile' ? '/users/me' : '/users';
      const method = pathname === '/profile' ? 'PUT' : 'POST'; // PUT si estamos en perfil, POST si estamos creando un usuario

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userPayload),
      });

      // Check if response status is 401
      if (response.status === 401) {
        setLoading(false);
        alert('La sesión ha expirado, por favor inicia sesión nuevamente');
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          setError('Faltan credenciales.');
        } else if (response.status === 500) {
          setError('Error interno del servidor.');
        } else {
          setError('Error desconocido.');
        }
        return;
      }

      if (pathname === '/profile') {
        setIsEditing(false); // Volver al modo de solo lectura
        setUpdatePasswordMode(false); // Salir del modo de actualización de contraseña
      } else {
        router.push('/admin/employees'); // Redirigir después de crear el usuario
      }
    } catch (error) {
      setError('Hubo un problema al procesar la solicitud. Por favor, intenta nuevamente.');
    }
  };

  const toggleEdit = () => {
    setIsEditing(true); // Permitir la edición de perfil
  };

  const handleCancel = () => {
    setUsername(initialData.usuario);
    setEmail(initialData.email);
    setFirstName(initialData.nombre);
    setLastName(initialData.apellido);
    setIsEditing(false); // Volver a solo lectura
    setUpdatePasswordMode(false); // Cancelar la actualización de contraseña
    setCurrentPassword('');
    setPassword('');
    setConfirmPassword('');
  };

  // Si está cargando los datos del perfil, mostramos el spinner
  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="center" bg="none">
      <Stack spacing={8} mx="auto" maxW="lg" bg="none" pt={16} px={6}>
        <Box rounded="lg" bg="none" p={8}>
          {/* Modo perfil: solo lectura con opciones de edición */}
          {pathname === '/profile' && !isEditing && !updatePasswordMode ? (
            <Stack spacing={4}>
              <Text><strong>Nombre:</strong> {firstName}</Text>
              <Text><strong>Apellido:</strong> {lastName}</Text>
              <Text><strong>Nombre de Usuario:</strong> {username}</Text>
              <Text><strong>Email:</strong> {email}</Text>
              <Button onClick={toggleEdit} bg="blue.400" color="white" _hover={{ bg: 'blue.500' }}>
                Editar Perfil
              </Button>
              <Button onClick={() => setUpdatePasswordMode(true)} bg="gray.400" color="white" _hover={{ bg: 'gray.500' }}>
                Actualizar Contraseña
              </Button>
            </Stack>
          ) : (
            <Stack spacing={4}>
              {/* Modo de edición de perfil o creación de usuario */}
              {!updatePasswordMode && (
                <>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl id="firstName">
                        <FormLabel>Nombre</FormLabel>
                        <Input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Nombre"
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl id="lastName">
                        <FormLabel>Apellido</FormLabel>
                        <Input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Apellido"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <FormControl id="username">
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nombre de usuario"
                      disabled={pathname === '/profile' && isEditing}
                    />
                  </FormControl>

                  <FormControl id="email">
                    <FormLabel>Correo Electrónico</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Correo electrónico"
                    />
                  </FormControl>

                  {/* Campos de contraseña solo visibles en modo de creación de usuario */}
                  {pathname === '/admin/employee' && (
                    <>
                      <FormControl id="password">
                        <FormLabel>Contraseña</FormLabel>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Ingresa una contraseña"
                        />
                      </FormControl>

                      <FormControl id="confirmPassword">
                        <FormLabel>Confirmar Contraseña</FormLabel>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirma la contraseña"
                        />
                      </FormControl>
                    </>
                  )}
                </>
              )}

              {/* Modo de actualización de contraseña */}
              {updatePasswordMode && (
                <>
                  <FormControl id="currentPassword">
                    <FormLabel>Contraseña Actual</FormLabel>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </FormControl>

                  <FormControl id="password">
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa una nueva contraseña"
                    />
                  </FormControl>

                  <FormControl id="confirmPassword">
                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirma la nueva contraseña"
                    />
                  </FormControl>
                </>
              )}

              {error && (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              )}

              <Stack direction="row" spacing={4} justifyContent={'center'}>
                <Button
                  bg="blue.400"
                  color="white"
                  _hover={{ bg: 'blue.500' }}
                  onClick={handleSubmit}
                  isLoading={loading}
                >
                  {pathname === '/profile' ? (updatePasswordMode ? 'Actualizar Contraseña' : 'Guardar Cambios') : 'Crear Usuario'}
                </Button>
                {pathname === '/profile' && (
                  <Button
                    bg="red.400"
                    color="white"
                    _hover={{ bg: 'red.500' }}
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                )}
              </Stack>
            </Stack>
          )}
        </Box>
      </Stack>
    </Flex>
  );
};

export default EmployeeForm;
