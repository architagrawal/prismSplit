/**
 * Bill route index
 * Redirects to tabs if accessed directly
 */

import { Redirect } from 'expo-router';

export default function BillIndex() {
  return <Redirect href="/(tabs)" />;
}
