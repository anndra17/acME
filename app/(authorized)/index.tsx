import { Redirect } from "expo-router";
import { useSession } from "@/../context";

export default function Index() {
  const { userRole } = useSession();

  console.log("Sunt in pagina: (auth)/index.tsx, userRole:", userRole);

  if (!userRole) return null; // sau un loader

  if (userRole === "user" || userRole === "moderator" || userRole === "doctor") {
    return <Redirect href="./(authorized)/(drawer)/(tabs)/" />;
  }
  
  if (userRole === "admin") {
    return <Redirect href="./(authorized)/(drawer)/(tabs)/admin/" />;
  }

  // fallback
  return <Redirect href="./(authorized)/(drawer)/(tabs)/" />;
}