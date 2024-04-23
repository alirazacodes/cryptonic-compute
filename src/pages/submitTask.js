import { useState, useEffect } from 'react';
import {
  Box, Flex, FormControl, FormLabel, Input, Button, Textarea, Heading, useToast, Table, Thead, Tr, Th, Tbody, 
  Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalHeader, ModalBody, Progress, Text, useDisclosure
} from '@chakra-ui/react';
import Navbar from '../components/navbar';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import dataManagerABI from '../contractsABI/dataManagerABI.json';

const dataManagerAddress = '0x17e9e019bfbe77cb2f2d944a84768311ba147206';

const SubmitTaskPage = () => {
  const [dataId, setDataId] = useState('');
  const [parameters, setParameters] = useState('');
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [dataManagerContract, setDataManagerContract] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(dataManagerAddress, dataManagerABI, signer);
      setDataManagerContract(contract);
    }
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadToIPFS = async () => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });
      
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`);
            return null;
        }
  
        const data = await response.text();
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to upload to IPFS:', error);
        return null;
    }
  };
  
  
  const submitTask = async (event) => {
    event.preventDefault();
    onOpen();
    setStage('Uploading to IPFS...');
    setProgress(33);
    const cid = await uploadToIPFS();

    if (cid) {
      setStage('Recording Transaction on Blockchain...');
      setProgress(66);
      try {
        const dataIdBytes = ethers.utils.formatBytes32String(dataId);
        const tx = await dataManagerContract.submitData(dataIdBytes, cid);
        await tx.wait();
        setSubmissions([...submissions, { dataId, parameters, cid }]);
        setStage('Data Submitted Successfully');
        setProgress(100);
        toast({
          title: 'Task Submitted Successfully',
          description: "Your data is now on the blockchain.",
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error recording data on blockchain:', error);
        toast({
          title: 'Blockchain Submission Error',
          description: error.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    } else {
        toast({
          title: 'Upload to IPFS Failed',
          description: "There was a problem uploading the file to IPFS.",
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
      onClose();
  };
  

//   const animateProcess = () => {
//     setStage('Encrypting Data...');
//     setProgress(33);
//     setTimeout(() => {
//       setStage('Uploading to IPFS...');
//       setProgress(66);
//       setTimeout(() => {
//         setStage('Recording Transaction on Blockchain...');
//         setProgress(100);
//         setTimeout(() => {
//           onClose(); 
//           toast({
//             title: 'Task submitted successfully',
//             description: "We've submitted your computation task to the blockchain.",
//             status: 'success',
//             duration: 9000,
//             isClosable: true,
//           });
//           router.push('/dashboard'); 
//         }, 2000); 
//       }, 2000); 
//     }, 2000); 
//   };

  return (
    <Box bg="linear-gradient(135deg, #3A8BCD 0%, #8BC4D0 50%, #2F8F83 100%)" minH="100vh">
      <Navbar />
      <Flex align="center" justifyContent="center" h="100vh">
        <Box p={8} maxWidth="500px" width="full" boxShadow="2xl" rounded="lg">
          <Heading as="h2" mb={6}>Submit New Computation Task</Heading>
          <form onSubmit={submitTask}>
            <FormControl isRequired>
              <FormLabel htmlFor='dataId'>Data ID</FormLabel>
              <Input id='dataId' placeholder='Enter data identifier' value={dataId} onChange={(e) => setDataId(e.target.value)} />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel htmlFor='parameters'>Parameters</FormLabel>
              <Textarea id='parameters' placeholder='Describe the computation parameters' value={parameters} onChange={(e) => setParameters(e.target.value)} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel htmlFor='file'>Upload Data File</FormLabel>
              <Input type="file" id='file' onChange={handleFileChange} />
            </FormControl>
            <Button mt={8} width="full" type="submit" colorScheme="blue">Submit Task</Button>
          </form>
          <Table variant="simple" mt={10}>
            <Thead>
              <Tr>
                <Th>Data ID</Th>
                <Th>Parameters</Th>
                <Th>IPFS CID</Th>
              </Tr>
            </Thead>
            <Tbody>
              {submissions.map((sub, index) => (
                <Tr key={index}>
                  <Td>{sub.dataId}</Td>
                  <Td>{sub.parameters}</Td>
                  <Td>{sub.cid}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Processing Your Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>{stage}</Text>
            <Progress value={progress} size="lg" colorScheme="blue" hasStripe isAnimated />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SubmitTaskPage;
