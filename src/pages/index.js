import { Box, Button, Text, VStack, Image, Container } from '@chakra-ui/react';
import Navbar from '../components/navbar';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';

function HomePage() {
  const router = useRouter();

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        console.log("Connected account:", await signer.getAddress());
        router.push('/dashboard');  
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert('Failed to connect the wallet. Please try again.');
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <Box textAlign="center" fontSize="xl" w="100%" h="100vh" bgGradient="radial-gradient(circle at 50% 50%, #3A8BCD, #8BC4D0 50%, #2F8F83 75%, #0D324D)">
      <Navbar />
      <VStack spacing={4} justify="center" align="center" h="full" position="relative">
        <Image src="/logosimple.png" alt="Cryptonic Compute Logo" boxSize="250px" />
        <Container position="absolute" top="50%" transform="translateY(-20%)" padding="20">
          <Text fontSize="4xl" fontWeight="bold" color="white" mt="-5">Cryptonic Compute</Text>
          <Text fontSize="md" color="gray.200">Decentralized computation at your fingertips.</Text>
          
        </Container>
        <Button colorScheme="blue" size="lg" onClick={connectWallet} mt="1%">
          Connect Wallet
        </Button>
      </VStack>
    </Box>
  );
}

export default HomePage;
