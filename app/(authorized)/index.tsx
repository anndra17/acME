import { Redirect, useRouter } from "expo-router";

export default function Index() {
  return <Redirect href="./(authorized)/(drawer)/(tabs)/" />;
}