/**
 * Settle route index
 * Redirects to home if accessed directly
 */

import { Redirect } from 'expo-router';

export default function SettleIndex() {
  return <Redirect href="/(tabs)" />;
}
