import { useState, useEffect } from 'react';
import { PermissionsAndroid } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice, BluetoothDeviceReadEvent } from 'react-native-bluetooth-classic';
import {
  Box,
  Text,
  Heading,
  Flex,
  Divider,
  Switch,
  Button,
  Toast,
  Input,
  Spinner,
  FlatList,
  HStack,
  Avatar,
  Spacer,
  VStack
} from 'native-base';

type StateChangeEvent = {
  enabled: boolean;
};

export const Home = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice>({} as BluetoothDevice);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const requestAccessBluetoothConnect = async () => {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
      title: 'O acesso ao bluetooth é obrigátorio para a busca de dispositivos',
      message:
        'Permitir que Connect Bluetooth App encontre, conecte-se e determine a posição relativa de dispositivos por perto?',
      buttonNeutral: 'Pergunte-me mais tarde',
      buttonNegative: 'Não permitir',
      buttonPositive: 'Permitir'
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const getBondedDevices = async () => {
    try {
      const granted = await requestAccessBluetoothConnect();

      if (!granted) {
        Toast.show({ description: 'Sem permissão', duration: 2000 });
        throw new Error('Access fine location was not granted');
      }

      const bonded = await RNBluetoothClassic.getBondedDevices();

      setLoading(true);
      setDevices(bonded);
    } catch (err) {
      console.log(err);
      setDevices([]);
      Toast.show({
        description: 'Erro ao listar dispositivos pareados, verifique se o Bluetooth está ativo'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkBluetootEnabled = async () => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();

      setIsChecked(enabled);
    } catch (err) {
      console.log('BrluetootEnabled Error: ', err);
      setIsChecked(false);
    }
  };

  const disconnect = async (device: BluetoothDevice) => {
    try {
      const disconnected = await device.disconnect();
      if (disconnected) {
        setConnectedDevice({} as BluetoothDevice);
      }
    } catch (err) {
      console.log(err);
      Toast.show({
        description: 'Erro ao desconectar dispositivo',
        duration: 2000
      });
    }
  };

  const connect = async (device: BluetoothDevice) => {
    try {
      const connected = await device.connect({ delimiter: '' });
      if (connected) {
        setConnectedDevice(device);
      }
    } catch (err) {
      console.log(err);
      Toast.show({
        description: 'Verifique se o dispositivo está ligado',
        duration: 2000
      });
    }
  };

  const onStateChanged = (stateChangedEvent: StateChangeEvent) => {
    setIsChecked(stateChangedEvent.enabled);
  };

  const onReceivedData = async (e: BluetoothDeviceReadEvent) => {
    console.log('onReceivedData', e);
    setInputValue(e.data);
  };

  useEffect(() => {
    if (connectedDevice.id === undefined) {
      return;
    }

    const readSubscription = connectedDevice.onDataReceived((data) => onReceivedData(data));

    return () => {
      readSubscription.remove();
    };
  }, [connectedDevice]);

  useEffect(() => {
    const enabledSubscription = RNBluetoothClassic.onBluetoothEnabled((e) => onStateChanged(e));
    const disabledSubscription = RNBluetoothClassic.onBluetoothDisabled((e) => onStateChanged(e));
    const errorSubscription = RNBluetoothClassic.onError((error) => console.log('Error', error));

    checkBluetootEnabled();

    return () => {
      enabledSubscription.remove();
      disabledSubscription.remove();
      errorSubscription.remove();
    };
  }, []);

  return (
    <Flex align="center" justifyContent="flex-start" p={5} height="full" safeArea>
      <Box width="full">
        <Heading textAlign="left" width="full">
          Bluetooth
        </Heading>
      </Box>
      <Box width="full" mt={3} flexDirection="row" justifyContent="space-between">
        <Heading size="md">{isChecked ? 'On' : 'Off'}</Heading>
        <Switch size="lg" disabled={true} isChecked={isChecked} onToggle={() => setIsChecked(!isChecked)} />
      </Box>
      <Box width="full">
        <Button onPress={async () => await getBondedDevices()}>Procurar</Button>
      </Box>
      <Box width="full" mt={3} flexDirection="row" alignItems="center">
        <Input value={inputValue} isReadOnly />
      </Box>
      <Box width="full" mt={3} flexDirection="row" alignItems="center">
        Dispositivo conectado:{' '}
        {connectedDevice.id !== undefined && (
          <>
            <Text bold>{`${connectedDevice.name}-${connectedDevice.id.slice(0, 5).replace(':', '')}`}</Text>
            <Spacer />
            <Text onPress={async () => await disconnect(connectedDevice)}>Deconectar</Text>
          </>
        )}
      </Box>
      <Box width="full" mt={3} flexDirection="row" alignItems="center">
        <Text fontSize="md">Lista de dispositivos</Text>
        <Divider mx="1" />
      </Box>
      <Box width="full" mt={3} flexDirection="row" alignItems="center" justifyContent="center">
        {loading && <Spinner accessibilityLabel="Loading posts" />}
      </Box>
      {devices.length > 0 && (
        <Box width="full">
          <FlatList
            data={devices}
            renderItem={({ item }) => (
              <Box
                borderBottomWidth="1"
                _dark={{
                  borderColor: 'gray.600'
                }}
                borderColor="coolGray.200"
                pl="4"
                pr="5"
                py="2"
              >
                <HStack space={3} justifyContent="space-between">
                  <Avatar
                    size="48px"
                    source={{
                      uri: 'https://www.creativefabrica.com/wp-content/uploads/2019/03/Bluetooth-Icon-by-Kanggraphic-580x386.jpg'
                    }}
                  />
                  <VStack alignItems="center">
                    <Text
                      _dark={{
                        color: 'warmGray.50'
                      }}
                      color="coolGray.800"
                    >
                      {`${item.name}-${item.id.slice(0, 5).replace(':', '')}`}
                    </Text>
                  </VStack>
                  <Spacer />
                  <Text
                    fontSize="xs"
                    _dark={{
                      color: 'warmGray.50'
                    }}
                    color="coolGray.800"
                    alignSelf="flex-start"
                    bold
                    onPress={async () => await connect(item)}
                  >
                    Conectar
                  </Text>
                </HStack>
              </Box>
            )}
            keyExtractor={(item) => item.id}
          />
        </Box>
      )}
    </Flex>
  );
};
