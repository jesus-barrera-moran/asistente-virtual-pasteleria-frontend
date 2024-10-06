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
  HStack,
  VisuallyHidden,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUpload, FiTrash } from 'react-icons/fi';
import { useState } from 'react';

const PastryForm: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [postalCode, setPostalCode] = useState<number>(0);
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [menuLogo, setMenuLogo] = useState<any>();
  const [backgroudLogo, setBackgroundLogo] = useState<any>();

  const handleSubmit = async () => {
    setLoading(true);
  
    // Crear el objeto con los datos que se enviarán en la solicitud
    const newPastry = {
      nombre: name, // 'nombre' debe coincidir con el parámetro del endpoint
      email,
      telefono: String(phone), // 'telefono' para coincidir con el parámetro del endpoint
      direccion: address, // 'direccion' para coincidir con el parámetro del endpoint
      ciudad: city, // 'ciudad' para coincidir con el parámetro del endpoint
      codigo_postal: postalCode, // 'codigo_postal' para coincidir con el parámetro del endpoint
      url_website: websiteUrl, // 'url_website' para coincidir con el parámetro del endpoint
    };
  
    try {
      // Llamar al endpoint con fetch
      const response = await fetch('http://localhost:8000/pastelerias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // El contenido es JSON
        },
        body: JSON.stringify(newPastry), // Convertimos el objeto a JSON
      });
  
      // Manejar la respuesta
      if (response.ok) {
        const data = await response.json();
        console.log('Pastelería creada con éxito:', data);
        // Aquí puedes agregar cualquier lógica adicional que quieras ejecutar tras el éxito
      } else {
        console.error('Error al crear la pastelería:', response.status);
        // Aquí puedes manejar errores específicos
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    } finally {
      setLoading(false); // Parar el estado de carga una vez finalizado
    }
  };  

  return (
    <Flex minH="100vh" align="center" justify="center" bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx="auto" maxW="800px" w="800px" py={12} px={6}>
        <Stack align="center">
          <Heading fontSize="4xl">Nueva Pastelería</Heading>
          <Text fontSize="lg" color={useColorModeValue('gray.600', 'whiteAlpha.800')}>
            Crea una nueva pastelería ingresando sus datos
          </Text>
        </Stack>
        <Box rounded="lg" bg={useColorModeValue('white', 'gray.700')} boxShadow="lg" p={8}>
          <Stack spacing={4}>
            <FormControl id="name">
              <FormLabel>Nombre</FormLabel>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la pastelería"
              />
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl id="email">
                  <FormLabel>Correo Electrónico</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico de contacto"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl id="phone">
                  <FormLabel>Teléfono</FormLabel>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Número de teléfono"
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl id="city">
                  <FormLabel>Ciudad</FormLabel>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ciudad"
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl id="postalCode">
                  <FormLabel>Código Postal</FormLabel>
                  <Input
                    type="number"
                    value={postalCode}
                    onChange={(e) => setPostalCode(parseInt(e.target.value))}
                    placeholder="Código postal"
                  />
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl id="address">
              <FormLabel>Dirección</FormLabel>
              <Input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Dirección de la pastelería"
              />
            </FormControl>

            <FormControl id="websiteUrl">
                <FormLabel>Sitio Web</FormLabel>
                <Input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="URL del sitio web"
                />
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl id={`file-menu-logo`} mt={4}>
                  <FormLabel>Logo de Menú</FormLabel>
                  <HStack spacing={4}>
                    <Box>
                      <VisuallyHidden>
                        <Input
                          type="file"
                          id={`file-input-menu-logo`}
                          onChange={(e) => setMenuLogo(e.target.files ? e.target.files[0] : null)}
                        />
                      </VisuallyHidden>
                      <label htmlFor={`file-input-menu-logo`}>
                        <IconButton
                          as="span"
                          aria-label="Subir archivo"
                          icon={<FiUpload />}
                          bg="blue.400"
                          color="white"
                          _hover={{ bg: 'blue.500' }}
                          size="md"
                        />
                      </label>
                    </Box>
                    {menuLogo?.file ? (
                      <>
                        <Text>{menuLogo?.file.name}</Text>
                        <IconButton
                          aria-label="Eliminar archivo"
                          icon={<FiTrash />}
                          colorScheme="red"
                          onClick={() => setMenuLogo(null)}
                        />
                      </>
                    ) : (
                      <Text>Ningún archivo seleccionado</Text>
                    )}
                  </HStack>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl id={`file-background-logo`} mt={4}>
                  <FormLabel>Logo de Fondo</FormLabel>
                  <HStack spacing={4}>
                    <Box>
                      <VisuallyHidden>
                        <Input
                          type="file"
                          id={`file-input-background-logo`}
                          onChange={(e) => setBackgroundLogo(e.target.files ? e.target.files[0] : null)}
                        />
                      </VisuallyHidden>
                      <label htmlFor={`file-input-background-logo`}>
                        <IconButton
                          as="span"
                          aria-label="Subir archivo"
                          icon={<FiUpload />}
                          bg="blue.400"
                          color="white"
                          _hover={{ bg: 'blue.500' }}
                          size="md"
                        />
                      </label>
                    </Box>
                    {backgroudLogo?.file ? (
                      <>
                        <Text>{backgroudLogo?.file.name}</Text>
                        <IconButton
                          aria-label="Eliminar archivo"
                          icon={<FiTrash />}
                          colorScheme="red"
                          onClick={() => setBackgroundLogo(null)}
                        />
                      </>
                    ) : (
                      <Text>Ningún archivo seleccionado</Text>
                    )}
                  </HStack>
                </FormControl>
              </GridItem>
            </Grid>

            <Stack mt={5} spacing={10}>
              <Button
                bg="blue.400"
                color="white"
                _hover={{
                  bg: 'blue.500',
                }}
                onClick={handleSubmit}
                isLoading={loading}
              >
                Registrar Pastelería
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};

export default PastryForm;
