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
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const EmployeeForm: React.FC = () => {
  const [username, setUsername] = useState<string>(''); 
  const [email, setEmail] = useState<string>(''); 
  const [firstName, setFirstName] = useState<string>(''); 
  const [lastName, setLastName] = useState<string>(''); 
  const [password, setPassword] = useState<string>(''); 
  const [confirmPassword, setConfirmPassword] = useState<string>(''); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 
  const [isEditing, setIsEditing] = useState<boolean>(false); // Estado para alternar entre vista y edición
  const [initialData, setInitialData] = useState<any>({}); // Estado para guardar los datos originales
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (pathname === '/profile') {
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

          if (response.ok) {
            const userData = await response.json();
            setUsername(userData.usuario || '');
            setEmail(userData.email || '');
            setFirstName(userData.nombre || '');
            setLastName(userData.apellido || '');
            setInitialData({ // Guardamos los datos iniciales
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
      }
    };

    fetchUserProfile();
  }, [pathname]);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError(null);

    const updatedUser = {
      username,
      password,
      email,
      first_name: firstName,
      last_name: lastName,
    };

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:8000/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', 
          'Authorization': `Bearer ${token}`,
        },
        body: new URLSearchParams({
          username: updatedUser.username,
          password: updatedUser.password,
        }).toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          setError('Faltan credenciales.');
        } else if (response.status === 500) {
          setError('Error interno del servidor.');
        } else {
          setError('Error desconocido al actualizar el perfil.');
        }
        return;
      }

      setIsEditing(false); // Regresamos al modo de solo lectura
    } catch (error) {
      setError('Hubo un problema al actualizar el perfil. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing((prevState) => !prevState); // Alternar entre modo de vista y edición
  };

  const handleCancel = () => {
    // Restauramos los valores originales
    setUsername(initialData.usuario);
    setEmail(initialData.email);
    setFirstName(initialData.nombre);
    setLastName(initialData.apellido);
    setIsEditing(false); // Volvemos al modo de solo lectura
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
          {isEditing ? (
            <Stack spacing={4}>
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

              <FormControl id="password">
                <FormLabel>Contraseña</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crea una contraseña"
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
                  Guardar Cambios
                </Button>
                <Button
                  bg="red.400"
                  color="white"
                  _hover={{ bg: 'red.500' }}
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={4}>
              <Text><strong>Nombre:</strong> {firstName}</Text>
              <Text><strong>Apellido:</strong> {lastName}</Text>
              <Text><strong>Nombre de Usuario:</strong> {username}</Text>
              <Text><strong>Email:</strong> {email}</Text>
              <Button onClick={toggleEdit} bg="blue.400" color="white" _hover={{ bg: 'blue.500' }}>
                Editar Perfil
              </Button>
            </Stack>
          )}
        </Box>
      </Stack>
    </Flex>
  );
};

export default EmployeeForm;
