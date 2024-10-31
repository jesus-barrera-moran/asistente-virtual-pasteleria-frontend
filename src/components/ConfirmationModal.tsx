'use client';

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
  } from '@chakra-ui/react';
  import React from 'react';
  
  interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
  }
  
  const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalOverlay />
        <ModalContent bg="white">
          <ModalHeader>{title}</ModalHeader>
          <ModalBody>{message}</ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onConfirm}>
              Confirmar
            </Button>
            <Button onClick={onClose} ml={3}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };
  
  export default ConfirmationModal;
  