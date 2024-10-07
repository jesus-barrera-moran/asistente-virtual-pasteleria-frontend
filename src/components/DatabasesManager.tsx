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
  Text,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

type DatabaseConnection = {
  id: number;
  nombre: string;
  servidor: string;
  puerto: string;
  usuario: string;
};

const DatabaseConnectionsManager: React.FC = () => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [initialData, setInitialData] = useState<DatabaseConnection | null>(null);
  const [updatePasswordMode, setUpdatePasswordMode] = useState<boolean>(false); // Nuevo estado para actualizar clave
  const [newPassword, setNewPassword] = useState<string>(''); // Para la nueva clave
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>(''); // Para confirmar la nueva clave
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
    const selectedConn = connections.find(conn => conn.id === selectedId);
    if (selectedConn) {
      setInitialData({ ...selectedConn }); // Guardar los datos iniciales para restaurar si se cancela
    }
    setIsEditing(false); // Cambiamos a modo solo lectura al seleccionar
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
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:8000/bases-datos/${selectedConnection.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: selectedConnection.nombre,
            servidor: selectedConnection.servidor,
            puerto: parseInt(selectedConnection.puerto),
            usuario: selectedConnection.usuario,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Error al actualizar la conexión');
        }

        toast({
          title: 'Conexión actualizada',
          description: 'Los datos de la conexión fueron actualizados exitosamente.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: (error as Error).message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }

    setIsEditing(false); // Salir del modo edición después de guardar
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  
    setLoading(true);
  
    try {
      const token = localStorage.getItem('token');
  
      const response = await fetch(`http://localhost:8000/bases-datos/${selectedConnectionId}/clave`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain', // Enviar el campo como texto plano
          'Authorization': `Bearer ${token}`,
        },
        body: newPassword, // Solo envía el campo como un string plano
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
        const errorData = await response.json();
        const errorMessage = Array.isArray(errorData.detail)
          ? errorData.detail.map((err: any) => err.msg).join(', ')
          : errorData.detail || 'Error desconocido.';
      
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
  
      toast({
        title: 'Clave actualizada',
        description: 'La clave se actualizó exitosamente.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
  
      setUpdatePasswordMode(false);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Hubo un problema al actualizar la clave.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  

  const handleCancelEdit = () => {
    if (selectedConnectionId && initialData) {
      setConnections((prevConnections) =>
        prevConnections.map((conn) =>
          conn.id === selectedConnectionId ? { ...initialData } : conn
        )
      );
      setIsEditing(false); // Volver a modo solo lectura
    }
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
              {/* Modo solo lectura */}
              {!isEditing && !updatePasswordMode ? (
                <>
                  <Text><strong>Servidor:</strong> {selectedConnection.servidor}</Text>
                  <Text><strong>Puerto:</strong> {selectedConnection.puerto}</Text>
                  <Text><strong>Usuario:</strong> {selectedConnection.usuario}</Text>

                  <Button mt={6} colorScheme="blue" onClick={() => setIsEditing(true)}>
                    Editar
                  </Button>
                  <Button mt={6} colorScheme="gray" onClick={() => setUpdatePasswordMode(true)}>
                    Actualizar Clave
                  </Button>
                </>
              ) : (
                <>
                  {/* Modo edición */}
                  {!updatePasswordMode && (
                    <>
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
                              onChange={(e) => handleFieldChange('puerto', e.target.value)}
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

                      <Stack direction="row" spacing={4} justifyContent="center">
                        <Button colorScheme="blue" onClick={handleSaveChanges}>
                          Guardar Cambios
                        </Button>
                        <Button colorScheme="red" onClick={handleCancelEdit}>
                          Cancelar
                        </Button>
                      </Stack>
                    </>
                  )}

                  {/* Modo de actualización de clave */}
                  {updatePasswordMode && (
                    <>
                      <FormControl id="newPassword" mb={4}>
                        <FormLabel>Nueva Clave</FormLabel>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Ingresa la nueva clave"
                        />
                      </FormControl>

                      <FormControl id="confirmNewPassword" mb={4}>
                        <FormLabel>Confirmar Nueva Clave</FormLabel>
                        <Input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirma la nueva clave"
                        />
                      </FormControl>

                      <Stack direction="row" spacing={4} justifyContent="center">
                        <Button colorScheme="blue" onClick={handleUpdatePassword}>
                          Actualizar Clave
                        </Button>
                        <Button colorScheme="red" onClick={() => setUpdatePasswordMode(false)}>
                          Cancelar
                        </Button>
                      </Stack>
                    </>
                  )}
                </>
              )}
            </Box>
          )}
        </Box>
      </Stack>
    </Flex>
  );
};

export default DatabaseConnectionsManager;
