import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Heading, Table, Thead, Tbody, Tr, Th, Td, Button, useToast, Link as ChakraLink, Container
} from '@chakra-ui/react';
import Navbar from '../components/navbar';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import contractABI from '../contractsABI/computationTaskABI.json';

const contractAddress = '0xF365A8Aa1f5f809371EEd3E9c5582A54c4B26A69';

const TaskResultsPage = () => {
  const [tasks, setTasks] = useState([]);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const tasksCount = await contract.getTasksCount(); 

        const tasks = [];
        for (let i = 0; i < tasksCount; i++) {
          const task = await contract.tasks(i); 
          tasks.push({
            id: i,
            dataId: task.dataId,
            parameters: task.parameters,
            resultCID: task.resultCID,
            isCompleted: task.isCompleted
          });
        }
        setTasks(tasks);
      } catch (error) {
        toast({
          title: 'Error fetching tasks',
          description: error.message,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    };

    loadTasks();
  }, []);

  return (
    <Box bg="linear-gradient(135deg, #3A8BCD 0%, #8BC4D0 50%, #2F8F83 100%)" minH="100vh">
      <Navbar />
      <Container maxW="container.xl" pt={20}>
        <Heading as="h2" size="xl" textAlign="center" mb={5}>
          Task Results
        </Heading>
        <Table variant="simple" colorScheme="teal">
          <Thead>
            <Tr>
              <Th color="white">Task ID</Th>
              <Th color="white">Data ID</Th>
              <Th color="white">Parameters</Th>
              <Th color="white">Result CID</Th>
              <Th color="white">Status</Th>
              <Th color="white">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tasks.map((task) => (
              <Tr key={task.id}>
                <Td>{task.id}</Td>
                <Td>{task.dataId}</Td>
                <Td>{task.parameters}</Td>
                <Td>{task.resultCID}</Td>
                <Td>{task.isCompleted ? 'Completed' : 'In Progress'}</Td>
                <Td>
                  {task.isCompleted && (
                    <ChakraLink href={`https://ipfs.io/ipfs/${task.resultCID}`} isExternal>
                      <Button colorScheme="blue">Download Result</Button>
                    </ChakraLink>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Container>
    </Box>
  );
};

export default TaskResultsPage;
