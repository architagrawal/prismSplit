/**
 * Group route index
 * Redirects to groups tab if accessed directly
 */

import { Redirect } from 'expo-router';

export default function GroupIndex() {
  return <Redirect href={"/(tabs)/groups" as any} />;
}
