'use client';

import {
  Box,
  Button,
  Flex,
  Stack,
  Spinner,
  HStack,
  VisuallyHidden,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useDisclosure,
  Input,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import mammoth from 'mammoth';
import config from '../config/env';
import DocumentModal from '@/components/DocumentModal';
import ConfirmationModal from '@/components/ConfirmationModal';

type Document = {
  id: number;
  title: string;
  interfaz: string;
  content: string;
  file?: File | null;
};

const DocumentsManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditable, setIsEditable] = useState<boolean>(false);
  const toast = useToast();
  const router = useRouter();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isSaveConfirmOpen,
    onOpen: onSaveConfirmOpen,
    onClose: onSaveConfirmClose
  } = useDisclosure();
  
  const validFileTypes = ['text/plain', 'text/csv', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxFileSize = 2 * 1024 * 1024; // 2MB
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchDocumentsData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const id_pasteleria = localStorage.getItem('id_pasteleria');

        // Llamada al primer endpoint (obtener documentos de la base de datos)
        const documentosResponse = await fetch(`${config.backendHost}/pastelerias/${id_pasteleria}/documentos`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (documentosResponse.status === 401) {
          setLoading(false);
          toast({
            title: 'Sesión expirada',
            description: 'Por favor, inicia sesión nuevamente.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const documentosData = await documentosResponse.json();

        // Llamada al segundo endpoint (obtener contenido de los archivos en la bucket)
        const filesResponse = await fetch(`${config.backendHost}/pastelerias/${id_pasteleria}/files`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const filesData = filesResponse.ok ? await filesResponse.json() : []; // Si no hay archivos, devolver un array vacío

        // Mapear documentos con el contenido del archivo
        const mappedDocuments = documentosData.map((doc: any, index: number) => {
          const matchingFile = filesData.find((file: any) => file.name === doc.nombre);
          return {
            id: index + 1,
            title: doc.nombre,
            interfaz: doc.nombre_interfaz,
            content: matchingFile ? matchingFile.content : '', // Si no existe en bucket, mostrar vacío
          };
        });

        setDocuments(mappedDocuments);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Hubo un problema al cargar los documentos.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentsData();
  }, [toast, router]);

  const handleToggleEdit = () => {
    setIsEditable((prev) => !prev); // Alterna entre modo edición y vista
  };

  const handleViewDocument = (doc: Document) => {
    // Ver documento en modo no editable
    setSelectedDocument(doc);
    setIsEditable(false);
    onOpen();
  };

  const handleEditDocument = (doc: Document) => {
    // Editar documento en modo editable
    setSelectedDocument(doc);
    setIsEditable(true);
    onOpen();
  };

  const handleReplaceDocument = (docId: number) => {
    setSelectedDocument((prev) => (prev?.id === docId ? prev : documents.find((doc) => doc.id === docId) || null));
    
    // Reinicia el input para que se pueda volver a seleccionar el archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    fileInputRef.current?.click(); // Abre el input de archivo
  };

  const handleFileChange = async (file: File | null) => {
    if (file && selectedDocument) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isValidFile = validFileTypes.includes(file.type) || fileExtension === 'md';

      if (!isValidFile) {
        toast({
          title: 'Tipo de archivo no válido',
          description: `Por favor, selecciona un archivo de tipo válido. Los tipos permitidos son: .txt, .csv, .md, .docx`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (file.size > maxFileSize) {
        toast({
          title: 'Archivo demasiado grande',
          description: `El archivo excede el tamaño máximo permitido de 2MB.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const reader = new FileReader();

      if (file.type === 'text/plain' || file.type === 'text/csv' || fileExtension === 'md') {
        reader.onload = async (event) => {
          const fileContent = event.target?.result as string;
          updateDocumentContent(fileContent); // Actualizar y guardar contenido
        };
        reader.readAsText(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        reader.onload = async (event) => {
          const arrayBuffer = event.target?.result;

          mammoth.extractRawText({ arrayBuffer })
            .then((result) => {
              const extractedText = result.value;
              updateDocumentContent(extractedText); // Actualizar y guardar contenido
            })
            .catch(() => {
              toast({
                title: 'Error al leer archivo .docx',
                description: 'Ocurrió un error al leer el archivo Word.',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            });
        };
        reader.readAsArrayBuffer(file);
      }

      reader.onerror = () => {
        console.error('Error al leer el archivo');
      };
    }
  };

  const updateDocumentContent = async (newContent: string) => {
    if (selectedDocument) {
      setSelectedDocument({ ...selectedDocument, content: newContent });

      setDocuments((prevDocuments) =>
        prevDocuments.map((doc) =>
          doc.id === selectedDocument.id ? { ...doc, content: newContent } : doc
        )
      );

      onSaveConfirmOpen();
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);

    if (selectedDocument) {
      try {
        const token = localStorage.getItem('token');
        const id_pasteleria = localStorage.getItem('id_pasteleria');

        const response = await fetch(`${config.backendHost}/writeFileContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: selectedDocument.title,
            content: selectedDocument.content,
          }),
        });

        if (response.status === 401) {
          toast({
            title: 'Sesión expirada',
            description: 'Por favor, inicia sesión nuevamente.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al guardar el documento');
        }

        toast({
          title: 'Cambios guardados',
          description: `El documento '${selectedDocument.interfaz}' ha sido guardado exitosamente.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: `No se pudo guardar el documento: ${(error as Error).message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }

    setLoading(false);
    onSaveConfirmClose();
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="85vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" />
      </Flex>
    );
  }

  return (
    <Flex minH="85vh" align="start" justify="center" bg="none">
      <Stack spacing={8} mx="auto" w="100%" bg="none" pt={16} px={6}>
        <Box w="100%" maxW="1000px" mx="auto" p={6} bg="none" rounded="lg">
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Título</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {documents.map((doc) => (
                  <Tr key={doc.id}>
                    <Td>{doc.interfaz}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button size="sm" onClick={() => handleViewDocument(doc)}>
                          Ver
                        </Button>
                        <Button size="sm" onClick={() => handleEditDocument(doc)}>
                          Editar
                        </Button>
                        <Button size="sm" onClick={() => handleReplaceDocument(doc.id)}>
                          Reemplazar
                        </Button>
                        <VisuallyHidden>
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.csv,.md,.docx"
                            id={`file-input-${doc.id}`}
                            onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                          />
                        </VisuallyHidden>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          <DocumentModal
            isOpen={isOpen}
            onClose={onClose}
            document={selectedDocument}
            isEditable={isEditable}
            onContentChange={(content) => setSelectedDocument((prev) => (prev ? { ...prev, content } : null))}
            onSave={onSaveConfirmOpen}
            onToggleEdit={handleToggleEdit}
          />

          <ConfirmationModal
            isOpen={isSaveConfirmOpen}
            onClose={onSaveConfirmClose}
            onConfirm={handleSaveChanges}
            title="Confirmar Guardado"
            message="¿Estás seguro de que deseas guardar los cambios?"
          />
        </Box>
      </Stack>
    </Flex>
  );
};

export default DocumentsManager;
