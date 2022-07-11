import { useState } from 'react';
import { Box, Text, Heading, Flex, Divider, Switch } from 'native-base';

export const Home = () => {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <Flex align="center" justifyContent="flex-start" p={5} height="full" safeArea>
      <Box width="full">
        <Heading textAlign="left" width="full">
          Bluetooth
        </Heading>
      </Box>
      <Box width="full" mt={3} flexDirection="row" justifyContent="space-between">
        <Heading size="md">On</Heading>
        <Switch size="lg" isChecked={isChecked} onToggle={() => setIsChecked(!isChecked)} />
      </Box>
      <Box width="full" mt={3} flexDirection="row" alignItems="center">
        <Text fontSize="md">Lista de dispositivos</Text>
        <Divider mx="1" />
      </Box>
    </Flex>
  );
};
