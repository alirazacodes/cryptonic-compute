import React, { useState, useEffect } from 'react';
import {
  Box, Flex, FormControl, FormLabel, Input, Button, Heading, useToast, Table, Thead, Tbody, Tr, Th, Td,
  Select, useColorModeValue, RadioGroup, Radio, Stack, Text, Badge
} from '@chakra-ui/react';
import Navbar from '../components/navbar';
import { ethers } from 'ethers';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import accessControlABI from '../contractsABI/accessControlABI.json';

const contractAddress = "0xad48e160249326c1f9fdfc3eda72d32773c64717";

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [account, setAccount] = useState('');
  const [expirationType, setExpirationType] = useState('date');
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [roleDescription, setRoleDescription] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [accessControl, setAccessControl] = useState(null);
  const toast = useToast();
  const formBackground = useColorModeValue("whiteAlpha.500", "whiteAlpha.200");

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const accessControl = new ethers.Contract(contractAddress, accessControlABI, signer);
      setProvider(provider);
      setSigner(signer);
      setAccessControl(accessControl);
      fetchRoles(accessControl);
    }
  }, []);

  const fetchRoles = async (accessControl) => {
    if (!accessControl) return;
    try {
        const roleIds = await accessControl.getAllRoles();
        console.log('Role IDs fetched:', roleIds);

        const fetchedRoles = await Promise.all(roleIds.map(async (id) => {
            try {
                const roleDetails = await accessControl.getRoleDetails(id);
                console.log(`Role Details for ID ${ethers.utils.parseBytes32String(id)}:`, roleDetails);
                const members = roleDetails[3]; 
                const formattedAccounts = members.length > 0 ? members.map(address => 
                    address === '0x0000000000000000000000000000000000000000' ? 'N/A' : `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
                ).join(', ') : 'N/A';

                const formattedExpiration = roleDetails[1].toNumber() === 0
                    ? 'Permanent'
                    : new Date(roleDetails[1].toNumber() * 1000).toUTCString();

                return {
                    role: ethers.utils.parseBytes32String(id),
                    account: formattedAccounts,
                    description: ethers.utils.parseBytes32String(roleDetails[2]),
                    expiration: formattedExpiration
                };
            } catch (error) {
                console.error(`Error fetching details for role ID ${id}:`, error);
                return null; // Consider handling this more gracefully
            }
        }));

        setRoles(fetchedRoles.filter(role => role !== null));
    } catch (error) {
        console.error('Error fetching roles:', error);
        toast({
            title: 'Error fetching roles',
            description: `Failed to fetch roles: ${error.message}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    }
};


  const handleGrant = async (event) => {
    event.preventDefault();
    if (!accessControl) {
      toast({
        title: 'Error',
        description: 'Blockchain access is not available.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  
    // Description and role ID to bytes32
    const roleBytes32 = ethers.utils.formatBytes32String(newRole);  
    const descriptionBytes32 = ethers.utils.formatBytes32String(roleDescription); 
    const expirationTimestamp = expirationType === 'permanent' ? 0 : Math.floor(expirationDate.getTime() / 1000);
  
    try {
      const tx = await accessControl.grantRole(roleBytes32, account, descriptionBytes32, expirationTimestamp);
      await tx.wait();
      toast({
        title: 'Role Granted',
        description: 'Role has been successfully granted.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchRoles(accessControl); 
    } catch (error) {
      console.error('Error granting role:', error);
      toast({
        title: 'Error',
        description: `Failed to grant role: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };  

  const handleRevoke = async (role, account) => {
    console.log(`Attempting to revoke role: ${role} from account: ${account}`);

    if (!ethers.utils.isAddress(account)) {
        console.error("Invalid address provided:", account);
        toast({
            title: 'Invalid Address',
            description: 'The provided address is invalid, please check the formatting.',
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
        return;
    }

    const roleBytes32 = ethers.utils.formatBytes32String(role);

    try {
        const tx = await accessControl.revokeRole(roleBytes32, account);
        await tx.wait();
        toast({
            title: 'Role Revoked',
            description: 'Role has been successfully revoked.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
        });
        fetchRoles(accessControl);  
    } catch (error) {
        console.error('Error revoking role:', error);
        toast({
            title: 'Error',
            description: `Failed to revoke role: ${error.message}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    }
    };

  return (
    <Box bg="linear-gradient(135deg, #3A8BCD 0%, #8BC4D0 50%, #2F8F83 100%)" minH="100vh">
      <Navbar />
      <Flex direction="column" align="center" p={5} pt={20}>
        <Heading as="h2" size="xl" textAlign="center" mb={5}>
          Manage Roles
        </Heading>
        <Box p={8} maxWidth="500px" width="full" boxShadow="2xl" rounded="lg" bg={formBackground} backdropFilter="blur(10px)">
          <form onSubmit={handleGrant}>
            <FormControl isRequired mb={4}>
              <FormLabel>Role ID</FormLabel>
              <Input placeholder='Enter Role ID' value={newRole} onChange={(e) => setNewRole(e.target.value)} />
            </FormControl>
            <FormControl isRequired mb={4}>
              <FormLabel>Account Address</FormLabel>
              <Input placeholder='Enter Account Address' value={account} onChange={(e) => setAccount(e.target.value)} />
            </FormControl>
            <FormControl isRequired mb={4}>
              <FormLabel>Role Description</FormLabel>
              <Input placeholder='Enter Role Description' value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} />
            </FormControl>
            <FormControl isRequired mb={4}>
              <FormLabel>Expiration</FormLabel>
              <RadioGroup onChange={setExpirationType} value={expirationType}>
                <Stack direction="row">
                  <Radio value="date">Date</Radio>
                  <Radio value="permanent">Permanent</Radio>
                </Stack>
              </RadioGroup>
              {expirationType === 'date' && (
                <DatePicker
                  selected={expirationDate}
                  onChange={date => setExpirationDate(date)}
                  dateFormat="MMMM d, yyyy"
                  minDate={new Date()}
                  className="date-picker"
                />
              )}
            </FormControl>
            <Button mt={4} width="full" colorScheme="blue" type="submit">Grant Role</Button>
          </form>
        </Box>
        <Table variant="simple" colorScheme="blue" mt={10}>
            <Thead>
                <Tr>
                    <Th>Role-ID</Th>
                    <Th>Account</Th>
                    <Th>Description</Th>
                    <Th>Expiration</Th>
                    <Th>Action</Th>
                </Tr>
            </Thead>
            <Tbody>
                {roles.map((role, index) => (
                    <Tr key={index}>
                        <Td>{role.role}</Td>
                        <Td>{role.account}</Td>
                        <Td><Badge colorScheme="green">{role.description}</Badge></Td>
                        <Td>{role.expiration}</Td>
                        <Td>
                            <Button colorScheme="red" onClick={() => handleRevoke(role.role, role.account)}>Revoke</Button>
                        </Td>
                    </Tr>
                ))}
            </Tbody>
        </Table>
      </Flex>
    </Box>
  );
};

export default RolesPage;
