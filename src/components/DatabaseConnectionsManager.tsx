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
  Select,
} from '@chakra-ui/react';
import { useState } from 'react';

type DatabaseConnection = {
  id: number;
  name: string;
  server: string;
  database: string;
  userId: string;
  password: string;
  port: number;
};

const initialConnections: DatabaseConnection[] = [
  {
    id: 1,
    name: 'Base de Datos 1',
    server: 'db1.example.com',
    port: 5432,
    database: 'mydb1',
    userId: 'user1',
    password: 'password1',
  },
  {
    id: 2,
    name: 'Base de Datos 2',
    server: 'db2.example.com',
    port: 3306,
    database: 'mydb2',
    userId: 'user2',
    password: 'password2',
  },
  {
    id: 3,
    name: 'Base de Datos 3',
    server: 'db3.example.com',
    port: 1521,
    database: 'mydb3',
    userId: 'user3',
    password: 'password3',
  },
];

const DatabaseConnectionsManager: React.FC = () => {
  const [connections, setConnections] = useState<DatabaseConnection[]>(initialConnections);
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleConnectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(event.target.value, 10);
    setSelectedConnectionId(selectedId);
  };

  const handleFieldChange = (field: keyof DatabaseConnection, value: string | number) => {
    setConnections((prevConnections) =>
      prevConnections.map((conn) =>
        conn.id === selectedConnectionId ? { ...conn, [field]: value } : conn
      )
    );
  };

  const handleSaveChanges = async () => {
    setLoading(true);

    // Aquí podrías manejar la lógica para enviar la conexión actualizada a tu backend
    const selectedConnection = connections.find(conn => conn.id === selectedConnectionId);
    if (selectedConnection) {
      console.log('Conexión guardada:', selectedConnection);
    }

    setLoading(false);
    // Puedes mostrar un mensaje de éxito o redirigir al usuario después de guardar los cambios
  };

  const selectedConnection = connections.find(conn => conn.id === selectedConnectionId);

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx="auto" w="100%" maxW="800px" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">Bases de Datos</Heading>
          {/* <Text fontSize="lg" color={useColorModeValue('gray.600', 'whiteAlpha.800')}>
            Actualiza los datos de conexión de tus bases de datos
          </Text> */}
        </Stack>
        <Box w="100%" maxW="800px" mx="auto" p={6} bg={useColorModeValue('white', 'gray.700')} boxShadow="lg" rounded="lg">
          <FormControl id="select-database">
            <FormLabel>Seleccionar Base de Datos</FormLabel>
            <Select placeholder="Selecciona una base de datos" onChange={handleConnectionChange}>
              {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.name}
                </option>
              ))}
            </Select>
          </FormControl>

          {selectedConnection && (
            <Box mt={6}>
              <FormControl id={`server-${selectedConnection.id}`} mb={4}>
                <FormLabel>Servidor</FormLabel>
                <Input
                  type="text"
                  value={selectedConnection.server}
                  onChange={(e) => handleFieldChange('server', e.target.value)}
                  placeholder="Servidor"
                />
              </FormControl>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl id={`database-${selectedConnection.id}`} mb={4}>
                    <FormLabel>Base de Datos</FormLabel>
                    <Input
                      type="text"
                      value={selectedConnection.database}
                      onChange={(e) => handleFieldChange('database', e.target.value)}
                      placeholder="Base de Datos"
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl id={`port-${selectedConnection.id}`} mb={4}>
                  <FormLabel>Puerto</FormLabel>
                  <Input
                    type="number"
                    value={selectedConnection.port}
                    onChange={(e) => handleFieldChange('port', parseInt(e.target.value))}
                    placeholder="Puerto"
                  />
                  </FormControl>
                </GridItem>
              </Grid>

              <FormControl id={`userId-${selectedConnection.id}`} mb={4}>
                <FormLabel>Usuario</FormLabel>
                <Input
                  type="text"
                  value={selectedConnection.userId}
                  onChange={(e) => handleFieldChange('userId', e.target.value)}
                  placeholder="Usuario"
                />
              </FormControl>

              <FormControl id={`password-${selectedConnection.id}`} mb={4}>
                <FormLabel>Contraseña</FormLabel>
                <Input
                  type="password"
                  value={selectedConnection.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  placeholder="Contraseña"
                />
              </FormControl>

              <Button
                mt={6}
                colorScheme="blue"
                isLoading={loading}
                onClick={handleSaveChanges}
              >
                Guardar Cambios
              </Button>
            </Box>
          )}
        </Box>
      </Stack>
    </Flex>
  );
};

export default DatabaseConnectionsManager;
