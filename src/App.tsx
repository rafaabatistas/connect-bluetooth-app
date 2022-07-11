import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NativeBaseProvider } from 'native-base';

import { Home } from './screens/Home/Home';

export default function App() {
  return (
    <NativeBaseProvider>
      <StatusBar backgroundColor="transparent" style="dark" />
      <Home />
    </NativeBaseProvider>
  );
}
