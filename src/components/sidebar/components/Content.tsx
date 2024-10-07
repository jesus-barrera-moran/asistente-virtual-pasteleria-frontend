'use client';
import React, { useState, useEffect } from 'react';
// chakra imports
import {
  Box,
  Button,
  Flex,
  Icon,
  Stack,
  Img,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import Links from '@/components/sidebar/components/Links';
import { PropsWithChildren } from 'react';
import { IRoute } from '@/types/navigation';
import { FiLogOut, FiCopy } from 'react-icons/fi'; // Importar icono de copiar
import { useRouter } from 'next/navigation'; // Cambiado a next/navigation
import { HSeparator } from '@/components/separator/Separator';

import logo1 from '../../../../public/img/chat/Logo-1.png';

// FUNCTIONS

interface SidebarContent extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function SidebarContent(props: SidebarContent) {
  const { routes, isPublicRoute } = props;
  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const shadowPillBar = useColorModeValue(
    '4px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    'none',
  );
  const router = useRouter();
  const toast = useToast(); // Hook para mostrar mensajes
  const [userFullName, setUserFullName] = useState<string>('');
  const [publicLink, setPublicLink] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const id_pasteleria = localStorage.getItem('id_pasteleria');
    
    if (token) {
      const user_name = localStorage.getItem('nombre') !== 'null' ? localStorage.getItem('nombre') : '';
      const user_lastname = localStorage.getItem('apellido') !== 'null' ? localStorage.getItem('apellido') : '';
      const username = localStorage.getItem('usuario') !== 'null' ? localStorage.getItem('usuario') : '';

      setUserFullName(
        user_name && user_lastname
          ? `${user_name} ${user_lastname}`
          : username
            ? username
            : 'Desconocido'
      );
      
      // Generar el enlace público usando el host actual
      if (id_pasteleria) {
        const link = `${window.location.host}/publico/${id_pasteleria}`;
        setPublicLink(link);
      }
    }
  }, []);

  const handleLogout = () => {
    // Logout
    localStorage.removeItem('token');
    localStorage.removeItem('id_pasteleria');
    localStorage.removeItem('id_rol');
    localStorage.removeItem('usuario');
    localStorage.removeItem('nombre');
    localStorage.removeItem('apellido');
    // Redirect to login
    router.push('/login');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink);
    toast({
      title: 'Enlace copiado',
      description: 'El enlace público ha sido copiado al portapapeles.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // SIDEBAR
  return (
    <Flex
      direction="column"
      height="100%"
      pt="20px"
      pb="26px"
      borderRadius="30px"
      maxW="285px"
      px="20px"
    >
      {/* Botón para copiar el enlace público */}
      <Button
        variant="transparent"
        border="1px solid"
        borderColor={borderColor}
        borderRadius="full"
        w="34px"
        h="34px"
        px="0px"
        minW="34px"
        justifyContent={'center'}
        alignItems="center"
        onClick={handleCopyLink}
        title="Copiar enlace público"
      >
        <Icon as={FiCopy} width="16px" height="16px" color="inherit" />
      </Button>
      <Img src={logo1.src} w="75px" margin={'auto'} />

      <Flex alignItems="center" flexDirection="column">
        <Text
          textAlign="center"
          fontWeight="900"
          fontSize="24px"
          h="26px"
          w="246px"
          mb="40px"
          mt="20px"
          color={useColorModeValue('navy.700', 'white')}
        >
          DANIELLE BAKERY
        </Text>
        <HSeparator mb="20px" w="284px" />
      </Flex>
      <Stack direction="column" mb="auto" mt="8px">
        <Box ps="0px" pe={{ md: '0px', '2xl': '0px' }}>
          <Links isPublicRoute={isPublicRoute} routes={routes} />
        </Box>
      </Stack>

      {!isPublicRoute && (
        <Flex
          mt="8px"
          justifyContent="center"
          alignItems="center"
          boxShadow={shadowPillBar}
          borderRadius="30px"
          p="14px"
        >
          <Text color={textColor} fontSize="xs" fontWeight="600" me="10px">
            {userFullName}
          </Text>
          <Button
            variant="transparent"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="full"
            w="34px"
            h="34px"
            px="0px"
            minW="34px"
            justifyContent={'center'}
            alignItems="center"
            onClick={handleLogout}
          >
            <Icon as={FiLogOut} width="16px" height="16px" color="inherit" />
          </Button>
        </Flex>
      )}
    </Flex>
  );
}

export default SidebarContent;
