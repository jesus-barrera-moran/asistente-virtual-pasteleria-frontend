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
} from '@chakra-ui/react';
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
  onToggleEdit, // Recibimos la función para alternar el modo
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent bg="white">
        <ModalHeader>{document?.interfaz}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <Textarea
              value={document?.content || ''}
              onChange={(e) => isEditable && onContentChange(e.target.value)}
              isReadOnly={!isEditable}
              rows={10}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onToggleEdit} mr={3}>
            {isEditable ? 'Ver' : 'Editar'} {/* Alternar el texto según el estado */}
          </Button>
          {isEditable && (
            <Button colorScheme="green" onClick={onSave} mr={3}>
              Guardar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DocumentModal;
