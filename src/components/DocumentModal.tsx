'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  Textarea,
  Button,
  Icon,
  Flex,
  Box,
  Badge,
  Text,
} from '@chakra-ui/react';
import { FaEye, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import React from 'react';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: { interfaz: string; content: string } | null;
  isEditable: boolean;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onToggleEdit: () => void;
}

const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  document,
  isEditable,
  onContentChange,
  onSave,
  onToggleEdit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent
        bg="white"
        borderRadius="md"
        boxShadow="xl"
        borderTop="4px solid"
        borderColor="blue.500"
      >
        <ModalHeader
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          bg="gray.50"
          borderBottom="1px solid"
          borderColor="gray.200"
          py={4}
        >
          <Flex alignItems="center">
            <Icon as={FaEdit} color="blue.400" mr={2} />
            <Text fontSize="2xl" fontWeight="bold" color="gray.700">
              {document?.interfaz}
            </Text>
          </Flex>
          <Badge
            colorScheme={isEditable ? 'blue' : 'gray'}
            variant="solid"
            fontSize="0.9em"
          >
            {isEditable ? 'Modo Edición' : 'Modo Visualización'}
          </Badge>
        </ModalHeader>
        <ModalCloseButton
          color="gray.600"
          _hover={{ color: "gray.800" }}
          position="absolute"
          top="10px"
          right="10px"
          borderRadius="full"
          bg="gray.100"
          boxSize={8}
        />
        <ModalBody pb={6}>
          <FormControl>
            <Textarea
              value={document?.content || ''}
              onChange={(e) => isEditable && onContentChange(e.target.value)}
              isReadOnly={!isEditable}
              rows={11}
              bg={isEditable ? 'gray.50' : 'white'}
              borderColor="gray.200"
              _focus={{ borderColor: "blue.400" }}
              boxShadow="md"
              p={4}
              borderRadius="md"
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Flex w="full" justifyContent="center">
            <Button
              leftIcon={<Icon as={isEditable ? FaEye : FaEdit} />}
              colorScheme="blue"
              onClick={onToggleEdit}
              mr={3}
              _hover={{ bg: 'blue.500' }}
            >
              {isEditable ? 'Ver' : 'Editar'}
            </Button>
            {isEditable && (
              <Button
                leftIcon={<Icon as={FaSave} />}
                colorScheme="green"
                onClick={onSave}
                mr={3}
                _hover={{ bg: 'green.500' }}
              >
                Guardar
              </Button>
            )}
            <Button
              leftIcon={<Icon as={FaTimes} />}
              variant="ghost"
              colorScheme="gray"
              onClick={onClose}
              _hover={{ bg: 'gray.100' }}
            >
              Cerrar
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DocumentModal;
