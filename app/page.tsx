'use client';
/*eslint-disable*/

import Link from '@/components/link/Link';
import MessageBoxChat from '@/components/MessageBox';
import { ChatBody, OpenAIModel } from '@/types/types';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Icon,
  Img,
  Input,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { MdAutoAwesome, MdBolt, MdEdit, MdPerson } from 'react-icons/md';
// import Bg from '../public/img/chat/bg-image-2.png';
import logo2 from '../public/img/chat/Logo-2.png';

export default function Chat(props: { apiKeyApp: string }) {
  // Input States
  const [inputOnSubmit, setInputOnSubmit] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  // Response message
  const [outputCode, setOutputCode] = useState<string>('');
  // ChatGPT model
  const [model, setModel] = useState<OpenAIModel>('gpt-4o');
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // API Key
  // const [apiKey, setApiKey] = useState<string>(apiKeyApp);
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const iconColor = useColorModeValue('brand.500', 'white');
  const bgIcon = useColorModeValue(
    'linear-gradient(180deg, #FBFBFF 0%, #CACAFF 100%)',
    'whiteAlpha.200',
  );
  const brandColor = useColorModeValue('brand.500', 'white');
  const buttonBg = useColorModeValue('white', 'whiteAlpha.100');
  const gray = useColorModeValue('gray.500', 'white');
  const buttonShadow = useColorModeValue(
    '14px 27px 45px rgba(112, 144, 176, 0.2)',
    'none',
  );
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );
  // const handleTranslate = async () => {
  //   let apiKey = localStorage.getItem('apiKey');
  //   setInputOnSubmit(inputCode);

  //   // Chat post conditions(maximum number of characters, valid message etc.)
  //   const maxCodeLength = model === 'gpt-4o' ? 700 : 700;

  //   if (!apiKey?.includes('sk-')) {
  //     alert('Please enter an API key.');
  //     return;
  //   }

  //   if (!inputCode) {
  //     alert('Please enter your message.');
  //     return;
  //   }

  //   if (inputCode.length > maxCodeLength) {
  //     alert(
  //       `Please enter code less than ${maxCodeLength} characters. You are currently at ${inputCode.length} characters.`,
  //     );
  //     return;
  //   }
  //   setOutputCode(' ');
  //   setLoading(true);
  //   const controller = new AbortController();
  //   const body: ChatBody = {
  //     inputCode,
  //     model,
  //     apiKey,
  //   };

  //   // -------------- Fetch --------------
  //   const response = await fetch('./api/chatAPI', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     signal: controller.signal,
  //     body: JSON.stringify(body),
  //   });

  //   if (!response.ok) {
  //     setLoading(false);
  //     if (response) {
  //       alert(
  //         'Something went wrong went fetching from the API. Make sure to use a valid API key.',
  //       );
  //     }
  //     return;
  //   }

  //   const data = response.body;

  //   if (!data) {
  //     setLoading(false);
  //     alert('Something went wrong');
  //     return;
  //   }

  //   const reader = data.getReader();
  //   const decoder = new TextDecoder();
  //   let done = false;

  //   while (!done) {
  //     setLoading(true);
  //     const { value, done: doneReading } = await reader.read();
  //     done = doneReading;
  //     const chunkValue = decoder.decode(value);
  //     setOutputCode((prevCode) => prevCode + chunkValue);
  //   }

  //   setLoading(false);
  // };

  const handleTranslate = async () => {
    setInputOnSubmit(inputCode);

    setOutputCode(' ');
    setLoading(true);
    const controller = new AbortController();
    const body = {
      input: {
        input: 'Hola',
      },
    };

    // -------------- Fetch --------------
    const response = await fetch('http://localhost:8000/asistente/invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbnRvbmlvIiwiZXhwIjoxNzIwOTkxNzI1fQ.o1yjcCPTz_clCOYxr8WGOIpBr1nnCWJ6vHlSIv89f5Q',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      if (response) {
        alert(
          'Something went wrong went fetching from the API. Make sure to use a valid API key.',
        );
      }
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('Something went wrong');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      setLoading(true);
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      const chunkValueJson = chunkValue ? JSON.parse(chunkValue) : chunkValue;
      const chunkValueJsonResponse = chunkValueJson?.output?.output;
      const chunkValueStringResponse = JSON.stringify(chunkValueJsonResponse);
      setOutputCode((prevCode) => chunkValueStringResponse ? prevCode + chunkValueStringResponse : prevCode);
    }

    setLoading(false);
  }

  // -------------- Copy Response --------------
  // const copyToClipboard = (text: string) => {
  //   const el = document.createElement('textarea');
  //   el.value = text;
  //   document.body.appendChild(el);
  //   el.select();
  //   document.execCommand('copy');
  //   document.body.removeChild(el);
  // };

  // *** Initializing apiKey with .env.local value
  // useEffect(() => {
  // ENV file verison
  // const apiKeyENV = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  // if (apiKey === undefined || null) {
  //   setApiKey(apiKeyENV)
  // }
  // }, [])

  const handleChange = (Event: any) => {
    setInputCode(Event.target.value);
  };

  return (
    <Flex
      w="100%"
      pt={{ base: '70px', md: '0px' }}
      direction="column"
      position="relative"
      h={{ base: '85vh', '2xl': '85vh' }}
    >
      <Img
        src={logo2.src}
        position={'absolute'}
        w="700px"
        left="50%"
        top="50%"
        transform={'translate(-50%, -50%)'}
      />
      <Flex
        direction="column"
        mx="auto"
        w={{ base: '100%', md: '100%', xl: '100%' }}
        minH={{ base: '70vh', '2xl': '85vh' }}
        maxW="1000px"
        pt="75px"
        gap="10px"
        height="100%"
        justifyContent={outputCode ? "space-between" : "flex-end"}
      >
        {/* Main Box */}
        <Flex
          direction="column"
          w="100%"
          mx="auto"
          p="20px"
          width="95%"
          display={outputCode ? 'flex' : 'none'}
        >
          <Flex align={'center'} mb="10px">
            <Flex
              borderRadius="full"
              justify="center"
              align="center"
              bg={'transparent'}
              border="1px solid"
              borderColor={borderColor}
              me="20px"
              h="40px"
              minH="40px"
              minW="40px"
            >
              <Icon
                as={MdPerson}
                width="20px"
                height="20px"
                color={brandColor}
              />
            </Flex>
            <Flex
              p="22px"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="14px"
              w="93%"
              zIndex={'2'}
            >
              <Text
                color={textColor}
                maxW="-webkit-fill-available"
                fontWeight="600"
                fontSize={{ base: 'sm', md: 'md' }}
                lineHeight={{ base: '24px', md: '26px' }}
              >
                {inputOnSubmit}
              </Text>
              <Icon
                cursor="pointer"
                as={MdEdit}
                ms="auto"
                width="20px"
                height="20px"
                color={gray}
              />
            </Flex>
          </Flex>
          <Flex>
            <Flex
              borderRadius="full"
              justify="center"
              align="center"
              bg={'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)'}
              me="20px"
              h="40px"
              minH="40px"
              minW="40px"
            >
              <Icon
                as={MdAutoAwesome}
                width="20px"
                height="20px"
                color="white"
              />
            </Flex>
            <MessageBoxChat output={outputCode} />
          </Flex>
        </Flex>
        {/* Chat Input */}
        <Flex
          ms={{ base: '0px', xl: '60px' }}
          justifySelf={'flex-end'}
        >
          <Input
            minH="54px"
            h="100%"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="45px"
            p="15px 20px"
            me="10px"
            fontSize="sm"
            fontWeight="500"
            _focus={{ borderColor: 'none' }}
            color={inputColor}
            _placeholder={placeholderColor}
            placeholder="Escribe tu consulta aquí..."
            onChange={handleChange}
          />
          <Button
            variant="primary"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            ms="auto"
            w={{ base: '160px', md: '210px' }}
            h="54px"
            _hover={{
              boxShadow:
                '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',
              bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',
              _disabled: {
                bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
              },
            }}
            onClick={handleTranslate}
            isLoading={loading ? true : false}
          >
            Enviar
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
