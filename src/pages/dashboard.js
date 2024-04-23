import { Box, Flex, Text, Heading, SimpleGrid, Badge, Stat, StatLabel, StatNumber, StatHelpText, StatGroup } from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Navbar from '../components/navbar';

const data = [
    { name: "Task 1", value: 4000, pv: 2400, amt: 2400 },
    { name: "Task 2", value: 3000, pv: 1398, amt: 2210 },
    { name: "Task 3", value: 2000, pv: 9800, amt: 2290 },
    { name: "Task 4", value: 2780, pv: 3908, amt: 2000 },
    { name: "Task 5", value: 1890, pv: 4800, amt: 2181 },
    { name: "Task 6", value: 2390, pv: 3800, amt: 2500 },
    { name: "Task 7", value: 3490, pv: 4300, amt: 2100 },
];

const pieData = [
    { name: "Completed", value: 400 },
    { name: "In Progress", value: 300 },
    { name: "Failed", value: 300 },
    { name: "Pending", value: 100 },
];

const COLORS = ['#0088FE', '#007B4F', '#FFBB28', '#FF8042']; 

function Dashboard() {
    return (
        <Box bg="linear-gradient(135deg, #3A8BCD 0%, #8BC4D0 50%, #2F8F83 100%)" minH="100vh">
            <Navbar />
            <Flex direction="column" p={5} pt={20}>
                <Heading mb={5}>Dashboard</Heading>
                <Text mb={2} fontSize="xl">
                    User Role: <Badge ml={2} colorScheme="green">Developer</Badge>
                </Text>
                <StatGroup mb={5}>
                    <Stat>
                        <StatLabel>Total Computations</StatLabel>
                        <StatNumber>7</StatNumber>
                        <StatHelpText>2023 Data</StatHelpText>
                    </Stat>
                    <Stat>
                        <StatLabel>Successful Computations</StatLabel>
                        <StatNumber>5</StatNumber>
                        <StatHelpText>2023 Successful</StatHelpText>
                    </Stat>
                </StatGroup>
                <SimpleGrid columns={2} spacing={10} width="full" maxW="1200px">
                    <Box boxShadow="xl" p="6" rounded="md" bg="whiteAlpha.300" backdropFilter="blur(10px)">
                        <Text mb={3} fontWeight="bold">Computation Tasks Overview</Text>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="pv" stroke="#007B4F" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                    <Box boxShadow="xl" p="6" rounded="md" bg="whiteAlpha.300" backdropFilter="blur(10px)">
                        <Text mb={3} fontWeight="bold">Task Status Distribution</Text>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                     outerRadius={80} fill="#8884d8" dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </SimpleGrid>
            </Flex>
        </Box>
    );
}

export default Dashboard;
