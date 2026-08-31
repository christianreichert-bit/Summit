import { ExpoRoot } from "expo-router";

/**
 * Snack requires a root App file for Expo Router projects.
 * Local `expo start` uses this entry via package.json `"main": "./App"`.
 */
export default function App() {
  return <ExpoRoot context={require.context("./app")} />;
}
