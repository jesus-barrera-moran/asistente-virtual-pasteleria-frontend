'use client';

import {
  Box,
  Button,
  Flex,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Select,
  Switch,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
};

const EmployeesManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [originalRoles, setOriginalRoles] = useState<{ [key: number]: string }>({}); // Para almacenar los roles originales
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<{ [key: number]: boolean }>({});
  const [changes, setChanges] = useState<{ [key: number]: boolean }>({});
  const toast = useToast();
  const router = useRouter();
  const currentUserRole = String(localStorage.getItem('id_rol')); // Rol del usuario logueado

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const id_pasteleria = localStorage.getItem('id_pasteleria');
        const usuario = localStorage.getItem('usuario');

        const response = await fetch(`http://localhost:8000/pastelerias/${id_pasteleria}/usuarios`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          setLoading(false);
          alert('La sesión ha expirado, por favor inicia sesión nuevamente');
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Error al cargar los usuarios');
        }

        const data = await response.json();

        const filteredData = data.filter((user: User) => user.username !== usuario);

        setUsers(filteredData);
        // Almacenamos los roles originales
        const roles = filteredData.reduce((acc: { [key: number]: string }, user: User) => {
          acc[user.id] = user.role;
          return acc;
        }, {});
        setOriginalRoles(roles);
      } catch (err) {
        setError('Error al cargar los usuarios');
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los usuarios.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleToggleEnabled = (id: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, enabled: !user.enabled } : user
      )
    );
    setChanges((prevChanges) => ({ ...prevChanges, [id]: true }));
  };

  const handleRoleChange = (id: number, newRole: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, role: newRole } : user
      )
    );
    setChanges((prevChanges) => ({ ...prevChanges, [id]: true }));
  };

  const handleSaveChanges = async (user: User) => {
    try {
      setSaving((prev) => ({ ...prev, [user.id]: true }));
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:8000/users/${user.username}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          disabled: !user.enabled, // Asegúrate de que siga siendo un booleano
          role: String(user.role),  // Convertir a cadena de texto
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el usuario');
      }

      toast({
        title: 'Éxito',
        description: 'Usuario actualizado correctamente.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setChanges((prevChanges) => ({ ...prevChanges, [user.id]: false }));
      setOriginalRoles((prevRoles) => ({ ...prevRoles, [user.id]: user.role })); // Actualizamos el rol original
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el usuario.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  const isRoleReadOnly = (role: string, originalRole: string) => {
    const rolesHierarchy: { [key: string]: number } = { '17': 1, '11': 2, '12': 3 };

    // Asegurarse de que ambos roles están definidos en rolesHierarchy
    if (!(originalRole in rolesHierarchy) || !(currentUserRole in rolesHierarchy)) {
      return true; // Si el rol no está en la jerarquía, lo tratamos como solo lectura
    }

    // Usar el rol original para determinar si es solo lectura
    return rolesHierarchy[currentUserRole] >= rolesHierarchy[originalRole];
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" />
      </Flex>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Flex align="center" justify="center" bg="none">
      <Stack spacing={8} mx="auto" w="100%" bg="none" maxW="1000px" pt={16} px={6}>
        <Box w="100%" maxW="1000px" mx="auto" p={6} bg="none" rounded="lg">
          <Stack align="center">
            {users.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Nombre de Usuario</Th>
                    <Th>Correo Electrónico</Th>
                    <Th>Rol</Th>
                    <Th>Estado</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user.id}>
                      <Td>{user.username}</Td>
                      <Td>{user.email}</Td>
                      <Td>
                        <Select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          isDisabled={isRoleReadOnly(user.role, originalRoles[user.id])} // Usar el rol original para verificar si debe ser de solo lectura
                        >
                          <option value="11">Administrador</option>
                          <option value="12">Empleado</option>
                        </Select>
                      </Td>
                      <Td>
                        <Switch
                          colorScheme="teal"
                          isChecked={user.enabled}
                          onChange={() => handleToggleEnabled(user.id)}
                          isDisabled={isRoleReadOnly(user.role, originalRoles[user.id])} // Usar el rol original para verificar si debe ser de solo lectura
                        />
                      </Td>
                      <Td>
                        <Button
                          colorScheme="blue"
                          size="sm"
                          onClick={() => handleSaveChanges(user)}
                          isLoading={saving[user.id]}
                          isDisabled={!changes[user.id]} // Desactivar si no se ha hecho ningún cambio
                        >
                          Guardar Cambios
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <p>No hay usuarios registrados</p>
            )}
            <Link href="/admin/employee" passHref>
              <Button as="a" colorScheme="blue" size="sm" mt="10px">
                Nuevo Empleado +
              </Button>
            </Link>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default EmployeesManager;
