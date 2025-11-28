import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function GroupDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Group Detail: {id}</Text>
    </View>
  );
}
