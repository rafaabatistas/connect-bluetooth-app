import { useState, useEffect } from 'react';
import { PermissionsAndroid } from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';
import {
  Box,
  Text,
  Heading,
  Flex,
  Divider,
  Switch,
  Button,
  Toast,
  Spinner,
  FlatList,
  HStack,
  Avatar,
  Spacer,
  VStack
} from 'native-base';

export const Home = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice>({} as BluetoothDevice);
  const [loading, setLoading] = useState(false);
  const [formInputs, setFormInputs] = useState(false);

  const requestAccessFineLocationPermission = async () => {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
      title: 'Access fine location required for discovery',
      message: 'In order to perform discovery, you must enable/allow ' + 'fine location access.',
      buttonNeutral: 'Ask Me Later',
      buttonNegative: 'Cancel',
      buttonPositive: 'OK'
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const getBondedDevices = async () => {
    console.log('DeviceListScreen::getBondedDevices');
    try {
      const bonded = await RNBluetoothClassic.getBondedDevices();
      console.log('DeviceListScreen::getBondedDevices found');

      setLoading(true);
      setDevices(bonded);
    } catch (error) {
      setDevices([]);

      Toast.show({
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const checkBluetootEnabled = async () => {
    try {
      console.log('App::componentDidMount Checking bluetooth status');
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();

      console.log(`App::componentDidMount Status: ${enabled}`);
      setIsChecked(enabled);
    } catch (error) {
      console.log('App::componentDidMount Status Error: ', error);
      setIsChecked(false);
    }
  };

  const startDiscovery = async () => {
    try {
      const granted = await requestAccessFineLocationPermission();

      if (!granted) {
        throw new Error('Access fine location was not granted');
      }

      setLoading(true);

      const listDevices = [...devices];

      try {
        const unpaired = await RNBluetoothClassic.startDiscovery();

        unpaired.forEach(async (device) => {
          const connected = await device.isConnected();
          if (connected) {
            await device.disconnect();
          }
        });
        console.log(unpaired);
        listDevices.push(...unpaired);
        Toast.show({
          description: `Found ${unpaired.length} unpaired devices.`,
          duration: 2000
        });
      } finally {
        setLoading(false);
        setDevices(listDevices);
      }
    } catch (error) {
      console.log('error', error);
      Toast.show({
        description: 'Habilite o bluetooth',
        duration: 2000
      });
    }
  };

  const connect = async (device) => {
    try {
      console.log('connect');
      const a = await device.connect();

      console.log(a);

      setConnectedDevice(device);
    } catch (err) {
      console.log(err);
      Toast.show({
        description: 'Verifique se o dispositivo está ligado',
        duration: 2000
      });
    }
  };

  const onStateChanged = (stateChangedEvent) => {
    console.log('App::onStateChanged event used for onBluetoothEnabled and onBluetoothDisabled');

    setIsChecked(stateChangedEvent.enabled);
  };

  const read = async () => {
    try {
      const message = await connectedDevice.read();
      console.log(message);
      // setFormInputs(message);
    } catch (error) {
      console.log(error);
    }
  };

  const onReceivedData = async (data) => {
    console.log('onReceivedData', data);
    setFormInputs(true);
  };

  useEffect(() => {
    console.log(connectedDevice.id);
    if (connectedDevice.id === undefined) {
      return;
    }
    let intervalId = '0';

    const isConnected = async () => await connectedDevice.isConnected();
    const isAvailable = async () => await connectedDevice.available();
    isConnected()
      .then((res) => {
        console.log('isConnected', res);
        console.log('bonded', connectedDevice.bonded);
      })
      .catch((err) => console.log('err isConnected', err));

    isAvailable()
      .then((res) => {
        console.log('available', res);
        // if (res) {
        intervalId = setInterval(async () => {
          const message = await connectedDevice.read();
          // console.log(connectedDevice.address);
          console.log('message', message);
          await connectedDevice.clear();
        }, 800);
        // }
      })
      .catch((err) => {
        console.log('err available', err);
        if (intervalId !== '0') {
          clearInterval(intervalId);
        }
      });

    // connectedDevice.onDataReceived((data) => onReceivedData(data));
    return () => {
      if (intervalId !== '0') {
        clearInterval(intervalId);
      }
    };
  }, [connectedDevice]);

  useEffect(() => {
    const enabledSubscription = RNBluetoothClassic.onBluetoothEnabled((e) => onStateChanged(e));
    const disabledSubscription = RNBluetoothClassic.onBluetoothDisabled((e) => onStateChanged(e));
    const errorSubscription = RNBluetoothClassic.onError((error) => console.log(error));

    checkBluetootEnabled();

    return () => {
      enabledSubscription.remove();
      disabledSubscription.remove();
      errorSubscription.remove();
    };
  }, []);

  const data = [{ id: '00:34', name: 'HC-05' }];

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
        {/* <Input /> */}
        <Text>{formInputs ? 'Recebi dados' : 'Não recebi dados'}</Text>
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
