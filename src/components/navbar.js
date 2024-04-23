import { Box, Button, Flex, Text, Link, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const Navbar = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchBalance = async (provider, address) => {
    const balance = await provider.getBalance(address);
    setBalance(ethers.utils.formatEther(balance));
  };

  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            fetchBalance(provider, accounts[0]);
          }
        } catch (err) {
          console.error("Failed to connect wallet:", err);
        }
      }
    };
    connectWalletOnPageLoad();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
        fetchBalance(provider, accounts[0]);
      } catch (err) {
        console.error("Failed to connect wallet:", err);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      px={5}
      py={3}
      bg="rgba(255, 255, 255, 0.1)"
      backdropFilter="blur(10px)"
      color="white"
      boxShadow="md"
      position="fixed"
      width="full"
      zIndex="banner"
    >
      <Text fontSize="xl" fontWeight="bold">Cryptonic Compute</Text>
      <Box>
        {walletAddress ? (
          <>
            <Link px={2} href="/" fontWeight="bold">Home</Link>
            <Link px={2} href="/dashboard" fontWeight="bold">Dashboard</Link>
            <Link px={2} href="/submitTask" fontWeight="bold">Submit Task</Link>
            <Link px={2} href="/taskResult" fontWeight="bold">Task Results</Link>
            <Link px={2} href="/roles" fontWeight="bold">Roles</Link>
            <Button ml={4} onClick={onOpen}>
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)} ({parseFloat(balance).toFixed(4)} ETH)
            </Button>
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Wallet Details</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Text>Address: {walletAddress}</Text>
                  <Text>Balance: {balance} ETH</Text>
                </ModalBody>
                <ModalFooter>
                  <Button colorScheme="red" mr={3} onClick={() => {
                    setWalletAddress('');
                    onClose();
                  }}>
                    Disconnect
                  </Button>
                  <Button variant="ghost" onClick={onClose}>Close</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        ) : (
          <Button colorScheme="blue" onClick={connectWallet}>Connect Wallet</Button>
        )}
      </Box>
    </Flex>
  );
};

export default Navbar;
