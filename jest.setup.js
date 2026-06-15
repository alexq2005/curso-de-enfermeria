// async-storage v3: el mock oficial (export './jest') es ESM-only y jest no lo
// transforma (node_modules ignorado) → "Unexpected token 'export'". Usamos un
// mock in-memory propio, funcionalmente equivalente al oficial.
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    setItem: jest.fn((k, v) => {
      store[k] = v;
      return Promise.resolve();
    }),
    getItem: jest.fn(k => Promise.resolve(k in store ? store[k] : null)),
    removeItem: jest.fn(k => {
      delete store[k];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      store = {};
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
    multiGet: jest.fn(keys =>
      Promise.resolve(keys.map(k => [k, k in store ? store[k] : null])),
    ),
    multiSet: jest.fn(pairs => {
      pairs.forEach(([k, v]) => {
        store[k] = v;
      });
      return Promise.resolve();
    }),
    multiRemove: jest.fn(keys => {
      keys.forEach(k => delete store[k]);
      return Promise.resolve();
    }),
  };
});

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const { Text } = require('react-native');
  return props => <Text>{props.name}</Text>;
});

jest.mock('react-native-linear-gradient', () => {
  const { View } = require('react-native');
  return props => <View {...props} />;
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
  useIsFocused: () => true,
  createNavigatorFactory: jest.fn(),
  useNavigationState: jest.fn(),
  DefaultTheme: {
    colors: {
      background: '#fff',
      card: '#fff',
      text: '#000',
      border: '#ccc',
      primary: '#6200ee',
      notification: '#f00',
    },
  },
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));
