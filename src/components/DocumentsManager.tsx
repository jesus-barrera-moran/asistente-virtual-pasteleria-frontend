'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  Select,
  Text,
  HStack,
  VisuallyHidden,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FiUpload, FiTrash } from 'react-icons/fi';
import { useState } from 'react';
import mammoth from 'mammoth'; // Para manejar archivos .docx

type Document = {
  id: number;
  title: string;
  content: string;
  file?: File | null;
};

const initialDocuments: Document[] = [
  { id: 1, title: 'Documento 1', content: 'Este es el contenido del Documento 1.' },
  { id: 2, title: 'Documento 2', content: 'Este es el contenido del Documento 2.' },
  { id: 3, title: 'Documento 3', content: 'Este es el contenido del Documento 3.' },
];

const DocumentsManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  // Tipos de archivo permitidos (MIME types)
  const validFileTypes = [
    'text/plain', // .txt
    'text/csv', // .csv
    'text/markdown', // .md
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ];

  const maxFileSize = 2 * 1024 * 1024; // Tamaño máximo del archivo en bytes (2MB)

  const handleDocumentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(event.target.value, 10);
    setSelectedDocumentId(selectedId);
  };

  const handleContentChange = (newContent: string) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === selectedDocumentId ? { ...doc, content: newContent } : doc
      )
    );
  };

  const handleFileChange = async (file: File | null) => {
    if (file && selectedDocumentId !== null) {
      // Verificar el tipo MIME del archivo
      if (!validFileTypes.includes(file.type)) {
        toast({
          title: 'Tipo de archivo no válido',
          description: `Por favor, selecciona un archivo de tipo válido. Los tipos permitidos son: ${validFileTypes.join(', ')}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Verificar el tamaño del archivo
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

      // Si el archivo es un archivo de texto (.txt, .csv o .md)
      if (file.type === 'text/plain' || file.type === 'text/csv' || file.type === 'text/markdown') {
        reader.onload = (event) => {
          const fileContent = event.target?.result as string;

          // Actualizamos el contenido del documento con el contenido del archivo cargado
          setDocuments((prevDocuments) =>
            prevDocuments.map((doc) =>
              doc.id === selectedDocumentId ? { ...doc, content: fileContent, file } : doc
            )
          );
        };
        reader.readAsText(file); // Leemos el archivo como texto
      }

      // Si el archivo es Word (.docx)
      else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        reader.onload = (event) => {
          const arrayBuffer = event.target?.result;

          // Usar Mammoth.js para extraer texto del archivo .docx
          mammoth.extractRawText({ arrayBuffer })
            .then((result) => {
              const extractedText = result.value; // Texto extraído

              // Actualizamos el contenido del documento con el texto extraído
              setDocuments((prevDocuments) =>
                prevDocuments.map((doc) =>
                  doc.id === selectedDocumentId ? { ...doc, content: extractedText, file } : doc
                )
              );
            })
            .catch((err) => {
              toast({
                title: 'Error al leer archivo .docx',
                description: 'Ocurrió un error al leer el archivo Word.',
                status: 'error',
                duration: 5000,
                isClosable: true,
              });
            });
        };
        reader.readAsArrayBuffer(file); // Leemos el archivo .docx como ArrayBuffer
      }

      reader.onerror = () => {
        console.error('Error al leer el archivo');
      };
    }
  };

  const handleRemoveFile = () => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === selectedDocumentId ? { ...doc, file: null } : doc
      )
    );
  };

  const handleSaveChanges = async () => {
    setLoading(true);

    const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);
    if (selectedDocument) {
      console.log('Documento guardado:', selectedDocument);

      if (selectedDocument.file) {
        console.log('Archivo cargado:', selectedDocument.file.name);
      }
    }

    setLoading(false);
  };

  const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);

  return (
    <Flex align="center" justify="center" bg="none">
      <Stack spacing={8} mx="auto" w="100%" bg="none" pt={16} px={6}>
        <Box w="100%" maxW="1000px" mx="auto" p={6} bg="none" rounded="lg">
          <FormControl id="select-document">
            <FormLabel>Seleccionar Documento</FormLabel>
            <Select placeholder="Selecciona un documento" onChange={handleDocumentChange}>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))}
            </Select>
          </FormControl>

          {selectedDocument && (
            <Box mt={6}>
              <FormControl id={`title-${selectedDocument.id}`}>
                <FormLabel>Título</FormLabel>
                <Input type="text" value={selectedDocument.title} readOnly isReadOnly />
              </FormControl>

              <FormControl id={`content-${selectedDocument.id}`} mt={4}>
                <FormLabel>Contenido</FormLabel>
                <Textarea
                  value={selectedDocument.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Escribe el contenido del documento aquí..."
                  rows={6}
                />
              </FormControl>

              <FormControl id={`file-${selectedDocument.id}`} mt={4}>
                <FormLabel>Cargar Archivo</FormLabel>
                <HStack spacing={4}>
                  <Box>
                    <VisuallyHidden>
                      <Input
                        type="file"
                        accept=".txt,.csv,.md,.docx"  // Especificar extensiones permitidas
                        id={`file-input-${selectedDocument.id}`}
                        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                      />
                    </VisuallyHidden>
                    <label htmlFor={`file-input-${selectedDocument.id}`}>
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
                  {selectedDocument.file ? (
                    <>
                      <Text>{selectedDocument.file.name}</Text>
                      <IconButton
                        aria-label="Eliminar archivo"
                        icon={<FiTrash />}
                        colorScheme="red"
                        onClick={handleRemoveFile}
                      />
                    </>
                  ) : (
                    <Text>Ningún archivo seleccionado</Text>
                  )}
                </HStack>
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

export default DocumentsManager;
