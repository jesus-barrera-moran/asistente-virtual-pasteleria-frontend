'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Select,
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
};

const initialUsers: User[] = [
  { id: 1, username: 'johndoe', email: 'johndoe@example.com', role: 'Admin', enabled: true },
  { id: 2, username: 'janedoe', email: 'janedoe@example.com', role: 'User', enabled: false },
  { id: 3, username: 'bobsponge', email: 'bobsponge@example.com', role: 'User', enabled: true },
];

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const handleToggleEnabled = (id: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, enabled: !user.enabled } : user
      )
    );
  };

  const handleRoleChange = (id: number, newRole: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === id ? { ...user, role: newRole } : user
      )
    );
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx="auto" w="100%" maxW="1000px" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">Empleados</Heading>
          {/* <Text fontSize="lg" color={useColorModeValue('gray.600', 'whiteAlpha.800')}>
            Actualiza el estado y el rol de los usuarios
          </Text> */}
        </Stack>
        <Box w="100%" maxW="1000px" mx="auto" p={6} bg={useColorModeValue('white', 'gray.700')} boxShadow="lg" rounded="lg">
          <Stack align="center">
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
                      >
                          <option value="Admin">Administrador</option>
                          <option value="Employee">Empleado</option>
                      </Select>
                      </Td>
                      <Td>
                      <Switch
                          colorScheme="teal"
                          isChecked={user.enabled}
                          onChange={() => handleToggleEnabled(user.id)}
                      />
                      </Td>
                      <Td>
                      <Button colorScheme="blue" size="sm">
                          Guardar Cambios
                      </Button>
                      </Td>
                  </Tr>
                  ))}
              </Tbody>
            </Table>
            <Button colorScheme="blue" size="sm" mt="10px">
              Nuevo Empleado +
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default UsersList;
