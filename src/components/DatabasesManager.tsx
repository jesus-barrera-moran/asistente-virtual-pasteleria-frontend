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
  Select,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

type DatabaseConnection = {
  id: number;
  nombre: string;
  servidor: string;
  puerto: string; // El puerto llega como string desde la API
  usuario: string;
};

const DatabaseConnectionsManager: React.FC = () => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const token = localStorage.getItem('token');
        const id_pasteleria = localStorage.getItem('id_pasteleria');

        const response = await fetch(`http://localhost:8000/pastelerias/${id_pasteleria}/bases-datos`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          toast({
            title: 'Sesión expirada',
            description: 'La sesión ha expirado, por favor inicia sesión nuevamente.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          localStorage.removeItem('token');
          return;
        }

        if (!response.ok) {
          throw new Error('Error al cargar las conexiones a bases de datos');
        }

        const data: DatabaseConnection[] = await response.json();
        setConnections(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Hubo un problema al cargar las conexiones a bases de datos.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [toast]);

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

    const selectedConnection = connections.find((conn) => conn.id === selectedConnectionId);
    if (selectedConnection) {
      console.log('Conexión guardada:', selectedConnection);
      // Aquí podrías enviar los cambios al backend si es necesario
    }

    setLoading(false);
  };

  const selectedConnection = connections.find((conn) => conn.id === selectedConnectionId);

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="center" bg="none">
      <Stack spacing={8} mx="auto" w="100%" bg="none" maxW="800px" pt={16} px={6}>
        <Box w="100%" maxW="800px" mx="auto" p={6} bg="none" rounded="lg">
          <FormControl id="select-database">
            <FormLabel>Seleccionar Base de Datos</FormLabel>
            <Select placeholder="Selecciona una base de datos" onChange={handleConnectionChange}>
              {connections.map((conn) => (
                <option key={conn.id} value={conn.id}>
                  {conn.nombre}
                </option>
              ))}
            </Select>
          </FormControl>

          {selectedConnection && (
            <Box mt={6}>
              <FormControl id={`servidor-${selectedConnection.id}`} mb={4}>
                <FormLabel>Servidor</FormLabel>
                <Input
                  type="text"
                  value={selectedConnection.servidor}
                  onChange={(e) => handleFieldChange('servidor', e.target.value)}
                  placeholder="Servidor"
                />
              </FormControl>

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl id={`puerto-${selectedConnection.id}`} mb={4}>
                    <FormLabel>Puerto</FormLabel>
                    <Input
                      type="text"
                      value={selectedConnection.puerto}
                      onChange={(e) => handleFieldChange('puerto', e.target.value)} // Lo manejamos como string
                      placeholder="Puerto"
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl id={`usuario-${selectedConnection.id}`} mb={4}>
                    <FormLabel>Usuario</FormLabel>
                    <Input
                      type="text"
                      value={selectedConnection.usuario}
                      onChange={(e) => handleFieldChange('usuario', e.target.value)}
                      placeholder="Usuario"
                    />
                  </FormControl>
                </GridItem>
              </Grid>

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
