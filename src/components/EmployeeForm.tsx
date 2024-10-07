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
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EmployeeForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
  
    setLoading(true);
    setError(null);
  
    const newEmployee = {
      username,
      password,
      email,
      first_name: firstName,
      last_name: lastName,
    };
  
    try {
      const token = localStorage.getItem('token');
  
      const response = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // El servidor espera este formato
          'Authorization': `Bearer ${token}`, // El token para autenticar la solicitud
        },
        body: new URLSearchParams({
          username: newEmployee.username,
          password: newEmployee.password,
        }).toString(), // Formato x-www-form-urlencoded
      });
  
      if (!response.ok) {
        // Manejo de diferentes errores según el estado de la respuesta
        const errorData = await response.json();
        if (response.status === 400) {
          setError('Faltan credenciales.');
        } else if (response.status === 500) {
          setError('Error interno del servidor.');
        } else {
          setError('Error desconocido al crear el usuario.');
        }
        return;
      }

      router.push('/admin/employees');

      // Aquí podrías hacer una redirección o mostrar un mensaje de éxito
    } catch (error) {
      setError('Hubo un problema al crear el usuario. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex align="center" justify="center" bg="none">
      <Stack spacing={8} mx="auto" maxW="lg" bg="none" pt={16} px={6}>
        <Box rounded="lg" bg="none" /*boxShadow="lg"*/ p={8}>
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

            <Stack spacing={10}>
              <Button
                bg="blue.400"
                color="white"
                _hover={{
                  bg: 'blue.500',
                }}
                onClick={handleSubmit}
                isLoading={loading}
              >
                Registrar Empleado
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default EmployeeForm;
