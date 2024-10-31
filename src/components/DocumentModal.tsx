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
    document: { title: string; content: string } | null;
    isEditable: boolean;
    onContentChange: (content: string) => void;
    onSave: () => void;
  }
  
  const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, document, isEditable, onContentChange, onSave }) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader>{document?.title}</ModalHeader>
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
            {isEditable && (
              <Button colorScheme="blue" onClick={onSave}>
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
  