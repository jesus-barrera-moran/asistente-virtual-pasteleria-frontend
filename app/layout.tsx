'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import { Box, Portal } from '@chakra-ui/react';
import routes from '@/routes';
import Sidebar from '@/components/sidebar/Sidebar';
import Navbar from '@/components/navbar/NavbarAdmin';
import { getActiveRoute, getActiveNavbar } from '@/utils/navigation';
import { usePathname } from 'next/navigation';
import '@/styles/App.css';
import '@/styles/Contact.css';
import '@/styles/Plugins.css';
import '@/styles/MiniCalendar.css';
import AppWrappers from './AppWrappers';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isAllowed, setIsAllowed] = useState(false);

  const isPublicRoute = pathname?.startsWith('/publico'); // Verifica si la ruta es de clientes
  const isExternal = pathname?.startsWith('/register') || pathname?.startsWith('/login');

  // Verificar si hay un token para rutas que no son públicas
  useEffect(() => {
    if (!isPublicRoute && !isExternal) {
      const token = localStorage.getItem('token'); // Aquí se verifica la existencia del token
      if (!token) {
        // Si no hay token, redirigir al login
        setIsAllowed(false);
        window.location.href = '/login';
      } else {
        setIsAllowed(true);
      }
    } else {
      setIsAllowed(true);
    }
  }, [isPublicRoute]);

  return (
    <html lang="en">
      <body id={'root'}>
        {isAllowed &&
          <AppWrappers>
            {pathname?.startsWith('/register') || pathname?.startsWith('/login') ? (
              children
            ) : (
              <Box>
                <Sidebar routes={routes} />
                <Box
                  pt={{ base: '60px', md: '0px' }}
                  float="right"
                  minHeight="100vh"
                  height="100%"
                  overflow="auto"
                  position="relative"
                  maxHeight="100%"
                  w={{ base: '100%', xl: 'calc( 100% - 290px )' }}
                  maxWidth={{ base: '100%', xl: 'calc( 100% - 290px )' }}
                  transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
                  transitionDuration=".2s, .2s, .35s"
                  transitionProperty="top, bottom, width"
                  transitionTimingFunction="linear, linear, ease"
                >
                  <Portal>
                    <Box>
                      <Navbar
                        brandText={getActiveRoute(routes, pathname)}
                        secondary={getActiveNavbar(routes, pathname)}
                      />
                    </Box>
                  </Portal>
                  <Box
                    mx="auto"
                    p={{ base: '20px', md: '30px' }}
                    pe="20px"
                    pt="50px"
                  >
                    {children}
                  </Box>
                </Box>
              </Box>
            )}
          </AppWrappers>
        }
      </body>
    </html>
  );
}
